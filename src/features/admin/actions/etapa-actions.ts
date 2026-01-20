"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getCurrentUserRole } from "@/lib/auth"
import { etapaSchema, EtapaFormData } from "../schemas/etapa-schema"

export async function upsertEtapa(data: EtapaFormData) {
    const role = await getCurrentUserRole()
    if (role !== 'ADMIN') throw new Error("Unauthorized")

    const validation = etapaSchema.safeParse(data)
    if (!validation.success) {
        return { error: "Dados inválidos" }
    }

    try {
        if (data.id) {
            // Update
            await prisma.etapaDefinicao.update({
                where: { id: data.id },
                data: {
                    numeroEtapa: data.numeroEtapa,
                    descricao: data.descricao,
                    orientacaoTextual: data.orientacaoTextual
                }
            })
        } else {
            // Create
            await prisma.etapaDefinicao.create({
                data: {
                    numeroEtapa: data.numeroEtapa,
                    descricao: data.descricao,
                    orientacaoTextual: data.orientacaoTextual
                }
            })
        }

        revalidatePath('/admin/etapas')
        return { success: true }
    } catch (error) {
        console.error("Erro ao salvar etapa:", error)
        return { error: "Erro ao salvar etapa." }
    }
}

export async function deleteEtapa(id: number) {
    const role = await getCurrentUserRole()
    if (role !== 'ADMIN') throw new Error("Unauthorized")

    try {
        await prisma.etapaDefinicao.delete({
            where: { id }
        })
        revalidatePath('/admin/etapas')
        return { success: true }
    } catch (error) {
        return { error: "Não é possível excluir etapa se houver estágios vinculados." }
    }
}
