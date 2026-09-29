"use server"

import { z } from "zod"
import { getCurrentUserRole, createClient } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import { buildInternAlertHtml, buildCustomProfessorMessageHtml, InternAlertData } from "../email-templates"

export type EmailActionResult = {
    success: boolean;
    message?: string;
    error?: string;
}

/**
 * Resolução com prioridade para emailAlternativo com fallback seguro para email principal
 */
export function resolveStudentRecipientEmail(profile: { email: string; emailAlternativo?: string | null }): string | null {
    const alt = profile.emailAlternativo?.trim()
    if (alt && alt.length > 0) return alt
    const main = profile.email?.trim()
    return main && main.length > 0 ? main : null
}

async function ensureProfessorHasAccess(ofertaId?: number): Promise<number[]> {
    const role = await getCurrentUserRole()
    if (role !== 'PROFESSOR') throw new Error("Acesso negado: apenas professores podem disparar alertas.")

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Usuário não autenticado")

    const prof = await prisma.professor.findUnique({
        where: { profileId: user.id },
        include: { ofertas: true }
    })

    if (!prof) throw new Error("Perfil de professor não encontrado")

    // Filter by specific oferta or use all
    let targetOfertas = prof.ofertas.map(o => o.id)
    if (ofertaId) {
        if (!targetOfertas.includes(ofertaId)) {
            throw new Error("Oferta não pertence a este professor.")
        }
        targetOfertas = [ofertaId]
    }

    return targetOfertas
}

export async function sendBulkAlertsAction(ofertaId?: number): Promise<EmailActionResult> {
    try {
        const targetOfertas = await ensureProfessorHasAccess(ofertaId)

        // Find all active contracts for these offers
        const contratos = await prisma.contratoEstagio.findMany({
            where: {
                idOferta: { in: targetOfertas },
                statusAprovacao: 'ATIVO',
                dataConclusaoEstagio: null
            },
            include: {
                aluno: { include: { profile: true } },
                oferta: { include: { curso: { include: { curso: { include: { unidade: true } } } } } },
                campo: true,
                acompanhamentos: {
                    include: { etapaDef: true },
                    orderBy: { etapaDef: { numeroEtapa: 'asc' } }
                }
            }
        })

        if (contratos.length === 0) {
            return { success: false, error: "Nenhum estagiário ativo encontrado para envio." }
        }

        let sentCount = 0;
        let errorsCount = 0;

        for (const contrato of contratos) {
            const result = await processEmailForContract(contrato)
            if (result.success) sentCount++;
            else errorsCount++;
        }

        return {
            success: true,
            message: `Alertas enviados com sucesso! Foram enviados ${sentCount} e-mails. (${errorsCount} falhas)`
        }

    } catch (error: any) {
        console.error("Erro no envio em lote:", error)
        return { success: false, error: error.message || "Erro desconhecido ao enviar e-mails." }
    }
}

export async function sendSingleAlertAction(contratoId: number): Promise<EmailActionResult> {
    try {
        const role = await getCurrentUserRole()
        if (role !== 'PROFESSOR' && role !== 'ADMIN') {
            throw new Error("Acesso negado")
        }

        const contrato = await prisma.contratoEstagio.findUnique({
            where: { id: contratoId },
            include: {
                aluno: { include: { profile: true } },
                oferta: { include: { curso: { include: { curso: { include: { unidade: true } } } } } },
                campo: true,
                acompanhamentos: {
                    include: { etapaDef: true },
                    orderBy: { etapaDef: { numeroEtapa: 'asc' } }
                }
            }
        })

        if (!contrato) {
            return { success: false, error: "Contrato não encontrado" }
        }

        if (role === 'PROFESSOR') {
            const supabase = await createClient()
            const { data: { user } } = await supabase.auth.getUser()
            const prof = await prisma.professor.findUnique({ where: { profileId: user?.id } })
            if (!prof || contrato.oferta.professorOrientadorId !== prof.id) {
                return { success: false, error: "Contrato não pertence a você" }
            }
        }

        const result = await processEmailForContract(contrato)
        return result

    } catch (error: any) {
        console.error("Erro no envio individual:", error)
        return { success: false, error: error.message || "Erro desconhecido ao enviar e-mail." }
    }
}

