'use server'

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
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

  const supabase = createClient()

  try {
    // 1. Create Auth User
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'ALUNO',
        },
      },
    })

    if (authError) {
      return {
        success: false,
        message: authError.message,
      }
    }

    if (!authData.user || !authData.user.id) {
      return {
        success: false,
        message: "Erro ao criar usuário de autenticação.",
      }
    }

    const userId = authData.user.id

    // 2. Transact: Create Profile + Aluno
    // Note: If you have a Trigger for Profile creation on Signup, this step might duplicate or conflict.
    // Based on the 'schema.sql' provided, there is no Visible Trigger code. We will assume explicit creation is cleaner or required.
    // However, Supabase Auth often pairs with a public.profiles trigger. 
    // IF a trigger exists, we should only update or Create Aluno. 
    // SAFEST APPROACH: Try to create Profile, if conflict (trigger already made it), update it.

    await prisma.$transaction(async (tx) => {
      // Upsert profile to handle potential trigger existence
      await tx.profile.upsert({
        where: { id: userId },
        update: {
          nomeCompleto: fullName,
          email: email,
          role: 'ALUNO',
        },
        create: {
          id: userId,
          nomeCompleto: fullName,
          email: email,
          role: 'ALUNO',
        }
      })

      // Create Aluno record
      await tx.aluno.create({
        data: {
          profile_id: userId,
          matricula: matricula,
          periodo_atual: parseInt(periodo),
        },
      })
    })

  } catch (error: any) {
    return {
      success: false,
      message: "Erro interno no servidor ao registrar aluno: " + error.message,
    }
  }

  redirect('/aluno/dashboard') // Or login page
}
