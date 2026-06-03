import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const key = searchParams.get('key')
    const emailParam = searchParams.get('email')

    if (key !== 'sge_diag_2026') {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    const diagInfo: any = {
        timestamp: new Date().toISOString(),
        env: {
            NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'missing',
            SUPABASE_SERVICE_ROLE_KEY_length: process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.length : 0,
            SMTP_HOST: process.env.SMTP_HOST || 'missing',
            SMTP_PORT: process.env.SMTP_PORT || 'missing',
            SMTP_USER: process.env.SMTP_USER || 'missing',
            SMTP_PASS_set: !!process.env.SMTP_PASS,
            SMTP_PASS_redacted: process.env.SMTP_PASS 
                ? `${process.env.SMTP_PASS.slice(0, 3)}...${process.env.SMTP_PASS.slice(-3)} (len: ${process.env.SMTP_PASS.length})` 
                : 'missing',
            SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || 'missing',
            SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL || 'missing',
        },
        supabaseCheck: null,
        emailSendCheck: null
    }

    // 1. Check Supabase connection
    try {
        const adminDb = createAdminClient()
        const { data, error } = await adminDb.auth.admin.listUsers()
        if (error) {
            diagInfo.supabaseCheck = { success: false, error: error.message, status: error.status }
        } else {
            diagInfo.supabaseCheck = { success: true, userCount: data.users.length }
        }
    } catch (e: any) {
        diagInfo.supabaseCheck = { success: false, error: e.message || e }
    }

    // 2. Send test email using the actual project's sendEmail function
    if (emailParam) {
        try {
            console.log(`[Diag] Disparando e-mail de teste para ${emailParam} via sendEmail...`);
            const mailResult = await sendEmail({
                to: emailParam,
                subject: 'SGE UEMG - Vercel Diagnostics (Brevo HTTP API)',
                html: `<p>Olá,</p><p>Este é o e-mail de teste de diagnóstico em produção usando o fluxo real de e-mails do SGE UEMG (Brevo HTTP API).</p><p>Data/Hora: ${new Date().toISOString()}</p>`
            });

            if (mailResult.success) {
                diagInfo.emailSendCheck = { success: true, messageId: mailResult.messageId }
            } else {
                diagInfo.emailSendCheck = { success: false, error: mailResult.error }
            }
        } catch (e: any) {
            diagInfo.emailSendCheck = { success: false, error: e.message || e, stack: e.stack }
        }
    } else {
        diagInfo.emailSendCheck = { message: 'Passe ?email=endereco para testar o envio de e-mail.' }
    }

    return NextResponse.json(diagInfo)
}
