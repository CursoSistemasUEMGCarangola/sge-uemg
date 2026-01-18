'use server'

import { prisma } from "@/lib/prisma"
import { getCurrentUserRole } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function deleteOfferAction(id: number) {
    const role = await getCurrentUserRole()

    if (role !== 'ADMIN') {
        return { success: false, error: "Acesso não autorizado." }
    }

    try {
        await prisma.ofertaEstagio.delete({
            where: { id }
        })

        revalidatePath('/admin/ofertas')
        return { success: true }
    } catch (error) {
        console.error("Erro ao excluir oferta:", error)
        // @ts-ignore
        if (error.code === 'P2003') {
            return {
                success: false,
                error: "Não é possível excluir esta oferta pois existem contratos vinculados a ela."
            }
        }
        return { success: false, error: "Erro ao excluir oferta." }
    }
}
