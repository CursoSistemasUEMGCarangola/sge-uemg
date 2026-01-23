import { z } from "zod"

export const unidadeSchema = z.object({
    nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
})

export type UnidadeFormData = z.infer<typeof unidadeSchema>
