"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getCurrentUserRole } from "@/lib/auth"

export async function completeStageAction(acompanhamentoId: number) {
    const role = await getCurrentUserRole()
    if (role !== 'ADMIN' && role !== 'PROFESSOR') {
        return { error: "Sem permissão para realizar esta ação." }
    }

    try {
        const acompanhamento = await prisma.acompanhamentoEtapa.findUnique({
            where: { id: acompanhamentoId },
            include: { contrato: true }
        })

        if (!acompanhamento) {
            return { error: "Etapa não encontrada." }
        }

        // Update status to ATIVO (Concluído)
        await prisma.acompanhamentoEtapa.update({
            where: { id: acompanhamentoId },
            data: {
                status: 'ATIVO',
                dataConclusao: new Date(),
                updatedAt: new Date()
            }
        })

        // Optional: Trigger next stage as PENDING if not already? 
        // Current logic seems to rely on finding the first non-ATIVO stage.
        // So just setting this one to ATIVO naturally 'unlocks' the next one in the UI find() logic.

        revalidatePath('/admin/estagios')
        revalidatePath(`/admin/estagios/${acompanhamento.contrato.id}`)
        revalidatePath('/aluno')

        return { success: true }
    } catch (error) {
        console.error("Erro ao concluir etapa:", error)
        return { error: "Erro ao concluir etapa." }
    }
}
