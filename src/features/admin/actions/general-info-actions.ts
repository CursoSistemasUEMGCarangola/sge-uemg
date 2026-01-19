'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const generalInfoSchema = z.object({
    id: z.coerce.number().optional(),
    categoria: z.string().min(1, "Categoria é obrigatória"),
    descricao: z.string().min(1, "Descrição é obrigatória"),
    ativo: z.boolean().default(true)
})

export async function createGeneralInfoAction(prevState: any, formData: FormData) {
    const data = Object.fromEntries(formData.entries())
    const validated = generalInfoSchema.safeParse(data)

    if (!validated.success) {
        return { success: false, error: "Dados inválidos.", message: null }
    }

    try {
        await prisma.informacoesGeraisEstagio.create({
            data: {
                categoria: validated.data.categoria,
                descricao: validated.data.descricao,
                ativo: true
            }
        })
        revalidatePath('/admin/configuracoes')
        return { success: true, message: "Item criado com sucesso!", error: null }
    } catch (error) {
        return { success: false, error: "Erro ao criar item.", message: null }
    }
}

export async function updateGeneralInfoAction(prevState: any, formData: FormData) {
    const data = Object.fromEntries(formData.entries())
    const validated = generalInfoSchema.safeParse(data)

    if (!validated.success || !validated.data.id) {
        return { success: false, error: "Dados inválidos.", message: null }
    }

    try {
        await prisma.informacoesGeraisEstagio.update({
            where: { id: validated.data.id },
            data: {
                descricao: validated.data.descricao
            }
        })
        revalidatePath('/admin/configuracoes')
        return { success: true, message: "Item atualizado com sucesso!", error: null }
    } catch (error) {
        return { success: false, error: "Erro ao atualizar item.", message: null }
    }
}

export async function deleteGeneralInfoAction(id: number) {
    try {
        await prisma.informacoesGeraisEstagio.delete({
            where: { id }
        })
        revalidatePath('/admin/configuracoes')
        return { success: true, message: "Item excluído com sucesso!" }
    } catch (error) {
        return { success: false, error: "Erro ao excluir item." }
    }
}

export async function toggleGeneralInfoStatusAction(id: number, currentStatus: boolean) {
    try {
        await prisma.informacoesGeraisEstagio.update({
            where: { id },
            data: { ativo: !currentStatus }
        })
        revalidatePath('/admin/configuracoes')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Erro ao alterar status." }
    }
}
