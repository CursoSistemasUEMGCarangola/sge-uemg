'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const updateStageSchema = z.object({
    id: z.number(),
    descricao: z.string().min(1, "Descrição é obrigatória"),
    orientacaoTextual: z.string().min(1, "Orientação é obrigatória"),
    prazoDias: z.coerce.number().min(0, "Prazo deve ser maior ou igual a 0"),
    systemAction: z.string().nullable().optional()
})

export async function updateStageAction(formData: FormData) {
    const data = Object.fromEntries(formData.entries())

    const result = updateStageSchema.safeParse({
        id: parseInt(data.id as string),
        descricao: data.descricao,
        orientacaoTextual: data.orientacaoTextual,
        prazoDias: data.prazoDias,
        systemAction: data.systemAction || null
    })

    if (!result.success) {
        return { error: "Dados inválidos", details: result.error.flatten() }
    }

    try {
        await prisma.etapaDefinicao.update({
            where: { id: result.data.id },
            data: {
                descricao: result.data.descricao,
                orientacaoTextual: result.data.orientacaoTextual,
                prazoDias: result.data.prazoDias,
                systemAction: result.data.systemAction
            }
        })

        revalidatePath('/admin/etapas')
        return { success: true }
    } catch (error) {
        console.error("Erro ao atualizar etapa:", error)
        return { error: "Erro ao atualizar etapa no banco de dados." }
    }
}
