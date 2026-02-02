export const SYSTEM_ACTIONS = {
    GENERATE_DOC_CAPA: {
        label: "Emitir Capa de Estágio",
        description: "Habilita o botão para o aluno preencher e gerar a Capa do Termo de Estágio (PDF)."
    },
    FILL_ACTIVITY_PLAN: {
        label: "Preencher Plano de Atividades",
        description: "Habilita o botão para o aluuno preencher o Plano de Atividades."
    },
    FILL_FINAL_REPORT: {
        label: "Preencher Relatório Final",
        description: "Habilita o botão para o aluno preencher o Relatório Final de Estágio."
    }
} as const

export type SystemActionKey = keyof typeof SYSTEM_ACTIONS
