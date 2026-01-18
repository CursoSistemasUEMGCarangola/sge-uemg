'use server'

import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { getCurrentUserRole } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

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

export async function deleteUserAction(userId: string) {
    const role = await getCurrentUserRole()
    if (role !== 'ADMIN') {
        return { success: false, error: "Acesso negado." }
    }

    try {
        // 1. Delete DB Records using transaction
        await prisma.$transaction(async (tx) => {
            // Try to delete specific role data first (if exists)
            // We blindly attempt delete on both tables with unique profileId
            // If the record doesn't exist, it throws? No, delete expects where unique, throws if not found?
            // "delete" throws if not found. "deleteMany" does not.
            // But we want to ensure we clean up.

            // Using deleteMany is safer if we are unsure which one it is, or use findFirst.
            await tx.aluno.deleteMany({ where: { profileId: userId } })
            await tx.professor.deleteMany({ where: { profileId: userId } })

            // Delete Profile
            await tx.profile.delete({ where: { id: userId } })
        })

        // 2. Delete Auth User
        const { error: authError } = await adminClient.auth.admin.deleteUser(userId)

        if (authError) {
            console.error("Auth Delete Error:", authError)
            return { success: false, error: "Dados apagados do sistema, mas erro ao remover login: " + authError.message }
        }

        revalidatePath('/admin/alunos')
        revalidatePath('/admin/professores')
        return { success: true }

    } catch (error) {
        console.error("Delete User Error:", error)
        // Check for Constraint Violation
        if (String(error).includes("Foreign key constraint failed")) {
            return { success: false, error: "Não é possível excluir este usuário pois ele possui registros vinculados (Estágios, Ofertas, etc)." }
        }
        return {
            success: false,
            error: `Erro ao excluir: ${error instanceof Error ? error.message : String(error)}`
        }
    }
}
