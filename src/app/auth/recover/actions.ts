'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getServerBaseUrl } from '@/server/url'
import { sendEmail } from '@/lib/email'
import { prisma } from '@/lib/prisma'

export async function recoverPassword(formData: FormData) {
    const emailInput = formData.get('email') as string

    if (!emailInput) {
        return { error: 'O email é obrigatório.' }
    }

    const adminDb = createAdminClient()
    const baseUrl = await getServerBaseUrl()
    const callbackUrl = `${baseUrl}auth/reset`

    try {
        // Tenta encontrar o perfil do usuário pelo e-mail institucional ou e-mail alternativo
        const profile = await prisma.profile.findFirst({
            where: {
                OR: [
                    { email: emailInput.trim().toLowerCase() },
                    { emailAlternativo: emailInput.trim().toLowerCase() }
                ]
            }
        })

        // Se o perfil não for encontrado, retornamos sucesso genérico por segurança (evita user enumeration)
        if (!profile) {
            console.warn(`Tentativa de recuperação para e-mail não cadastrado: ${emailInput}`)
            return { success: true }
        }

        // Se o perfil existe mas não tem e-mail alternativo cadastrado (usuário antigo migrado)
        if (!profile.emailAlternativo) {
            console.warn(`Tentativa de recuperação para usuário sem e-mail alternativo: ${profile.email}`)
            return { error: 'Sua conta não possui um e-mail alternativo cadastrado para recuperação de senha. Por favor, entre em contato com o suporte.' }
        }

        // Gera o link de recuperação de senha usando o e-mail primário/institucional (utilizado no Supabase Auth)
        const { data, error } = await adminDb.auth.admin.generateLink({
            type: 'recovery',
            email: profile.email,
            options: {
                redirectTo: callbackUrl
            }
        })

        if (error) {
            console.error('Erro ao gerar link de recuperação:', error)
            return { error: 'Erro ao processar a recuperação de senha.' }
        }

        const actionLink = data.properties.action_link

        // Dispara o e-mail usando o Transporter do Nodemailer com o SMTP do Gmail configurado no .env
        const emailHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff;">
                <h2 style="color: #1e3a8a; font-weight: bold; margin-bottom: 20px; font-size: 20px; border-bottom: 2px solid #eff6ff; padding-bottom: 10px;">Recuperação de Senha - SGE UEMG</h2>
                <p style="font-size: 14px; color: #374151; line-height: 1.5;">Olá,</p>
                <p style="font-size: 14px; color: #374151; line-height: 1.5;">Você solicitou a redefinição de senha para a sua conta no <strong>Sistema de Gestão de Estágios (SGE) do Curso de Sistemas de Informação - UEMG Unidade Carangola</strong>.</p>
                <p style="font-size: 14px; color: #374151; line-height: 1.5;">Clique no botão abaixo para prosseguir com a redefinição da sua senha. Este link expira em breve.</p>
                <div style="margin: 30px 0; text-align: center;">
                    <a href="${actionLink}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">Redefinir Minha Senha</a>
                </div>
                <p style="font-size: 12px; color: #6b7280; margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 15px; line-height: 1.5;">
                    Se você não solicitou esta redefinição, por favor ignore este e-mail. Seus dados continuam seguros.
                </p>
                <p style="font-size: 10px; color: #9ca3af; word-break: break-all; margin-top: 10px; line-height: 1.4;">
                    Caso tenha problemas com o botão, copie e cole o link a seguir no seu navegador:<br/>
                    <a href="${actionLink}" style="color: #2563eb; text-decoration: underline;">${actionLink}</a>
                </p>
            </div>
        `

        const mailResult = await sendEmail({
            to: profile.emailAlternativo,
            subject: 'Recuperação de Senha - SGE UEMG',
            html: emailHtml
        })

        if (!mailResult.success) {
            console.error('Erro ao enviar e-mail com Nodemailer:', mailResult.error)
            return { error: 'Falha ao enviar e-mail de recuperação. Entre em contato com o suporte.' }
        }

        return { success: true }
    } catch (e: any) {
        console.error('Erro inesperado na Server Action de recuperação:', e)
        return { error: 'Ocorreu um erro inesperado no servidor. Tente novamente.' }
    }
}
