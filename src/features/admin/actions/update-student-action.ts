'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { adminStudentUpdateSchema } from '../schemas/admin-student-update-schema'
import { prisma } from '@/lib/prisma'
import { getCurrentUserRole } from '@/lib/auth'

export async function updateStudentAction(prevState: any, formData: FormData) {
    const rawData = Object.fromEntries(formData.entries())
    console.log("updateStudentAction called with payload:", { ...rawData, password: '[REDACTED]' })
    
    const role = await getCurrentUserRole()
    if (role !== 'ADMIN') {
        return { success: false, error: "Acesso negado." }
    }

    const validatedFields = adminStudentUpdateSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            success: false,
            error: "Dados inválidos.",
            fieldErrors: validatedFields.error.flatten().fieldErrors
        }
    }

    const { id, email, password, fullName, matricula, telefone, periodo } = validatedFields.data

    try {
        const adminClient = createAdminClient()

        // 1. Update DB Records
        await prisma.$transaction(async (tx) => {
            await tx.profile.update({
                where: { id },
                data: {
                    nomeCompleto: fullName,
                    email,
                    telefone
                }
            })

            await tx.aluno.update({
                where: { profileId: id },
                data: {
                    matricula,
                    periodoAtual: parseInt(periodo)
                }
            })
        })

        // 2. Update Auth User (Email/Password if provided)
        const updateData: any = {
            email,
            user_metadata: { full_name: fullName }
        }
        
        if (password && password.length >= 6) {
            updateData.password = password
        }

        const { error: authError } = await adminClient.auth.admin.updateUserById(
            id,
            updateData
        )

        if (authError) {
            console.error("Auth Update Error:", authError)
            return { 
                success: false, 
                error: "Dados do perfil salvos no banco, mas houve falha ao atualizar o login no Supabase: " + authError.message 
            }
        }

        return { success: true }

    } catch (error: any) {
        console.error("CRITICAL: Update Student Action failed:", error)
        return { success: false, error: error.message || "Erro interno ao atualizar aluno." }
    }
}
