import { z } from "zod"

export const cursoSchema = z.object({
    nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
    unidadeId: z.coerce.number().min(1, "Selecione uma unidade acadêmica"),
})

export type CursoFormData = z.infer<typeof cursoSchema>
