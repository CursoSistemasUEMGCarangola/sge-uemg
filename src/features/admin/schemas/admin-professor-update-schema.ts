import { z } from "zod"

export const adminProfessorUpdateSchema = z.object({
    id: z.string().uuid(),
    fullName: z.string().min(1, "Nome completo é obrigatório").regex(/[A-Z ]+/, "O nome deve estar em letras maiúsculas"),
    masp: z.string().min(1, "MASP é obrigatório"),
    email: z.string().email("Email inválido"),
    emailAlternativo: z.string().email("Email alternativo inválido"),
    telefone: z.string().min(14, "Telefone incompleto"),
    cursoId: z.coerce.number().min(1, "Selecione o curso"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").optional().or(z.literal("")),
}).refine((data) => data.email !== data.emailAlternativo, {
    message: "O e-mail alternativo deve ser diferente do e-mail institucional",
    path: ["emailAlternativo"],
})
