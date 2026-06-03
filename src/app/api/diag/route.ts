import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { createAdminClient } from '@/lib/supabase/admin'

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
        smtpConnectionCheck: null,
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

    // 2. Check SMTP connection
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        })

        await transporter.verify()
        diagInfo.smtpConnectionCheck = { success: true, message: 'SMTP connection verified successfully!' }

        // 3. Send test email if requested
        if (emailParam) {
            diagInfo.emailSendCheck = { status: 'starting', target: emailParam }
            const fromName = process.env.SMTP_FROM_NAME || 'SGE UEMG'
            const fromEmail = process.env.SMTP_FROM_EMAIL || 'gestagiosis@gmail.com'

            const info = await transporter.sendMail({
                from: `"${fromName}" <${fromEmail}>`,
                to: emailParam,
                subject: `SGE UEMG - Vercel Diagnostics Test`,
                html: `<p>Olá,</p><p>Este é um e-mail de teste enviado diretamente do ambiente de produção (Vercel) usando Nodemailer.</p><p>Data/Hora: ${new Date().toISOString()}</p><p>Se você recebeu esta mensagem, o envio de e-mails via Nodemailer na Vercel está funcionando 100%!</p>`
            })

            diagInfo.emailSendCheck = { success: true, messageId: info.messageId, response: info.response }
        } else {
            diagInfo.emailSendCheck = { message: 'Pass ?email=address to test sending an email' }
        }
    } catch (e: any) {
        diagInfo.smtpConnectionCheck = { success: false, error: e.message || e, stack: e.stack }
    }

    return NextResponse.json(diagInfo)
}
