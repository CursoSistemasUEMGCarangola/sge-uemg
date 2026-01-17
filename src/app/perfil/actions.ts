'use server'

import { createClient } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Usuário não autenticado.' }
    }

    const nomeCompleto = formData.get('nome') as string
    const telefone = formData.get('telefone') as string

    if (!nomeCompleto || nomeCompleto.length < 3) {
        return { error: 'Nome completo inválido.' }
    }

    try {
        await prisma.profile.update({
            where: { id: user.id },
            data: {
                nomeCompleto,
                // @ts-ignore
                telefone
            }
        })
    } catch (error) {
        console.error("Profile update error:", error)
        return { error: 'Erro ao atualizar perfil.' }
    }

    revalidatePath('/perfil')
    revalidatePath('/aluno') // Update dashboard name
    revalidatePath('/admin') // Update dashboard name
    return { success: true }
}
