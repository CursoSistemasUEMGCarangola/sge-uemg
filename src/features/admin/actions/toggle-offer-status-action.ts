'use server'

import { prisma } from "@/lib/prisma"
import { getCurrentUserRole } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function toggleOfferStatusAction(id: number, currentStatus: boolean | null) {
    const role = await getCurrentUserRole()

    if (role !== 'ADMIN') {
        return { success: false, error: "Acesso não autorizado." }
    }

    try {
        await prisma.ofertaEstagio.update({
            where: { id },
            data: {
                ativo: !currentStatus
            }
        })

        revalidatePath('/admin/ofertas')
        return { success: true }
    } catch (error) {
        console.error("Erro ao alterar status da oferta:", error)
        return { success: false, error: "Erro ao atualizar status." }
    }
}
