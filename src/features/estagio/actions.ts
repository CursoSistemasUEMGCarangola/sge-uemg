"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { StatusEtapa } from "@prisma/client"
import { NovoEstagioFormData, novoEstagioSchema } from "./schemas"
import { getCurrentUserRole, createClient } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isJanelaCadastroAberta } from "@/lib/system"

export async function createEstagio(data: NovoEstagioFormData) {
    console.log("SERVER ACTION: createEstagio START")

    // 1. Authentication & Validation
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        console.log("SERVER ACTION: User not authenticated")
        return { error: "Usuário não autenticado." }
    }
    console.log("SERVER ACTION: User authenticated", user.id)

    const validation = novoEstagioSchema.safeParse(data)
    if (!validation.success) {
        console.log("SERVER ACTION: Zod validation failed", JSON.stringify(validation.error.format(), null, 2))
        return { error: "Dados inválidos. Verifique o formulário." }
    }
    console.log("SERVER ACTION: Zod validation success")

    const { empresa, supervisor, estagio } = validation.data

    try {
        // 2. Fetch Student Profile
        const aluno = await prisma.aluno.findUnique({
            where: { profileId: user.id }
        })

        if (!aluno) {
            console.log("SERVER ACTION: Student profile not found for user", user.id)
            return { error: "Perfil de aluno não encontrado." }
        }
        console.log("SERVER ACTION: Student found", { id: aluno.id, periodo: aluno.periodoAtual })

        // 3. Find Active Offer for Student's Period
        // matching the student's current period.
        const oferta = await prisma.ofertaEstagio.findFirst({
            where: {
                ativo: true,
                curso: {
                    periodoVinculado: aluno.periodoAtual
                }
            },
            include: { curso: true } // just in case we need info
        })

        if (!oferta) {
            console.log(`SERVER ACTION: No active offer found for period ${aluno.periodoAtual}`)
            return { error: `Nenhuma oferta de estágio ativa encontrada para o ${aluno.periodoAtual}º período.` }
        }
        console.log("SERVER ACTION: Offer found", oferta.id)

        // 4. Create Internship (Transaction to ensure consistency)
        await prisma.$transaction(async (tx) => {
            console.log("SERVER ACTION: Starting transaction")
            // A. Create CampoEstagio (Company + Supervisor)
            const campo = await tx.campoEstagio.create({
                data: {
                    razaoSocial: empresa.razaoSocial,
                    nomeFantasia: empresa.nomeFantasia,
                    telefoneContato: empresa.telefone,
                    emailContato: empresa.email,
                    supervisorNome: supervisor.nome,
                    supervisorTelefone: supervisor.telefone,
                    supervisorEmail: supervisor.email,
                    supervisorCargo: supervisor.cargo,
                    supervisorAreaFormacao: supervisor.formacao,
                    supervisorTitulacao: supervisor.titulacao,
                }
            })
            console.log("SERVER ACTION: CampoEstagio created", campo.id)

            // B. Create ContratoEstagio
            const contrato = await tx.contratoEstagio.create({
                data: {
                    idAluno: aluno.id,
                    idOferta: oferta.id,
                    idCampo: campo.id,
                    modalidade: estagio.modalidade as any, // Cast to avoid stale type error
                    tipoDocumentacao: estagio.tipoDocumentacao as any, // Cast to avoid stale type error
                    dataInicioPrevista: estagio.dataInicio,
                    cargaHorariaDiaria: estagio.cargaHorariaDiaria,
                    atribuicoes: estagio.atribuicoes,
                    statusAprovacao: 'PENDENTE'
                }
            })
            console.log("SERVER ACTION: ContratoEstagio created", contrato.id)
        })

        console.log("SERVER ACTION: Transaction committed")
        revalidatePath('/aluno')
        return { success: true }

    } catch (error) {
        console.error("Error creating estagio:", error)
        return { error: "Ocorreu um erro ao salvar o estágio. Tente novamente." }
    }
}

export async function approveStage(contratoId: number, etapaId: number, feedback?: string) {
    const role = await getCurrentUserRole()
    if (role !== 'PROFESSOR' && role !== 'ADMIN') {
        throw new Error("Unauthorized")
    }

    // 1. Update Current Stage to Approved
    await prisma.acompanhamentoEtapa.updateMany({
        where: { idContrato: contratoId, idEtapaDef: etapaId },
        data: {
            status: 'APROVADO',
            dataConclusao: new Date(),
            observacoes: feedback
        }
    })

    // 2. Unlock Next Stage (if any)
    const nextStageDef = await prisma.etapaDefinicao.findFirst({
        where: { numeroEtapa: etapaId + 1 }
    })

    if (nextStageDef) {
        await prisma.acompanhamentoEtapa.updateMany({
            where: { idContrato: contratoId, idEtapaDef: nextStageDef.id },
            data: {
                status: 'PENDENTE' // Unlock: changes from PENDENTE (or future default) - logic here assumes created as PENDENTE but we might need a status 'BLOQUEADO' initially? 
                // In Phase 2, we created all as PENDENTE. Let's assume sequential approval just marks current as Done.
                // Improvement: We can set status 'EM_ANDAMENTO' for next.
            }
        })
    } else {
        // No next stage -> Contract Fully Approved?
        // Maybe update main contract status
        await prisma.contratoEstagio.update({
            where: { id: contratoId },
            data: { statusAprovacao: 'APROVADO' }
        })
    }

    revalidatePath(`/admin/estagios/${contratoId}`)
    return { success: true }
}

