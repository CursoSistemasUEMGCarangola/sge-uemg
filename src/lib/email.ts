import nodemailer from 'nodemailer';

export interface SendMailOptions {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: SendMailOptions) {
    try {
        // Log para depuração de variáveis de ambiente no servidor
        console.log('SMTP Config Check:', {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            user: process.env.SMTP_USER,
            hasPass: !!process.env.SMTP_PASS,
            fromEmail: process.env.SMTP_FROM_EMAIL
        });

        if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.error('Erro: Configurações de SMTP incompletas no arquivo .env!');
            return { 
                success: false, 
                error: new Error('Configurações de SMTP incompletas no arquivo .env. Certifique-se de reiniciar o servidor após alterar o .env.') 
            };
        }

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_PORT === '465', // true para 465, false para outras portas
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const fromName = process.env.SMTP_FROM_NAME || 'SGE UEMG';
        const fromEmail = process.env.SMTP_FROM_EMAIL || 'noreply@sge.uemg.br';

        const info = await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to,
            subject,
            html,
        });

        console.log(`Email enviado com sucesso para ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Erro ao enviar e-mail via Nodemailer:', error);
        return { success: false, error };
    }
}