// Helper to build data and send email for a single contract
async function processEmailForContract(contrato: any): Promise<EmailActionResult> {
    try {
        const acompanhamentos = contrato.acompanhamentos;
        const firstPending = acompanhamentos.find((a: any) =>
            a.status === 'PENDENTE' || a.status === 'EM_ANALISE' || a.status === 'REJEITADO'
        )

        // If there's no pending stage, maybe they just finished? Skip or send 'completed'
        if (!firstPending) {
            return { success: false, error: "Estágio não possui etapas pendentes." }
        }

        const isDelayed = firstPending.dataLimite && new Date() > new Date(firstPending.dataLimite)

        // Gather observations
        const observations: string[] = []
        if (contrato.observacoesProfessor) {
            observations.push(`Geral: ${contrato.observacoesProfessor}`)
        }
        if (firstPending.observacoes) {
            observations.push(`Etapa atual: ${firstPending.observacoes}`)
        }

        const alertData: InternAlertData = {
            internName: contrato.aluno.profile.nomeCompleto,
            courseName: contrato.oferta.curso.nome,
            companyName: contrato.campo.nomeFantasia,
            nextStepLabel: `Etapa ${firstPending.etapaDef.numeroEtapa}`,
            nextStepDescription: firstPending.etapaDef.descricao,
            isDelayed: !!isDelayed,
            observations
        }

        const html = buildInternAlertHtml(alertData)

        const targetEmail = resolveStudentRecipientEmail(contrato.aluno.profile)
        if (!targetEmail) {
            return { success: false, error: "Aluno não possui e-mail válido cadastrado." }
        }

        await sendEmail({
            to: targetEmail,
            subject: `[SGE - Sistemas de Informação] Acompanhamento de Estágio - ${isDelayed ? 'Atenção: Atraso' : 'Próximos Passos'}`,
            html
        })

        return { success: true, message: "Alerta enviado com sucesso." }
    } catch (e: any) {
        console.error("Error processing contract email", e)
        return { success: false, error: e.message }
    }
}

export const sendCustomBulkMessageSchema = z.object({
    contratoIds: z.array(z.number().int().positive()).min(1, "Selecione ao menos um contrato para envio."),
    assunto: z.string().trim().max(120, "O assunto deve ter no máximo 120 caracteres.").optional(),
    mensagem: z.string().trim().min(5, "A mensagem deve conter pelo menos 5 caracteres.").max(4000, "A mensagem não pode exceder 4000 caracteres."),
    contextoFiltro: z.string().trim().max(200).optional(),
})

export type SendCustomBulkMessageParams = z.infer<typeof sendCustomBulkMessageSchema>

export async function sendCustomBulkMessageAction(params: SendCustomBulkMessageParams): Promise<EmailActionResult> {
    try {
        const parsed = sendCustomBulkMessageSchema.safeParse(params)
        if (!parsed.success) {
            const firstError = parsed.error.issues[0]?.message || "Parâmetros inválidos para envio."
            return { success: false, error: firstError }
        }

        const { contratoIds, assunto, mensagem, contextoFiltro } = parsed.data

        const role = await getCurrentUserRole()
        if (role !== 'PROFESSOR' && role !== 'ADMIN') {
            throw new Error("Acesso negado: apenas professores ou administradores podem disparar comunicados.")
        }

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Usuário não autenticado")

        const prof = await prisma.professor.findUnique({
            where: { profileId: user.id },
            include: { profile: true, ofertas: true }
        })

        if (!prof && role === 'PROFESSOR') throw new Error("Perfil de professor não encontrado")

        const professorName = prof?.profile?.nomeCompleto || "Professor Orientador"
        const professorOfertaIds = prof?.ofertas.map(o => o.id) || []

        // Buscar contratos alvos blindando IDOR (apenas contratos das ofertas do professor autenticado)
        const contratos = await prisma.contratoEstagio.findMany({
            where: {
                id: { in: contratoIds },
                ...(role === 'PROFESSOR' ? { idOferta: { in: professorOfertaIds } } : {})
            },
            include: {
                aluno: { include: { profile: true } },
                oferta: { include: { curso: true } }
            }
        })

        if (contratos.length === 0) {
            return { success: false, error: "Nenhum contrato válido encontrado para o envio." }
        }

        let sentCount = 0
        let errorsCount = 0

        const emailSubject = assunto
            ? `[SGE] ${assunto}`
            : `[SGE - Sistemas de Informação] Comunicado do Professor Orientador`

        for (const contrato of contratos) {
            try {
                const targetEmail = resolveStudentRecipientEmail(contrato.aluno.profile)
                if (!targetEmail) {
                    errorsCount++
                    continue
                }

                const html = buildCustomProfessorMessageHtml({
                    professorName,
                    internName: contrato.aluno.profile.nomeCompleto,
                    courseName: contrato.oferta?.curso?.nome || "Estágio Supervisionado",
                    messageContent: mensagem,
                    filterContext: contextoFiltro
                })

                const result = await sendEmail({
                    to: targetEmail,
                    subject: emailSubject,
                    html
                })

                if (result.success) {
                    sentCount++
                } else {
                    errorsCount++
                }
            } catch (err) {
                console.error(`Erro ao enviar email para contrato ${contrato.id}:`, err)
                errorsCount++
            }
        }

        if (sentCount === 0 && errorsCount > 0) {
            return { success: false, error: "Não foi possível enviar a mensagem para os alunos selecionados." }
        }

        return {
            success: true,
            message: `Mensagem enviada com sucesso para ${sentCount} ${sentCount === 1 ? 'aluno' : 'alunos'}!${errorsCount > 0 ? ` (${errorsCount} falhas)` : ''}`
        }
    } catch (error: any) {
        console.error("Erro no envio de mensagem personalizada:", error)
        return { success: false, error: error.message || "Erro inesperado ao enviar mensagens." }
    }
}


