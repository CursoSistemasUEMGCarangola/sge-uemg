import { z } from "zod"
import { Modalidade, TipoDocumentacao } from "@prisma/client"

export const empresaSchema = z.object({
    razaoSocial: z.string().min(3, "Razão Social é obrigatória"),
    nomeFantasia: z.string().min(2, "Nome Fantasia é obrigatório"),
    telefoneContato: z.string().optional(),
    emailContato: z.string().email("E-mail inválido").optional().or(z.literal("")),
    supervisorNome: z.string().min(3, "Nome do Supervisor é obrigatório"),
    supervisorCargo: z.string().min(2, "Cargo do Supervisor é obrigatório"),
    supervisorAreaFormacao: z.string().min(2, "Área de Formação é obrigatória"),
    supervisorTitulacao: z.string().min(2, "Titulação é obrigatória"),
    supervisorTelefone: z.string().min(8, "Telefone do Supervisor é obrigatório"),
    supervisorEmail: z.string().email("E-mail do Supervisor inválido")
})

export const contratoSchema = z.object({
    ofertaId: z.coerce.number({ message: "Selecione um período letivo" }),
    modalidade: z.nativeEnum(Modalidade, { message: "Selecione a modalidade" }),
    tipoDocumentacao: z.nativeEnum(TipoDocumentacao, { message: "Selecione o tipo de documentação" }),
    atribuicoes: z.string().min(10, "Descreva as atribuições detalhadamente"),
    dataInicioPrevista: z.date({ message: "Data de início é obrigatória" }),
    cargaHorariaDiaria: z.coerce.number().min(1).max(6, "Máximo de 6 horas diárias")
})

export const novoEstagioSchema = z.object({
    empresa: empresaSchema,
    contrato: contratoSchema
})

export type NovoEstagioFormData = z.infer<typeof novoEstagioSchema>
