'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const cursoSchema = z.object({
    nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    unidadeId: z.coerce.number().min(1, "Selecione uma unidade"),
})

export async function createCurso(prevState: any, formData: FormData) {
    const nome = formData.get("nome") as string
    const unidadeId = formData.get("unidadeId")

    const result = cursoSchema.safeParse({ nome, unidadeId })

    if (!result.success) {
        const errors = result.error.flatten().fieldErrors
        return { error: Object.values(errors).flat().join(", ") }
    }

    try {
        await prisma.curso.create({
            data: {
                nome: result.data.nome,
                unidadeId: result.data.unidadeId
            }
        })
        revalidatePath("/admin/cursos")
        return { success: "Curso criado com sucesso!" }
    } catch (error) {
        console.error(error)
        return { error: "Erro ao criar curso" }
    }
}

export async function deleteCurso(id: number) {
    try {
        // Check for dependencies (Alunos/Professores)
        const countAlunos = await prisma.aluno.count({ where: { cursoId: id } })
        const countProfs = await prisma.professor.count({ where: { cursoId: id } })

        if (countAlunos > 0 || countProfs > 0) {
            return { error: `Não é possível excluir: existem ${countAlunos} alunos e ${countProfs} professores vinculados.` }
        }

        await prisma.curso.delete({ where: { id } })
        revalidatePath("/admin/cursos")
        return { success: "Curso excluído" }
    } catch (error) {
        console.error(error)
        return { error: "Erro ao excluir curso" }
    }
}

export async function getCursos() {
    return await prisma.curso.findMany({
        orderBy: { nome: 'asc' },
        include: {
            unidade: true,
            _count: { select: { alunos: true, professores: true } }
        }
    })
}
