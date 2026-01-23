export const SYSTEM_ACTIONS = {
    GENERATE_DOC_CAPA: {
        label: "Emitir Capa de Estágio",
        description: "Habilita o botão para o aluno preencher e gerar a Capa do Termo de Estágio (PDF)."
    },
    FILL_ACTIVITY_PLAN: {
        label: "Preencher Plano de Atividades",
        description: "Habilita o botão para o aluuno preencher o Plano de Atividades."
    },
    UPLOAD_TCE_SIGNED: {
        label: "Upload do TCE Assinado",
        description: "Habilita o formulário para envio do Termo de Compromisso assinado."
    }
} as const

export type SystemActionKey = keyof typeof SYSTEM_ACTIONS
