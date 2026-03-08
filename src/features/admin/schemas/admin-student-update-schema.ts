import { z } from "zod"

export const adminStudentUpdateSchema = z.object({
    id: z.string().uuid(),
    fullName: z.string()
        .min(1, "Nome completo é obrigatório")
        .regex(/^[A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ ]+$/, "O nome deve estar em letras maiúsculas"),
    matricula: z.string().min(1, "Matrícula é obrigatória"),
    email: z.string().email("Email inválido"),
    telefone: z.string().min(1, "Telefone é obrigatório"),
    periodo: z.string().min(1, "Período é obrigatório"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").optional().or(z.literal("")),
})
