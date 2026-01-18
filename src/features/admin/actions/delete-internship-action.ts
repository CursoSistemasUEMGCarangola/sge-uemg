'use server'

import { prisma } from "@/lib/prisma"
import { getCurrentUserRole } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function deleteInternshipAction(id: number) {
    const role = await getCurrentUserRole()

    if (role !== 'ADMIN') {
        return { success: false, error: "Acesso não autorizado." }
    }

    try {
        await prisma.cursoEstagio.delete({
            where: { id }
        })

        revalidatePath('/admin/estagios')
        return { success: true }
    } catch (error) {
        console.error("Erro ao excluir estágio:", error)
        // Check for common prisma error codes (e.g. Foreign Key constraint)
        // @ts-ignore
        if (error.code === 'P2003') {
            return {
                success: false,
                error: "Não é possível excluir este estágio pois existem ofertas ou contratos vinculados a ele."
            }
        }
        return { success: false, error: "Erro ao excluir estágio." }
    }
}
