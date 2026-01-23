import { z } from "zod"

// Schema definition used by both Client (Form) and Server (Action)

export const registerStudentSchema = z.object({
    fullName: z.string().min(1, "Nome completo é obrigatório").regex(/[A-Z ]+/, "O nome deve estar em letras maiúsculas").refine((val) => val.trim().split(" ").length >= 2, {
        message: "Informe o nome completo (pelo menos dois nomes)",
    }),
    matricula: z.string().min(1, "Matrícula é obrigatória"),
    confirmMatricula: z.string().min(1, "Confirmação de matrícula é obrigatória"),
    email: z.string().email("Email inválido"),
    confirmEmail: z.string().email("Confirmação de email inválida"),
    periodo: z.string().min(1, "Período é obrigatório"),
    cursoId: z.coerce.number().min(1, "Selecione o curso"),
    telefone: z.string().min(14, "Telefone incompleto"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirmação de senha é obrigatória"),
    termsAccepted: z.boolean().refine((val) => val === true, {
        message: "Você deve aceitar os termos de responsabilidade",
    }),
}).refine((data) => data.matricula === data.confirmMatricula, {
    message: "As matrículas não conferem",
    path: ["confirmMatricula"],
}).refine((data) => data.email === data.confirmEmail, {
    message: "Os emails não conferem",
    path: ["confirmEmail"],
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
})
