"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { PrismaClient, StatusEtapa } from "@prisma/client"
import { NovoEstagioFormData, novoEstagioSchema } from "./schemas"
import { getCurrentUserRole, createClient } from "@/lib/auth"
import { isJanelaCadastroAberta } from "@/lib/system"

const prisma = new PrismaClient()

export async function createEstagio(data: NovoEstagioFormData) {
    // 1. Validate Input (Double check on server)
    const result = novoEstagioSchema.safeParse(data)
    if (!result.success) {
        return { error: "Dados inválidos. Verifique o formulário." }
    }

    // 2. Validate Janela Temporal
    const isOpen = await isJanelaCadastroAberta()
    if (!isOpen) {
        return { error: "O período de cadastro de novos estágios está fechado." }
    }

    // 3. Get Current User (Student)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Usuário não autenticado." }
    }

    // Fetch Aluno Record
    const aluno = await prisma.aluno.findUnique({
        where: { profileId: user.id }
    })

    if (!aluno) {
        return { error: "Perfil de aluno não encontrado." }
    }

    const { empresa, contrato } = result.data

    try {
        // 4. Transaction: Create Campo -> Create Contrato -> Create Acompanhamentos
        await prisma.$transaction(async (tx) => {
            // A. Create Campo
            const novoCampo = await tx.campoEstagio.create({
                data: {
                    razaoSocial: empresa.razaoSocial,
                    nomeFantasia: empresa.nomeFantasia,
                    telefoneContato: empresa.telefoneContato,
                    emailContato: empresa.emailContato,
                    supervisorNome: empresa.supervisorNome,
                    supervisorCargo: empresa.supervisorCargo,
                    supervisorAreaFormacao: empresa.supervisorAreaFormacao,
                    supervisorTitulacao: empresa.supervisorTitulacao,
                    supervisorTelefone: empresa.supervisorTelefone,
                    supervisorEmail: empresa.supervisorEmail
                }
            })

            // B. Create Contrato
            const novoContrato = await tx.contratoEstagio.create({
                data: {
                    idAluno: aluno.id,
                    idOferta: contrato.ofertaId,
                    idCampo: novoCampo.id,
                    modalidade: contrato.modalidade,
                    tipoDocumentacao: contrato.tipoDocumentacao,
                    atribuicoes: contrato.atribuicoes,
                    dataInicioPrevista: contrato.dataInicioPrevista,
                    cargaHorariaDiaria: contrato.cargaHorariaDiaria,
                    statusAprovacao: "PENDENTE"
                }
            })

            // C. Initialize 8 Steps
            // We need to fetch the definitions first or assumes IDs 1-8
            // Ideally we fetch active definitions
            const steps = await tx.etapaDefinicao.findMany()

            // This is safe because map is synchronous, but we need to await the createMany (not supported well in all transaction contexts? prefer create)
            // Actually createMany is safer for bulk
            await tx.acompanhamentoEtapa.createMany({
                data: steps.map(step => ({
                    idContrato: novoContrato.id,
                    idEtapaDef: step.id,
                    status: StatusEtapa.PENDENTE
                }))
            })
        })

    } catch (error) {
        console.error("Erro ao criar estágio:", error)
        return { error: "Erro interno ao salvar o estágio. Tente novamente." }
    }

    revalidatePath('/aluno')
    redirect('/aluno')
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