export async function rejectStage(contratoId: number, etapaId: number, feedback: string) {
    const role = await getCurrentUserRole()
    if (role !== 'PROFESSOR' && role !== 'ADMIN') {
        throw new Error("Unauthorized")
    }

    await prisma.acompanhamentoEtapa.updateMany({
        where: { idContrato: contratoId, idEtapaDef: etapaId },
        data: {
            status: 'REJEITADO',
            observacoes: feedback
        }
    })

    // Also update main contract status to indicate issues?
    await prisma.contratoEstagio.update({
        where: { id: contratoId },
        data: { statusAprovacao: 'PENDENTE' } // Keep as pending but specific stage is rejected
    })

    revalidatePath(`/admin/estagios/${contratoId}`)
    return { success: true }
}

export async function submitEtapaLink(contratoId: number, etapaId: number, link: string) {
    const role = await getCurrentUserRole()
    if (role !== 'ALUNO') {
        throw new Error("Unauthorized")
    }

    if (!link || !link.startsWith('http')) {
        return { error: "Link inválido. Certifique-se de incluir http:// ou https://" }
    }

    // Update Stage: Link + Status EM_ANALISE
    await prisma.acompanhamentoEtapa.updateMany({
        where: { idContrato: contratoId, idEtapaDef: etapaId },
        data: {
            linkDocumento: link,
            status: 'EM_ANALISE',
            observacoes: null
        }
    })

    revalidatePath('/aluno')
    return { success: true }
}

export async function logAtividade(contratoId: number, data: Date, horas: number, descricao: string) {
    const role = await getCurrentUserRole()
    if (role !== 'ALUNO') throw new Error("Unauthorized")

    // 1. Validate Hours
    if (horas < 1 || horas > 6) {
        return { error: "Carga horária diária deve ser entre 1 e 6 horas." }
    }

    // 2. Validate Weekend
    const day = data.getDay()
    if (day === 0 || day === 6) {
        return { error: "Não é permitido registrar atividades em sábados ou domingos." }
    }

    // 3. Validate Holiday/Recess
    const feriado = await prisma.feriadoRecesso.findFirst({
        where: { data: data }
    })
    if (feriado) {
        return { error: `Data inválida: ${feriado.descricao} (${feriado.tipo})` }
    }

    // 4. Check for duplicates
    // Actually, we might allow multiple entries per day as long as total hours <= 6?
    // Rule says "carga horária diária a ser cumprida... exatamente 1h...6h".
    // Let's assume one entry per day for simplicity or sum hours.
    // The business rule implies "activities realized at EACH DAY".
    // Let's check if entry already exists
    const existing = await prisma.diarioAtividade.findFirst({
        where: { idContrato: contratoId, dataAtividade: data }
    })

    if (existing) {
        // Update? Or Block? Let's Block for now to keep simple, or Update.
        // Let's allow updating description/hours? No, simpler to return error "Already logged".
        return { error: "Já existe atividade lançada para esta data." }
    }

    await prisma.diarioAtividade.create({
        data: {
            idContrato: contratoId,
            dataAtividade: data,
            horasRealizadas: horas,
            descricaoAtividades: descricao
        }
    })

    revalidatePath('/aluno')
    return { success: true }
}

export async function deleteAtividade(id: number) {
    const role = await getCurrentUserRole()
    if (role !== 'ALUNO') throw new Error("Unauthorized")

    // Check ownership TODO

    await prisma.diarioAtividade.delete({ where: { id } })
    revalidatePath('/aluno')
    return { success: true }
}

export async function submitRelatorio(contratoId: number, etapaId: number, texto: string) {
    const role = await getCurrentUserRole()
    if (role !== 'ALUNO') throw new Error("Unauthorized")

    if (!texto || texto.length < 50) {
        return { error: "O relatório deve ter pelo menos 50 caracteres." }
    }

    // Update Contract and Stage
    await prisma.$transaction([
        prisma.contratoEstagio.update({
            where: { id: contratoId },
            data: { textoRelatorioAvaliacao: texto }
        }),
        prisma.acompanhamentoEtapa.updateMany({
            where: { idContrato: contratoId, idEtapaDef: etapaId },
            data: {
                status: 'EM_ANALISE',
                observacoes: null
            }
        })
    ])

    revalidatePath('/aluno')
    return { success: true }
}
