"use server"

import { getCurrentUserRole, createClient } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import { buildInternAlertHtml, InternAlertData } from "../email-templates"

export type EmailActionResult = {
    success: boolean;
    message?: string;
    error?: string;
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
        
        await sendEmail({
            to: contrato.aluno.profile.email,
            subject: `[SGE UEMG] Acompanhamento de Estágio - ${isDelayed ? 'Atenção: Atraso' : 'Próximos Passos'}`,
            html
        })

        return { success: true, message: "Alerta enviado com sucesso." }
    } catch (e: any) {
        console.error("Error processing contract email", e)
        return { success: false, error: e.message }
    }
}
