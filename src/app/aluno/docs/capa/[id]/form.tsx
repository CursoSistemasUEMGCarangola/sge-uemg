"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, FileText, Save } from "lucide-react"
import { z } from "zod"

import { supervisorSchema } from "@/features/estagio/schemas"
import { updateEstagioAction } from "@/features/estagio/actions"

// Schema definition for this specific form
const capaFormSchema = z.object({
    supervisor: supervisorSchema,
    atribuicoes: z.string().min(20, "Descreva as atividades com pelo menos 20 caracteres")
})

type CapaFormData = z.infer<typeof capaFormSchema>

interface CapaFormProps {
    contrato: any
    informacoesGerais: any[]
}

export function CapaForm({ contrato, informacoesGerais }: CapaFormProps) {
    const { toast } = useToast()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSaved, setIsSaved] = useState(false)

    // Filter options
    const titulacaoOptions = informacoesGerais?.filter(item => item.categoria === 'TITULACAO_SUPERVISOR') || []

    // Some general info might not have 'FORMACAO', if not we use text input or generic list?
    // Looking at NovoEstagioForm, supervisorAreaFormacao seems to be free text or select?
    // In schema it is string. Let's assume free text or check if valid options exist. 
    // Usually Area Formacao is generic. Let's keep as Input for now or copy logic if I saw it.
    // In NovoEstagioForm, it didn't use options for 'formacao', only 'titulacao'.

    const form = useForm<CapaFormData>({
        resolver: zodResolver(capaFormSchema),
        defaultValues: {
            supervisor: {
                nome: contrato.campo.supervisorNome,
                telefone: contrato.campo.supervisorTelefone,
                email: contrato.campo.supervisorEmail,
                cargo: contrato.campo.supervisorCargo,
                formacao: contrato.campo.supervisorAreaFormacao,
                titulacao: contrato.campo.supervisorTitulacao
            },
            atribuicoes: contrato.atribuicoes
        }
    })

    async function onSubmit(data: CapaFormData) {
        setIsSubmitting(true)
        try {
            const result = await updateEstagioAction(contrato.id, data)

            if (result.error) {
                toast({
                    variant: "destructive",
                    title: "Erro ao salvar",
                    description: result.error
                })
            } else {
                toast({
                    title: "Dados atualizados",
                    description: "As informações foram salvas com sucesso."
                })
                setIsSaved(true)
                // Refresh to ensure server data is sync
                router.refresh()
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erro inesperado",
                description: "Ocorreu um erro ao tentar salvar."
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleGeneratePDF = () => {
        window.open(`/aluno/docs/capa/${contrato.id}/pdf`, '_blank')
    }

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>Capa do Estágio - Confirmação de Dados</CardTitle>
                <CardDescription>
                    Verifique e confirme os dados abaixo para gerar a Capa do Estágio.
                    Estes dados serão utilizados no documento oficial.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Dados do Supervisor</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="supervisor.nome"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome Completo do Supervisor</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: João da Silva" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="supervisor.cargo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Cargo</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: Gerente de TI" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="supervisor.email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>E-mail</FormLabel>
                                            <FormControl>
                                                <Input placeholder="email@empresa.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="supervisor.telefone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Telefone</FormLabel>
                                            <FormControl>
                                                <Input placeholder="(99) 99999-9999" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="supervisor.formacao"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Área de Formação</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: Ciência da Computação" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="supervisor.titulacao"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Maior Titularidade</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione..." />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {titulacaoOptions.map((option: any) => (
                                                        <SelectItem key={option.id} value={option.descricao}>
                                                            {option.descricao}
                                                        </SelectItem>
                                                    ))}
                                                    {titulacaoOptions.length === 0 && (
                                                        /* Fallback if no options loaded */
                                                        <>
                                                            <SelectItem value="Graduação">Graduação</SelectItem>
                                                            <SelectItem value="Especialização">Especialização</SelectItem>
                                                            <SelectItem value="Mestrado">Mestrado</SelectItem>
                                                            <SelectItem value="Doutorado">Doutorado</SelectItem>
                                                        </>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Atividades do Estágio</h3>
                            <FormField
                                control={form.control}
                                name="atribuicoes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Atribuições / Plano de Atividades</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                className="min-h-[150px]"
                                                placeholder="Descreva as atividades..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                            >
                                Voltar
                            </Button>

                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Salvar Dados
                                    </>
                                )}
                            </Button>

                            {isSaved && (
                                <Button
                                    type="button"
                                    variant="default"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={handleGeneratePDF}
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    Gerar PDF
                                </Button>
                            )}
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
