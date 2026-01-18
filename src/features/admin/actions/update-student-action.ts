'use server'

import { createClient } from '@supabase/supabase-js'
import { adminStudentUpdateSchema } from '../schemas/admin-student-update-schema'
import { prisma } from '@/lib/prisma'
import { getCurrentUserRole } from '@/lib/auth'

const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

export async function updateStudentAction(prevState: any, formData: FormData) {
    const role = await getCurrentUserRole()
    if (role !== 'ADMIN') {
        return { success: false, error: "Acesso negado." }
    }

    const rawData = Object.fromEntries(formData.entries())
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
            // Warning: DB updated but Auth might not be synced if error. 
            // Ideally should be consistent, but Auth API is external.
            return { success: true, warning: "Dados salvos, mas houve erro ao atualizar login: " + authError.message }
        }

        return { success: true }

    } catch (error) {
        console.error("Update Student Error:", error)
        return {
            success: false,
            error: `Erro interno: ${error instanceof Error ? error.message : String(error)}`
        }
    }
}
