"use server"

import { getCurrentUserRole, createClient } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function encerrarOrientacaoAction(ofertaId: number) {
    const role = await getCurrentUserRole()
    if (role !== 'PROFESSOR' && role !== 'ADMIN') {
        return { error: "Sem permissão." }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Não autenticado." }

    // Verificar ownership da oferta se não for admin
    const oferta = await prisma.ofertaEstagio.findUnique({
        where: { id: ofertaId },
        include: {
            professor: true,
            contratos: {
                include: {
                    aluno: {
                        include: { profile: true }
                    },
                    acompanhamentos: {
                        include: { etapaDef: true },
                        orderBy: { etapaDef: { numeroEtapa: 'desc' } }
                    }
                }
            }
        }
    })

    if (!oferta) {
        return { error: "Oferta não encontrada." }
    }

    if (role === 'PROFESSOR' && oferta.professor.profileId !== user.id) {
        return { error: "Acesso negado: esta oferta não pertence a você." }
    }

    if (oferta.ativo === false) {
        return { error: "Esta oferta já está encerrada." }
    }

    // Criar o Snapshot JSON
    const dadosAlunos = oferta.contratos.map(contrato => {
        const etapaConcluida = contrato.acompanhamentos.find(acomp => acomp.status === 'ATIVO')
        return {
            idContrato: contrato.id,
            nomeAluno: contrato.aluno.profile.nomeCompleto,
            matricula: contrato.aluno.matricula,
            ultimaEtapa: etapaConcluida ? etapaConcluida.etapaDef.descricao : "Nenhuma etapa concluída",
            statusFinal: contrato.statusAprovacao
        }
    })

    const snapshot = {
        alunos: dadosAlunos,
        semestre: oferta.semestreLetivo,
        dataEncerramento: new Date().toISOString()
    }

    // Transação para consistência
    try {
        await prisma.$transaction(async (tx) => {
            // 1. Criar relatório de encerramento
            await tx.relatorioEncerramento.create({
                data: {
                    idOferta: ofertaId,
                    dadosSnapshot: snapshot
                }
            })

            // 2. Atualizar todos os contratos da oferta para ENCERRADO
            await tx.contratoEstagio.updateMany({
                where: { idOferta: ofertaId },
                data: { statusAprovacao: 'ENCERRADO' }
            })

            // 3. Atualizar a oferta para inativa
            await tx.ofertaEstagio.update({
                where: { id: ofertaId },
                data: { ativo: false }
            })
        })
    } catch (e) {
        console.error("Erro ao encerrar oferta", e)
        return { error: "Erro interno ao salvar encerramento." }
    }

    revalidatePath(`/professor/ofertas/${ofertaId}`)
    revalidatePath(`/professor`)
    
    return { success: true }
}
