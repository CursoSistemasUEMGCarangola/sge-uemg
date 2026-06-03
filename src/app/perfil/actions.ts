'use server'

import { createClient } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { prisma } from "@/lib/prisma"

export async function updateProfile(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Usuário não autenticado.' }
    }

    const nomeCompleto = formData.get('nome') as string
    const telefone = formData.get('telefone') as string
    const emailAlternativo = formData.get('emailAlternativo') as string

    if (!nomeCompleto || nomeCompleto.length < 3) {
        return { error: 'Nome completo inválido.' }
    }

    if (!emailAlternativo || !emailAlternativo.includes('@')) {
        return { error: 'E-mail alternativo inválido.' }
    }

    if (user.email && emailAlternativo.toLowerCase().trim() === user.email.toLowerCase().trim()) {
        return { error: 'O e-mail alternativo deve ser diferente do e-mail institucional.' }
    }

    try {
        await prisma.profile.update({
            where: { id: user.id },
            data: {
                nomeCompleto,
                emailAlternativo: emailAlternativo.trim(),
                // @ts-ignore
                telefone
            }
        })
    } catch (error) {
        console.error("Profile update error:", error)
        return { error: 'Erro ao atualizar perfil.' }
    }

    revalidatePath('/perfil')
    revalidatePath('/aluno/perfil')
    revalidatePath('/admin/perfil')
    revalidatePath('/aluno') // Update dashboard name
    revalidatePath('/admin') // Update dashboard name
    return { success: true }
}
