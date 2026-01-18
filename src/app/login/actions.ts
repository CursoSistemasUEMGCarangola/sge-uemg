'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient, getCurrentUserRole } from '@/lib/auth'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error('Login error:', error)
        return { error: error.message }
    }

    const role = await getCurrentUserRole()

    if (role === 'PROFESSOR') {
        revalidatePath('/admin', 'layout')
        redirect('/admin')
    } else if (role === 'ALUNO') {
        revalidatePath('/aluno', 'layout')
        redirect('/aluno')
    } else {
        revalidatePath('/', 'layout')
        redirect('/')
    }
}
