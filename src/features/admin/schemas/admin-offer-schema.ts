import { z } from "zod"

export const adminOfferSchema = z.object({
    cursoEstagioId: z.coerce.number().min(1, { message: "Selecione um tipo de estágio." }),
    professorOrientadorId: z.coerce.number().min(1, { message: "Selecione um professor orientador." }),
    semestreLetivo: z.string().min(4, { message: "Informe o semestre letivo (ex: 2024/1)." }),
    dataInicio: z.coerce.date(),
    dataFim: z.coerce.date(),
}).refine((data) => data.dataFim > data.dataInicio, {
    message: "A data de término deve ser posterior à data de início.",
    path: ["dataFim"],
})

export type AdminOfferFormValues = z.infer<typeof adminOfferSchema>
