import nodemailer from 'nodemailer';

export interface SendMailOptions {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: SendMailOptions) {
    try {
        const apiKey = process.env.SMTP_PASS;
        const fromName = process.env.SMTP_FROM_NAME || 'Orientação de Estágios - Sistemas de Informação';
        const fromEmail = process.env.SMTP_FROM_EMAIL || 'gestagiosis@gmail.com';

        // Se for uma chave de API do Brevo, enviamos direto pela API HTTP (mais confiável em ambientes serverless)
        if (apiKey && apiKey.startsWith('xkeysib-')) {
            console.log(`[Email] Enviando via Brevo HTTP API para: ${to}`);
            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'api-key': apiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    sender: {
                        name: fromName,
                        email: fromEmail
                    },
                    to: [
                        {
                            email: to
                        }
                    ],
                    subject: subject,
                    htmlContent: html
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Brevo API retornou status ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log(`[Email] E-mail enviado via Brevo API com sucesso para ${to}. MessageId: ${data.messageId}`);
            return { success: true, messageId: data.messageId };
        }

        // Caso contrário, fazemos fallback para envio via Nodemailer SMTP normal
        console.log(`[Email] Enviando via Nodemailer SMTP para: ${to}`);
        if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
            throw new Error('Configurações de SMTP incompletas no arquivo .env!');
        }

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const info = await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to,
            subject,
            html,
        });

        console.log(`[Email] E-mail enviado via SMTP com sucesso para ${to}. MessageId: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('[Email] Erro ao enviar e-mail:', error);
        return { success: false, error };
    }
}
