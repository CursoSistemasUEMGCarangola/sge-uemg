'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const unidadeSchema = z.object({
    nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
})

export async function createUnidade(prevState: any, formData: FormData) {
    const nome = formData.get("nome") as string

    const result = unidadeSchema.safeParse({ nome })

    if (!result.success) {
        return { error: result.error.flatten().fieldErrors.nome?.[0] || "Erro de validação" }
    }

    try {
        await prisma.unidadeAcademica.create({
            data: { nome: result.data.nome }
        })
        revalidatePath("/admin/unidades")
        return { success: "Unidade criada com sucesso!" }
    } catch (error) {
        console.error(error)
        return { error: "Erro ao criar unidade" }
    }
}

export async function deleteUnidade(id: number) {
    try {
        // Check for dependencies (Cursos)
        const count = await prisma.curso.count({ where: { unidadeId: id } })
        if (count > 0) {
            return { error: "Não é possível excluir unidade com cursos vinculados." }
        }

        await prisma.unidadeAcademica.delete({ where: { id } })
        revalidatePath("/admin/unidades")
        return { success: "Unidade excluída" }
    } catch (error) {
        console.error(error)
        return { error: "Erro ao excluir: verifique dependências" }
    }
}

export async function getUnidades() {
    return await prisma.unidadeAcademica.findMany({
        orderBy: { nome: 'asc' },
        include: { _count: { select: { cursos: true } } }
    })
}
