"use server"

import { PrismaClient, TipoFeriado } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { getCurrentUserRole } from "@/lib/auth"

const prisma = new PrismaClient()

export async function addFeriado(data: Date, descricao: string, tipo: TipoFeriado) {
    const role = await getCurrentUserRole()
    if (role !== 'ADMIN' && role !== 'PROFESSOR') throw new Error("Unauthorized")

    try {
        await prisma.feriadoRecesso.create({
            data: {
                data,
                descricao,
                tipo
            }
        })
        revalidatePath('/admin/calendario')
        return { success: true }
    } catch (error) {
        return { error: "Erro ao adicionar data (possivelmente duplicada)." }
    }
}

export async function removeFeriado(id: number) {
    const role = await getCurrentUserRole()
    if (role !== 'ADMIN' && role !== 'PROFESSOR') throw new Error("Unauthorized")

    await prisma.feriadoRecesso.delete({ where: { id } })
    revalidatePath('/admin/calendario')
    return { success: true }
}

export async function getFeriados() {
    return await prisma.feriadoRecesso.findMany({
        orderBy: { data: 'asc' }
    })
}
