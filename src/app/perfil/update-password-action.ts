'use server'

import { createClient } from '@/lib/auth'

export async function updatePasswordAction(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Usuário não autenticado.', success: false, message: null }
    }

    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!password || password.length < 6) {
        return { error: 'A senha deve ter pelo menos 6 caracteres.', success: false, message: null }
    }

    if (password !== confirmPassword) {
        return { error: 'As senhas não conferem.', success: false, message: null }
    }

    const { error } = await supabase.auth.updateUser({ password: password })

    if (error) {
        return { error: error.message, success: false, message: null }
    }

    return { success: true, message: 'Senha atualizada com sucesso!', error: null }
}
