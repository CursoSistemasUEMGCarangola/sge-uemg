'use server'

import { prisma } from "@/lib/prisma"
import { adminOfferSchema } from "../schemas/admin-offer-schema"
import { z } from "zod"
import { getCurrentUserRole } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function createOfferAction(prevState: any, formData: FormData) {
    const role = await getCurrentUserRole()

    if (role !== 'ADMIN') {
        return { success: false, error: "Acesso não autorizado." }
    }

    const data = Object.fromEntries(formData.entries())
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
        const existingOffer = await prisma.ofertaEstagio.findFirst({
            where: {
                cursoEstagioId,
                semestreLetivo,
                ativo: true // Assuming we only care about active offers? Or all? User said "If it already has a professor".
            }
        })

        if (existingOffer) {
            return {
                success: false,
                error: "Já existe uma oferta para este estágio neste semestre."
            }
        }

        await prisma.ofertaEstagio.create({
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
        console.error("Erro ao criar oferta de estágio:", error)
        return { success: false, error: "Erro ao criar oferta. Tente novamente." }
    }
}
