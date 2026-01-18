'use server'

import { createClient } from '@supabase/supabase-js'
import { adminStudentSchema } from '../schemas/admin-student-schema'
import { prisma } from '@/lib/prisma'
import { getCurrentUserRole } from '@/lib/auth'

// Initialize Supabase Admin Client
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

export async function createStudentAction(prevState: any, formData: FormData) {
    // RBAC Check
    const role = await getCurrentUserRole()
    if (role !== 'ADMIN') {
        return {
            success: false,
            error: "Acesso negado."
        }
    }

    const rawData = Object.fromEntries(formData.entries())
    const validatedFields = adminStudentSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            success: false,
            error: "Dados inválidos.",
            fieldErrors: validatedFields.error.flatten().fieldErrors
        }
    }

    const { email, password, fullName, matricula, telefone, periodo } = validatedFields.data

    try {
        // 1. Check duplications
        const existingProfile = await prisma.profile.findFirst({ where: { email } })
        if (existingProfile) return { success: false, error: "Email já cadastrado." }

        const existingMatricula = await prisma.aluno.findUnique({ where: { matricula } })
        if (existingMatricula) return { success: false, error: "Matrícula já cadastrada." }

        // 2. Create Auth User
        const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName }
        })

        if (authError) return { success: false, error: authError.message }
        if (!authData.user) return { success: false, error: "Erro ao criar usuário." }

        // 3. Create DB Records (Profile + Aluno)
        await prisma.$transaction(async (tx) => {
            const profile = await tx.profile.upsert({
                where: { id: authData.user!.id },
                update: {
                    nomeCompleto: fullName,
                    role: 'ALUNO',
                    telefone: telefone
                },
                create: {
                    id: authData.user!.id,
                    email,
                    nomeCompleto: fullName,
                    role: 'ALUNO',
                    telefone: telefone
                }
            })

            await tx.aluno.create({
                data: {
                    profileId: profile.id,
                    matricula,
                    periodoAtual: parseInt(periodo)
                }
            })
        })

        return { success: true }

    } catch (error) {
        console.error("Create Student Error:", error)
        return {
            success: false,
            error: `Erro interno: ${error instanceof Error ? error.message : String(error)}`
        }
    }
}
