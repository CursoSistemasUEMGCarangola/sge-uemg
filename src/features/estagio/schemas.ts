import { z } from "zod"

export const empresaSchema = z.object({
    razaoSocial: z.string().min(3, "Razão Social é obrigatória"),
    nomeFantasia: z.string().min(2, "Nome Comercial é obrigatório"),
    telefone: z.string().min(8, "Telefone é obrigatório"), // Changed from telefoneContato to telefone as per user request (implied rename) or mapped
    email: z.string().email("E-mail inválido") // Changed from emailContato to email
})

// For now, the main schema just wraps this, or we can use it directly.
// To keep compatibility with form structure if needed, or we redefine.
// User said "Apague o restante", so we focus on this.
export const supervisorSchema = z.object({
    nome: z.string().min(3, "Nome do Supervisor é obrigatório"),
    telefone: z.string().min(8, "Telefone do Supervisor é obrigatório"),
    email: z.string().email("E-mail do Supervisor inválido"),
    cargo: z.string().min(2, "Cargo do Supervisor é obrigatório"),
    formacao: z.string().min(2, "Formação do Supervisor é obrigatória"),
    titulacao: z.string().min(2, "Titulação do Supervisor é obrigatória")
})

// Define validations that mirror Prisma Enums
const ModalidadeEnum = z.enum(["PRESENCIAL", "REMOTO", "HIBRIDO"])
const TipoDocumentacaoEnum = z.enum(["TCE", "TERMO_ADITIVO"])

export const estagioSchema = z.object({
    modalidade: z.string().min(1, "Selecione a modalidade"),
    tipoDocumentacao: z.string().min(1, "Selecione o tipo de documentação"),
    dataInicio: z.date(),
    cargaHorariaDiaria: z.number().min(1, "Mínimo 1 hora").max(6, "Máximo 6 horas"),
    atribuicoes: z.string().min(20, "Descreva as atividades com pelo menos 20 caracteres")
})

export const novoEstagioSchema = z.object({
    empresa: empresaSchema,
    supervisor: supervisorSchema,
    estagio: estagioSchema
})

export type NovoEstagioFormData = z.infer<typeof novoEstagioSchema>
