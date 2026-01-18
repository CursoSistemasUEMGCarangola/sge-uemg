import { z } from "zod"

export const registerProfessorSchema = z.object({
    fullName: z.string().min(1, "Nome completo é obrigatório").regex(/[A-Z ]+/, "O nome deve estar em letras maiúsculas").refine((val) => val.trim().split(" ").length >= 2, {
        message: "Informe o nome completo (pelo menos dois nomes)",
    }),
    masp: z.string().min(1, "MASP é obrigatório"),
    confirmMasp: z.string().min(1, "Confirmação de MASP é obrigatória"),
    email: z.string().email("Email inválido"),
    confirmEmail: z.string().email("Confirmação de email inválida"),
    telefone: z.string().min(14, "Telefone incompleto"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirmação de senha é obrigatória"),
}).refine((data) => data.masp === data.confirmMasp, {
    message: "Os MASPs não conferem",
    path: ["confirmMasp"],
}).refine((data) => data.email === data.confirmEmail, {
    message: "Os emails não conferem",
    path: ["confirmEmail"],
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
})

export type RegisterProfessorFormData = z.infer<typeof registerProfessorSchema>
