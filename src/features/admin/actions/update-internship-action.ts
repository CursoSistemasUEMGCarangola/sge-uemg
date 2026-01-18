'use server'

import { prisma } from "@/lib/prisma"
import { adminInternshipSchema } from "../schemas/admin-internship-schema"
import { z } from "zod"
import { getCurrentUserRole } from "@/lib/auth"

export async function updateInternshipAction(prevState: any, formData: FormData) {
    const role = await getCurrentUserRole()

    if (role !== 'ADMIN') {
        return { success: false, error: "Acesso não autorizado." }
    }

    const id = formData.get('id')
    if (!id) return { success: false, error: "ID do estágio não fornecido." }

    const data = Object.fromEntries(formData.entries())
    const validatedFields = adminInternshipSchema.safeParse(data)

    if (!validatedFields.success) {
        return {
            success: false,
            error: "Dados inválidos.",
            fieldErrors: validatedFields.error.flatten().fieldErrors
        }
    }

    const { nome, periodoVinculado, cargaHorariaTotal } = validatedFields.data

    try {
        await prisma.cursoEstagio.update({
            where: { id: Number(id) },
            data: {
                nome,
                periodoVinculado,
                cargaHorariaTotal
            }
        })

        return { success: true }
    } catch (error) {
        console.error("Erro ao atualizar estágio:", error)
        return { success: false, error: "Erro ao atualizar estágio. Tente novamente." }
    }
}
