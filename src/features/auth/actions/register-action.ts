'use server'

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { registerStudentSchema } from "../schemas/register-schema"

export type RegisterStudentState = {
  success?: boolean
  message?: string
  errors?: {
    [key: string]: string[]
  }
}

export async function registerStudentAction(prevState: RegisterStudentState, formData: FormData): Promise<RegisterStudentState> {
  const rawData = Object.fromEntries(formData.entries())

  // Handle checkboxes and boolean conversions if necessary
  // formData.get('termsAccepted') usually returns 'on' if checked, or null if not.
  // We need to manuall parse it for Zod if we pass raw object, or handle it before validation.
  const validatedFields = registerStudentSchema.safeParse({
    ...rawData,
    termsAccepted: rawData.termsAccepted === 'on',
  })

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Erro de validação. Verifique os campos.",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password, fullName, matricula, periodo, termsAccepted, cursoId } = validatedFields.data

  // Use Admin Client to bypass email verification requirement
  const adminClient = createAdminClient()

  try {
    // 0. Pre-check: Verify if Matricula or Email already exists in our Database
    // This prevents creating an Auth User if the business logic (Matricula unique) fails
    const existingAluno = await prisma.aluno.findFirst({
      where: { matricula: matricula }
    })

    if (existingAluno) {
      return { success: false, message: "Esta matrícula já está cadastrada no sistema." }
    }

    const existingProfile = await prisma.profile.findFirst({
      where: { email: email }
    })

    if (existingProfile) {
      return { success: false, message: "Um usuário com este endereço de e-mail já está cadastrado." }
    }

    // 1. Create Auth User (Pre-confirmed)
    let authData
    let authError

    const createAuthUser = async () => {
      return await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Explicitly confirm email
        user_metadata: {
          full_name: fullName,
          role: 'ALUNO',
        }
      })
    }

    const result = await createAuthUser()
    authData = result.data
    authError = result.error


    // AUTOMATIC RECOVERY FOR ORPHAN USERS
    // If Auth says "User already registered" but we know (from Step 0) that Profile doesn't exist,
    // it means we have a "zombie" Auth user from a failed previous transaction.
    if (authError && authError.message?.includes("A user with this email address has already been registered")) {
      console.log(`[Registration] Orphan user detected for ${email}. Attempting self-healing...`)

      // Try to find the orphan user ID to delete it
      // Note: listUsers() is paginated (default 50). Ideally we search by email, but admin SDK limitation may apply.
      // We fetch a larger batch to increase odds of finding it in dev/test scenarios.
      const { data: listData } = await adminClient.auth.admin.listUsers({ perPage: 1000 })

      const orphan = listData?.users.find(u => u.email === email)

      if (orphan) {
        console.log(`[Registration] Deleting orphan user ${orphan.id}...`)
        const { error: deleteError } = await adminClient.auth.admin.deleteUser(orphan.id)

        if (!deleteError) {
          // Retry Creation
          console.log(`[Registration] Orphan deleted. Retrying creation...`)
          const retryResult = await createAuthUser()
          authData = retryResult.data
          authError = retryResult.error
        }
      }
    }

    if (authError) {
      console.error('Registration Error:', authError)
      let message = authError.message
      if (message.includes("A user with this email address has already been registered")) {
        message = "Um usuário com este endereço de e-mail já está cadastrado."
      }
      return {
        success: false,
        message: message,
      }
    }

    if (!authData.user || !authData.user.id) {
      return {
        success: false,
        message: "Erro crítico ao criar usuário. Tente novamente.",
      }
    }

    const userId = authData.user.id

    // 2. Transact: Create Profile + Aluno
    await prisma.$transaction(async (tx) => {
      // Upsert profile to handle potential trigger existence
      await tx.profile.upsert({
        where: { id: userId },
        update: {
          nomeCompleto: fullName,
          email: email,
          telefone: validatedFields.data.telefone,
          role: 'ALUNO',
        },
        create: {
          id: userId,
          nomeCompleto: fullName,
          email: email,
          telefone: validatedFields.data.telefone,
          role: 'ALUNO',
        }
      })

      // Create Aluno record
      await tx.aluno.create({
        data: {
          profileId: userId,
          matricula: matricula,
          periodoAtual: parseInt(periodo),
          cursoId: cursoId,
        },
      })
    })

    return {
      success: true,
      message: "Cadastro realizado com sucesso!",
    }

  } catch (error: any) {
    // Tratamento específico para erro de unicidade do Prisma (P2002)
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      if (field === 'matricula') {
        return { success: false, message: "Esta matrícula já está cadastrada no sistema." };
      }
      if (field === 'email') {
        return { success: false, message: "Este e-mail já está em uso." };
      }
      return { success: false, message: "Dados duplicados encontrados no sistema." };
    }

    return {
      success: false,
      message: "Erro interno no servidor ao registrar aluno: " + (error.message || "Erro desconhecido"),
    }
  }


}
