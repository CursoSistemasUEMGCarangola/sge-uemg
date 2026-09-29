"use server"

import { getCurrentUserRole, createClient } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import { buildInternAlertHtml, buildCustomProfessorMessageHtml, InternAlertData } from "../email-templates"

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
            to: contrato.aluno.profile.emailAlternativo || contrato.aluno.profile.email,
            subject: `[SGE - Sistemas de Informação] Acompanhamento de Estágio - ${isDelayed ? 'Atenção: Atraso' : 'Próximos Passos'}`,
            html
        })

        return { success: true, message: "Alerta enviado com sucesso." }
    } catch (e: any) {
        console.error("Error processing contract email", e)
        return { success: false, error: e.message }
    }
}

export interface SendCustomBulkMessageParams {
    contratoIds: number[];
    assunto?: string;
    mensagem: string;
    contextoFiltro?: string;
}

export async function sendCustomBulkMessageAction(params: SendCustomBulkMessageParams): Promise<EmailActionResult> {
    try {
        const { contratoIds, assunto, mensagem, contextoFiltro } = params;

        if (!mensagem || mensagem.trim().length < 3) {
            return { success: false, error: "A mensagem deve conter pelo menos 3 caracteres." };
        }

        if (!contratoIds || contratoIds.length === 0) {
            return { success: false, error: "Nenhum estágio selecionado para envio." };
        }

        const role = await getCurrentUserRole();
        if (role !== 'PROFESSOR' && role !== 'ADMIN') {
            throw new Error("Acesso negado: apenas professores ou administradores podem disparar comunicados.");
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        const prof = await prisma.professor.findUnique({
            where: { profileId: user.id },
            include: { profile: true, ofertas: true }
        });

        if (!prof && role === 'PROFESSOR') throw new Error("Perfil de professor não encontrado");

        const professorName = prof?.profile?.nomeCompleto || "Professor Orientador";
        const professorOfertaIds = prof?.ofertas.map(o => o.id) || [];

        // Buscar contratos alvos
        const contratos = await prisma.contratoEstagio.findMany({
            where: {
                id: { in: contratoIds },
                ...(role === 'PROFESSOR' ? { idOferta: { in: professorOfertaIds } } : {})
            },
            include: {
                aluno: { include: { profile: true } },
                oferta: { include: { curso: true } }
            }
        });

        if (contratos.length === 0) {
            return { success: false, error: "Nenhum contrato válido encontrado para o envio." };
        }

        let sentCount = 0;
        let errorsCount = 0;

        const emailSubject = assunto?.trim() 
            ? `[SGE] ${assunto.trim()}`
            : `[SGE - Sistemas de Informação] Comunicado do Professor Orientador`;

        for (const contrato of contratos) {
            try {
                // Envia preferencialmente para o emailAlternativo; se inexistente, fallback para o email principal
                const targetEmail = contrato.aluno.profile.emailAlternativo?.trim() || contrato.aluno.profile.email;
                if (!targetEmail) {
                    errorsCount++;
                    continue;
                }

                const html = buildCustomProfessorMessageHtml({
                    professorName,
                    internName: contrato.aluno.profile.nomeCompleto,
                    courseName: contrato.oferta?.curso?.nome || "Estágio Supervisionado",
                    messageContent: mensagem.trim(),
                    filterContext: contextoFiltro
                });

                const result = await sendEmail({
                    to: targetEmail,
                    subject: emailSubject,
                    html
                });

                if (result.success) {
                    sentCount++;
                } else {
                    errorsCount++;
                }
            } catch (err) {
                console.error(`Erro ao enviar email para contrato ${contrato.id}:`, err);
                errorsCount++;
            }
        }

        if (sentCount === 0 && errorsCount > 0) {
            return { success: false, error: "Não foi possível enviar a mensagem para os alunos selecionados." };
        }

        return {
            success: true,
            message: `Mensagem enviada com sucesso para ${sentCount} ${sentCount === 1 ? 'aluno' : 'alunos'}!${errorsCount > 0 ? ` (${errorsCount} falhas)` : ''}`
        };
    } catch (error: any) {
        console.error("Erro no envio de mensagem personalizada:", error);
        return { success: false, error: error.message || "Erro inesperado ao enviar mensagens." };
    }
}

