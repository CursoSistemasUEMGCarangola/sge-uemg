import { z } from "zod"

export const adminInternshipSchema = z.object({
    nome: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
    periodoVinculado: z.coerce.number().min(1, { message: "O período deve ser maior que 0." }),
    cargaHorariaTotal: z.coerce.number().min(1, { message: "A carga horária deve ser maior que 0." }),
})

export type AdminInternshipFormValues = z.infer<typeof adminInternshipSchema>
