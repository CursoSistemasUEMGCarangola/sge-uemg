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

    const periodoStr = formData.get('periodo') as string

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

        if (periodoStr) {
            const aluno = await prisma.aluno.findUnique({ where: { profileId: user.id } })
            if (aluno) {
                const contratosAtivos = await prisma.contratoEstagio.count({
                    where: { idAluno: aluno.id, statusAprovacao: { in: ['PENDENTE', 'ATIVO'] } }
                })

                if (contratosAtivos > 0) {
                    return { error: 'Bloqueio de Segurança: Não é possível alterar o período enquanto houver um contrato de estágio ativo ou pendente.' }
                }

                const periodo = parseInt(periodoStr, 10)
                if (!isNaN(periodo) && periodo > 0 && periodo <= 10) {
                    await prisma.aluno.update({
                        where: { id: aluno.id },
                        data: { periodoAtual: periodo }
                    })
                }
            }
        }
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
