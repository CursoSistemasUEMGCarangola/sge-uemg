'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { unidadeSchema } from "../schemas/unidade-schema"
import { z } from "zod"

export type UnidadeState = {
    success?: boolean
    error?: string
    fieldErrors?: {
        [key: string]: string[]
    }
}

export async function createUnidadeAction(prevState: any, formData: FormData): Promise<UnidadeState> {
    const rawData = Object.fromEntries(formData.entries())
    const validated = unidadeSchema.safeParse(rawData)

    if (!validated.success) {
        return {
            success: false,
            error: "Erro de validação",
            fieldErrors: validated.error.flatten().fieldErrors
        }
    }

    try {
        await prisma.unidadeAcademica.create({
            data: {
                nome: validated.data.nome
            }
        })
    } catch (error) {
        console.error("Erro ao criar unidade:", error)
        return {
            success: false,
            error: "Erro ao criar unidade. Verifique se já existe."
        }
    }

    revalidatePath("/admin/unidades")
    redirect("/admin/unidades")
}

export async function updateUnidadeAction(id: number, prevState: any, formData: FormData): Promise<UnidadeState> {
    const rawData = Object.fromEntries(formData.entries())
    const validated = unidadeSchema.safeParse(rawData)

    if (!validated.success) {
        return {
            success: false,
            error: "Erro de validação",
            fieldErrors: validated.error.flatten().fieldErrors
        }
    }

    try {
        await prisma.unidadeAcademica.update({
            where: { id },
            data: {
                nome: validated.data.nome
            }
        })
    } catch (error) {
        console.error("Erro ao atualizar unidade:", error)
        return {
            success: false,
            error: "Erro ao atualizar unidade."
        }
    }

    revalidatePath("/admin/unidades")
    redirect("/admin/unidades")
}

export async function deleteUnidadeAction(id: number) {
    try {
        await prisma.unidadeAcademica.delete({
            where: { id }
        })
        revalidatePath("/admin/unidades")
        return { success: true }
    } catch (error) {
        console.error("Erro ao excluir unidade:", error)
        return { success: false, error: "Erro ao excluir unidade. Pode haver cursos vinculados." }
    }
}
