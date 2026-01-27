'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getServerBaseUrl } from '@/server/url'

export async function recoverPassword(formData: FormData) {
    const email = formData.get('email') as string

    if (!email) {
        return { error: 'O email é obrigatório.' }
    }

    const adminDb = createAdminClient()

    // O link apontará diretamente para a página /auth/reset, sem passar por callbacks de API
    const baseUrl = await getServerBaseUrl()
    const callbackUrl = `${baseUrl}auth/reset`

    const { error } = await adminDb.auth.resetPasswordForEmail(email, {
        redirectTo: callbackUrl
    })

    if (error) {
        // Por segurança, não confirmamos se o email existe ou não, mas logamos o erro
        console.error('Erro ao enviar email de recuperação:', error)
        // Retornamos sucesso genérico para evitar user enumeration, ou erro se for algo crítico
        // Neste caso, vamos retornar o erro para facilitar o debug se for algo de config
        return { error: error.message }
    }

    return { success: true }
}
