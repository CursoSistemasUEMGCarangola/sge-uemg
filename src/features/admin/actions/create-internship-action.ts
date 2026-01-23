'use server'

import { prisma } from "@/lib/prisma"
import { adminInternshipSchema } from "../schemas/admin-internship-schema"
import { z } from "zod"
import { getCurrentUserRole } from "@/lib/auth"

export async function createInternshipAction(prevState: any, formData: FormData) {
    const role = await getCurrentUserRole()

    if (role !== 'ADMIN') {
        return { success: false, error: "Acesso não autorizado." }
    }

    const data = Object.fromEntries(formData.entries())
    const validatedFields = adminInternshipSchema.safeParse(data)

    if (!validatedFields.success) {
        return {
            success: false,
            error: "Dados inválidos.",
            fieldErrors: validatedFields.error.flatten().fieldErrors
        }
    }

    const { nome, periodoVinculado, cargaHorariaTotal, cursoId } = validatedFields.data

    try {
        await prisma.cursoEstagio.create({
            data: {
                nome,
                periodoVinculado,
                cargaHorariaTotal,
                cursoId
            }
        })

        return { success: true }
    } catch (error) {
        console.error("Erro ao criar estágio:", error)
        return { success: false, error: "Erro ao criar estágio. Tente novamente." }
    }
}
