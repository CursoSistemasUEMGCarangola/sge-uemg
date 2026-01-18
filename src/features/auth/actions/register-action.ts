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

  const { email, password, fullName, matricula, periodo, termsAccepted } = validatedFields.data

  // Use Admin Client to bypass email verification requirement
  const adminClient = createAdminClient()

  try {
    // 1. Create Auth User (Pre-confirmed)
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Explicitly confirm email
      user_metadata: {
        full_name: fullName,
        role: 'ALUNO',
      }
    })

    if (authError) {
      console.error('Registration Error:', authError)
      return {
        success: false,
        message: authError.message,
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
