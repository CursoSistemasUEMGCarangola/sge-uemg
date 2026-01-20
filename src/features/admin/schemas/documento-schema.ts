import { z } from "zod"

export const documentoSchema = z.object({
    id: z.number().optional(),
    nomeArquivo: z.string().min(3, "Nome muito curto"),
    urlLink: z.string().url("Link inválido, deve iniciar com http:// ou https://"),
})

export type DocumentoFormData = z.infer<typeof documentoSchema>
