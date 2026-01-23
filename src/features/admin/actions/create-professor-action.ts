'use server'

import { createClient } from '@supabase/supabase-js'
import { adminProfessorSchema } from '../schemas/admin-professor-schema'
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

export async function createProfessorAction(prevState: any, formData: FormData) {
    const role = await getCurrentUserRole()
    if (role !== 'ADMIN') {
        return { success: false, error: "Acesso negado." }
    }

    const rawData = Object.fromEntries(formData.entries())
    const validatedFields = adminProfessorSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            success: false,
            error: "Dados inválidos.",
            fieldErrors: validatedFields.error.flatten().fieldErrors
        }
    }

    const { email, password, fullName, masp, telefone, cursoId } = validatedFields.data

    try {
        const existingProfile = await prisma.profile.findFirst({ where: { email } })
        if (existingProfile) return { success: false, error: "Email já cadastrado." }

        const existingMasp = await prisma.professor.findUnique({ where: { masp } })
        if (existingMasp) return { success: false, error: "MASP já cadastrado." }

        const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName }
        })

        if (authError) return { success: false, error: authError.message }
        if (!authData.user) return { success: false, error: "Erro ao criar usuário." }

        await prisma.$transaction(async (tx) => {
            const profile = await tx.profile.upsert({
                where: { id: authData.user!.id },
                update: {
                    nomeCompleto: fullName,
                    role: 'PROFESSOR',
                    telefone: telefone
                },
                create: {
                    id: authData.user!.id,
                    email,
                    nomeCompleto: fullName,
                    role: 'PROFESSOR',
                    telefone: telefone
                }
            })

            await tx.professor.create({
                data: {
                    profileId: profile.id,
                    masp: masp,
                    cursoId: cursoId
                }
            })
        })

        return { success: true }

    } catch (error) {
        console.error("Create Professor Error:", error)
        return {
            success: false,
            error: `Erro interno: ${error instanceof Error ? error.message : String(error)}`
        }
    }
}
