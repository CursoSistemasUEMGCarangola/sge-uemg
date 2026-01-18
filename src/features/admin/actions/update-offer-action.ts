'use server'

import { prisma } from "@/lib/prisma"
import { adminOfferSchema } from "../schemas/admin-offer-schema"
import { z } from "zod"
import { getCurrentUserRole } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function updateOfferAction(prevState: any, formData: FormData) {
    const role = await getCurrentUserRole()

    if (role !== 'ADMIN') {
        return { success: false, error: "Acesso não autorizado." }
    }

    const data = Object.fromEntries(formData.entries())
    const id = Number(data.id)

    if (!id) {
        return { success: false, error: "ID da oferta não fornecido." }
    }

    const validatedFields = adminOfferSchema.safeParse(data)

    if (!validatedFields.success) {
        return {
            success: false,
            error: "Dados inválidos.",
            fieldErrors: validatedFields.error.flatten().fieldErrors
        }
    }

    const { cursoEstagioId, professorOrientadorId, semestreLetivo, dataInicio, dataFim } = validatedFields.data

    try {
        // Check for duplicates (excluding the current offer)
        const existingOffer = await prisma.ofertaEstagio.findFirst({
            where: {
                cursoEstagioId,
                semestreLetivo,
                ativo: true,
                id: { not: id }
            }
        })

        if (existingOffer) {
            return {
                success: false,
                error: "Já existe uma orientação para este estágio neste semestre."
            }
        }

        await prisma.ofertaEstagio.update({
            where: { id },
            data: {
                cursoEstagioId,
                professorOrientadorId,
                semestreLetivo,
                dataInicio,
                dataFim
            }
        })

        revalidatePath('/admin/ofertas')
        return { success: true }
    } catch (error) {
        console.error("Erro ao atualizar orientação de estágio:", error)
        return { success: false, error: "Erro ao atualizar orientação. Tente novamente." }
    }
}
