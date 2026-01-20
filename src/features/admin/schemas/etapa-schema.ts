import { z } from "zod"

export const etapaSchema = z.object({
    id: z.number().optional(),
    numeroEtapa: z.coerce.number().min(1, "Número obrigatório"),
    descricao: z.string().min(3, "Descrição muito curta"),
    orientacaoTextual: z.string().min(10, "Orientação deve ter pelo menos 10 caracteres"),
})

export type EtapaFormData = z.infer<typeof etapaSchema>
