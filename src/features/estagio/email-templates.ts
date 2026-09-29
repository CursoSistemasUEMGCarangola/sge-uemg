export interface InternAlertData {
    internName: string;
    courseName: string;
    companyName: string;
    nextStepLabel: string;
    nextStepDescription: string;
    isDelayed: boolean;
    observations: string[];
}

export function buildInternAlertHtml(data: InternAlertData): string {
    const delayWarning = data.isDelayed
        ? `<div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin-bottom: 20px;">
             <strong style="color: #b91c1c;">ATENÇÃO:</strong> Existem pendências atrasadas no seu estágio. Acesse o sistema o quanto antes.
           </div>`
        : '';

    const obsSection = data.observations.length > 0
        ? `<div style="margin-top: 20px;">
             <h3 style="color: #374151;">Mensagens de Orientação:</h3>
             <ul style="color: #4b5563;">
               ${data.observations.map(obs => `<li style="margin-bottom: 8px;">${obs}</li>`).join('')}
             </ul>
           </div>`
        : '';

    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
        <h2 style="color: #111827;">Olá, ${data.internName}</h2>
        <p>Este é um alerta automático de acompanhamento do seu estágio de <strong>${data.courseName}</strong> realizado na empresa <strong>${data.companyName}</strong>.</p>
        
        ${delayWarning}

        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #374151;">Próxima Ação Requerida</h3>
            <p><strong>${data.nextStepLabel}:</strong> ${data.nextStepDescription}</p>
        </div>

        ${obsSection}

        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
            Acesse o <a href="https://sge-sistemas.vercel.app" style="color: #2563eb;">SGE Sistemas de Informação</a> para ver mais detalhes e submeter seus documentos.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="font-size: 12px; color: #9ca3af;">
            Este é um e-mail automático enviado pelo Sistema de Gestão de Estágios da UEMG. Por favor, não responda a este e-mail.
        </p>
    </div>
    `;
}

export interface NewInternshipRequestData {
    professorName: string;
    internName: string;
    courseName: string;
    companyName: string;
}

export function buildNewInternshipRequestHtml(data: NewInternshipRequestData): string {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
        <h2 style="color: #111827;">Olá, Prof. ${data.professorName}</h2>
        <p>Um novo aluno acabou de registrar uma solicitação de estágio vinculado à sua oferta de <strong>${data.courseName}</strong>.</p>
        
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #374151;">Detalhes da Solicitação</h3>
            <p><strong>Aluno:</strong> ${data.internName}</p>
            <p><strong>Empresa Concedente:</strong> ${data.companyName}</p>
        </div>

        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
            Acesse o <a href="https://sge-sistemas.vercel.app/admin" style="color: #2563eb;">Painel de Administração do SGE</a> para avaliar o plano de atividades e a documentação enviada.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="font-size: 12px; color: #9ca3af;">
            Este é um e-mail automático enviado pelo Sistema de Gestão de Estágios da UEMG. Por favor, não responda a este e-mail.
        </p>
    </div>
    `;
}

export interface ContractRejectedData {
    internName: string;
    courseName: string;
    companyName: string;
    professorName: string;
    justification: string;
}

export function buildContractRejectedHtml(data: ContractRejectedData): string {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
        <h2 style="color: #b91c1c;">Aviso de Indeferimento de Estágio</h2>
        <p>Olá, <strong>${data.internName}</strong>,</p>
        <p>Informamos que o seu registro de estágio na disciplina <strong>${data.courseName}</strong> vinculado à empresa <strong>${data.companyName}</strong> foi <strong>rejeitado/indeferido</strong> pelo professor orientador <strong>${data.professorName}</strong>.</p>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 4px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #991b1b; font-size: 16px;">Justificativa Oficial do Orientador:</h3>
            <p style="color: #7f1d1d; white-space: pre-wrap; margin-bottom: 0;">${data.justification}</p>
        </div>

        <p style="margin-top: 20px; font-size: 14px; color: #4b5563;">
            Acesse o <a href="https://sge-sistemas.vercel.app/aluno" style="color: #2563eb; font-weight: bold;">Painel do Aluno no SGE</a> para visualizar os detalhes e, se necessário, entre em contato com o seu professor orientador ou inicie um novo cadastro regularizado.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="font-size: 12px; color: #9ca3af;">
            Este é um e-mail automático enviado pelo Sistema de Gestão de Estágios da UEMG. Por favor, não responda a este e-mail.
        </p>
    </div>
    `;
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export interface CustomProfessorMessageData {
    professorName: string;
    internName: string;
    courseName: string;
    messageContent: string;
    filterContext?: string;
}

export function buildCustomProfessorMessageHtml(data: CustomProfessorMessageData): string {
    const safeContent = escapeHtml(data.messageContent).replace(/\n/g, '<br />');
    const filterInfo = data.filterContext
        ? `<p style="font-size: 13px; color: #6b7280; margin-bottom: 16px;">
             <strong>Contexto do comunicado:</strong> ${escapeHtml(data.filterContext)}
           </p>`
        : '';

    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
        <h2 style="color: #1d4ed8; margin-bottom: 8px;">Comunicado do Professor Orientador</h2>
        <p style="font-size: 15px; margin-top: 0;">Olá, <strong>${escapeHtml(data.internName)}</strong>,</p>
        
        <p>Você recebeu uma mensagem do seu professor orientador <strong>${escapeHtml(data.professorName)}</strong> referente à disciplina <strong>${escapeHtml(data.courseName)}</strong>.</p>
        
        ${filterInfo}

        <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 18px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e40af; font-size: 15px;">Mensagem:</h3>
            <div style="color: #334155; font-size: 14px; line-height: 1.6;">${safeContent}</div>
        </div>

        <p style="margin-top: 24px; font-size: 14px; color: #4b5563;">
            Acesse o <a href="https://sge-sistemas.vercel.app/aluno" style="color: #2563eb; font-weight: bold;">Painel do Aluno no SGE</a> para acompanhar seu estágio, submeter documentos e verificar orientações.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="font-size: 12px; color: #9ca3af;">
            Este é um comunicado oficial enviado pelo Sistema de Gestão de Estágios da UEMG. Por favor, não responda diretamente a este e-mail automático.
        </p>
    </div>
    `;
}

