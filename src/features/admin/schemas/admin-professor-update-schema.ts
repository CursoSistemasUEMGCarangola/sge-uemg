import { z } from "zod"

export const adminProfessorUpdateSchema = z.object({
    id: z.string().uuid(),
    fullName: z.string().min(1, "Nome completo é obrigatório").regex(/[A-Z ]+/, "O nome deve estar em letras maiúsculas"),
    masp: z.string().min(1, "MASP é obrigatório"),
    email: z.string().email("Email inválido"),
    telefone: z.string().min(14, "Telefone incompleto"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").optional().or(z.literal("")),
})
