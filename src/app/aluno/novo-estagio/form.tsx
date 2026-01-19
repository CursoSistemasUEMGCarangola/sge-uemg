"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { novoEstagioSchema, NovoEstagioFormData } from "@/features/estagio/schemas"
import { createEstagio } from "@/features/estagio/actions"

interface NovoEstagioFormProps {
    informacoesGerais: any[] // We can type this better later or import shared types
}

export function NovoEstagioForm({ informacoesGerais }: NovoEstagioFormProps) {
    const { toast } = useToast()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Filter dynamic options
    const titulacaoOptions = informacoesGerais?.filter(item => item.categoria === 'TITULACAO_SUPERVISOR') || []
    const modalidadeOptions = informacoesGerais?.filter(item => item.categoria === 'MODALIDADE') || []
    const tipoDocumentacaoOptions = informacoesGerais?.filter(item => item.categoria === 'TIPO_DOCUMENTACAO') || []

    const form = useForm<NovoEstagioFormData>({
        resolver: zodResolver(novoEstagioSchema),
        defaultValues: {
            empresa: {
                razaoSocial: "",
                nomeFantasia: "",
                telefone: "",
                email: ""
            },
            supervisor: {
                nome: "",
                telefone: "",
                email: "",
                cargo: "",
                formacao: "",
                titulacao: ""
            },
            estagio: {
                modalidade: "",
                tipoDocumentacao: "",
                cargaHorariaDiaria: 6,
                atribuicoes: "",
                dataInicio: undefined,
            }
        }
    })

    async function onSubmit(data: NovoEstagioFormData) {
        setIsSubmitting(true)
        try {
            const result = await createEstagio(data)

            if (result.error) {
                toast({
                    variant: "destructive",
                    title: "Erro no envio",
                    description: result.error
                })
            } else {
                toast({
                    title: "Sucesso!",
                    description: "Os dados do estágio foram gravados com sucesso."
                })
                router.push("/aluno")
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erro inesperado",
                description: "Ocorreu um erro ao processar sua solicitação."
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {/* Dados da Empresa */}
                <Card>
                    <CardHeader>
                        <CardTitle>Dados da Empresa / Concedente</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="empresa.razaoSocial"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Razão Social</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Razão social da empresa" className="placeholder:text-gray-400" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="empresa.nomeFantasia"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome Comercial</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nome comercial da empresa" className="placeholder:text-gray-400" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="empresa.telefone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Telefone da Empresa</FormLabel>
                                    <FormControl>
                                        <Input placeholder="(00) 0000-0000" className="placeholder:text-gray-400" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="empresa.email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>E-mail da Empresa</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="contato@empresa.com" className="placeholder:text-gray-400" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Dados do Supervisor */}
                <Card>
                    <CardHeader>
                        <CardTitle>Dados do Supervisor de Campo</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="supervisor.nome"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome do Supervisor</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nome completo" className="placeholder:text-gray-400" {...field} />
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
                                        <Input placeholder="Ex: Gerente de TI" className="placeholder:text-gray-400" {...field} />
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
                                    <FormLabel>Telefone do Supervisor</FormLabel>
                                    <FormControl>
                                        <Input placeholder="(00) 0000-0000" className="placeholder:text-gray-400" {...field} />
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
                                    <FormLabel>E-mail do Supervisor</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="supervisor@empresa.com" className="placeholder:text-gray-400" {...field} />
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
                                    <FormLabel>Formação Acadêmica</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Engenharia de Software" className="placeholder:text-gray-400" {...field} />
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
                                    <FormLabel>Titulação</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione a titulação" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {titulacaoOptions.map((option: any) => (
                                                <SelectItem key={option.id} value={option.descricao}>
                                                    {option.descricao}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Dados do Estágio */}
                <Card>
                    <CardHeader>
                        <CardTitle>Dados do Estágio</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="estagio.modalidade"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Modalidade</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione a modalidade" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {modalidadeOptions.map((option: any) => (
                                                <SelectItem key={option.id} value={option.descricao}>
                                                    {option.descricao}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="estagio.tipoDocumentacao"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Documentação</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o tipo" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {tipoDocumentacaoOptions.map((option: any) => (
                                                <SelectItem key={option.id} value={option.descricao}>
                                                    {option.descricao}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="estagio.dataInicio"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Data de Início Prevista</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP", { locale: ptBR })
                                                    ) : (
                                                        <span>Selecione uma data</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="estagio.cargaHorariaDiaria"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Carga Horária Diária (Horas)</FormLabel>
                                    <Select
                                        onValueChange={(value) => field.onChange(parseInt(value))}
                                        defaultValue={field.value?.toString()}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione as horas" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {[1, 2, 3, 4, 5, 6].map((hours) => (
                                                <SelectItem key={hours} value={hours.toString()}>
                                                    {hours} horas
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="estagio.atribuicoes"
                            render={({ field }) => (
                                <FormItem className="col-span-1 md:col-span-2">
                                    <FormLabel>Atribuições do Estagiário</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Descreva quais serão suas atribuições, quais atividades você desenvolverá em seu estágio"
                                            className="min-h-[100px] placeholder:text-gray-400"
                                            {...field}
                                        />
                                    </FormControl>
                                    <div className="text-sm text-yellow-600 font-semibold mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                                        <p>O texto deve ser DETALHADO sobre as atividades que serão realizadas. Além disso, você deve relacionar essas atividades a competências da sua formação no curso. Escreva corretamente, respeitando todas as normas gramaticais.</p>
                                        <p className="mt-1 font-bold text-red-600">SE O SEU TEXTO FOR INSUFICIENTE, ELE NÃO SERÁ ACEITO.</p>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enviar dados do Estágio
                    </Button>
                </div>
            </form>
        </Form>
    )
}
