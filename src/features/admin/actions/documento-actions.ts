"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getCurrentUserRole } from "@/lib/auth"
import { documentoSchema, DocumentoFormData } from "../schemas/documento-schema"

export async function upsertDocumento(data: DocumentoFormData) {
    const role = await getCurrentUserRole()
    if (role !== 'ADMIN' && role !== 'PROFESSOR') throw new Error("Unauthorized")

    const validation = documentoSchema.safeParse(data)
    if (!validation.success) {
        return { error: "Dados inválidos" }
    }

    try {
        if (data.id) {
            // Update
            await prisma.documentoModelo.update({
                where: { id: data.id },
                data: {
                    nomeArquivo: data.nomeArquivo,
                    urlLink: data.urlLink
                }
            })
        } else {
            // Create
            await prisma.documentoModelo.create({
                data: {
                    nomeArquivo: data.nomeArquivo,
                    urlLink: data.urlLink
                }
            })
        }

        revalidatePath('/admin/documentos')
        return { success: true }
    } catch (error) {
        console.error("Erro ao salvar documento:", error)
        return { error: "Erro ao salvar documento." }
    }
}

export async function deleteDocumento(id: number) {
    const role = await getCurrentUserRole()
    if (role !== 'ADMIN' && role !== 'PROFESSOR') throw new Error("Unauthorized")

    try {
        await prisma.documentoModelo.delete({
            where: { id }
        })
        revalidatePath('/admin/documentos')
        return { success: true }
    } catch (error) {
        return { error: "Erro ao excluir documento." }
    }
}
