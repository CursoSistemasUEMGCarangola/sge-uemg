import { z } from "zod"

export const adminStudentSchema = z.object({
    fullName: z.string()
        .min(1, "Nome completo é obrigatório")
        .regex(/^[A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ ]+$/, "O nome deve estar em letras maiúsculas")
        .refine((val) => val.trim().split(" ").length >= 2, {
            message: "Informe o nome completo (pelo menos dois nomes)",
        }),
    matricula: z.string().min(1, "Matrícula é obrigatória"),
    email: z.string().email("Email inválido"),
    telefone: z.string().min(1, "Telefone é obrigatório"),
    periodo: z.string().min(1, "Período é obrigatório"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
})
