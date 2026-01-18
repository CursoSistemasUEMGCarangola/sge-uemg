import { z } from "zod"

export const adminProfessorSchema = z.object({
    fullName: z.string().min(1, "Nome completo é obrigatório").regex(/[A-Z ]+/, "O nome deve estar em letras maiúsculas").refine((val) => val.trim().split(" ").length >= 2, {
        message: "Informe o nome completo (pelo menos dois nomes)",
    }),
    masp: z.string().min(1, "MASP é obrigatório"),
    email: z.string().email("Email inválido"),
    telefone: z.string().min(14, "Telefone incompleto"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
})
