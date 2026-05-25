'use server'

import { z } from "zod"
import { createClient } from '@supabase/supabase-js' // Use admin client
import { registerProfessorSchema } from '../schemas/register-professor-schema'
import { prisma } from '@/lib/prisma'
import { getCurrentUserRole } from '@/lib/auth'

export type RegisterProfessorState = {
    success?: boolean
    error?: string
    fieldErrors?: {
        [key: string]: string[]
    }
}

// Initialize Supabase Admin Client to bypass email confirmation
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

export async function registerProfessorAction(prevState: any, formData: FormData): Promise<RegisterProfessorState> {
    // SEG-05b: Esta action só deve ser invocada por um ADMIN autenticado
    const currentRole = await getCurrentUserRole()
    if (currentRole !== 'ADMIN') {
        return { success: false, error: "Acesso negado. Apenas administradores podem cadastrar professores." }
    }

    const rawData = Object.fromEntries(formData.entries())


    const validatedFields = registerProfessorSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            success: false,
            error: "Dados inválidos. Verifique os campos.",
            fieldErrors: validatedFields.error.flatten().fieldErrors
        }
    }

    const { email, password, fullName, masp, telefone, cursoId } = validatedFields.data

    try {
        // 1. Check if user already exists in Public Schema (Prisma)
        const existingProfile = await prisma.profile.findFirst({
            where: { email }
        })

        if (existingProfile) {
            return {
                success: false,
                error: "Este email já está cadastrado."
            }
        }

        const existingMasp = await prisma.professor.findUnique({
            where: { masp }
        })

        if (existingMasp) {
            return {
                success: false,
                error: "Este MASP já está cadastrado."
            }
        }

        // 2. Create User in Supabase Auth (using Admin API to auto-confirm)
        const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Bypass email confirmation
            user_metadata: {
                full_name: fullName
            }
        })

        if (authError) {
            console.error("Supabase Create User Error:", authError)
            return {
                success: false,
                error: authError.message || "Erro ao criar usuário."
            }
        }

        if (!authData.user) {
            return {
                success: false,
                error: "Erro inesperado ao criar usuário."
            }
        }

        // 3. Create Profile and Professor Record in Transaction
        await prisma.$transaction(async (tx) => {
            // Create or Update Profile (Handles potential auto-create triggers)
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

            // Create Professor
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
        console.error("Registration Error:", error)
        // SEG-07b: Não expor detalhes internos ao cliente
        return {
            success: false,
            error: `Erro interno no servidor. Tente novamente mais tarde.`
        }
    }
}
