'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { cursoSchema } from "../schemas/curso-schema"

export type CursoState = {
    success?: boolean
    error?: string
    fieldErrors?: {
        [key: string]: string[]
    }
}

export async function createCursoAction(prevState: any, formData: FormData): Promise<CursoState> {
    const rawData = Object.fromEntries(formData.entries())
    const validated = cursoSchema.safeParse(rawData)

    if (!validated.success) {
        return {
            success: false,
            error: "Erro de validação",
            fieldErrors: validated.error.flatten().fieldErrors
        }
    }

    try {
        await prisma.curso.create({
            data: {
                nome: validated.data.nome,
                unidadeId: validated.data.unidadeId
            }
        })
    } catch (error) {
        console.error("Erro ao criar curso:", error)
        return {
            success: false,
            error: "Erro ao criar curso."
        }
    }

    revalidatePath("/admin/cursos")
    redirect("/admin/cursos")
}

export async function updateCursoAction(id: number, prevState: any, formData: FormData): Promise<CursoState> {
    const rawData = Object.fromEntries(formData.entries())
    const validated = cursoSchema.safeParse(rawData)

    if (!validated.success) {
        return {
            success: false,
            error: "Erro de validação",
            fieldErrors: validated.error.flatten().fieldErrors
        }
    }

    try {
        await prisma.curso.update({
            where: { id },
            data: {
                nome: validated.data.nome,
                unidadeId: validated.data.unidadeId
            }
        })
    } catch (error) {
        console.error("Erro ao atualizar curso:", error)
        return {
            success: false,
            error: "Erro ao atualizar curso."
        }
    }

    revalidatePath("/admin/cursos")
    redirect("/admin/cursos")
}

export async function deleteCursoAction(id: number) {
    try {
        await prisma.curso.delete({
            where: { id }
        })
        revalidatePath("/admin/cursos")
        return { success: true }
    } catch (error) {
        console.error("Erro ao excluir curso:", error)
        // Check for dependencies if any (e.g. students, professors linked to course)
        return { success: false, error: "Erro ao excluir curso. Verifique se há alunos ou professores vinculados." }
    }
}
