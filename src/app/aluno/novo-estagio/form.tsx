"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

import { Stepper } from "@/components/ui/stepper"
import { DatePicker } from "@/components/forms/date-picker"
import { novoEstagioSchema, NovoEstagioFormData } from "@/features/estagio/schemas"
import { createEstagio } from "@/features/estagio/actions"
import { Modalidade, TipoDocumentacao } from "@prisma/client"

interface NovoEstagioFormProps {
    ofertas: any[] // TODO: Type properly
}

export function NovoEstagioForm({ ofertas }: NovoEstagioFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)
    const { toast } = useToast()
    const router = useRouter()

    const form = useForm<NovoEstagioFormData>({
        resolver: zodResolver(novoEstagioSchema) as any,
        defaultValues: {
            empresa: {
                emailContato: "" // Default empty string for optional email to avoid null issues
            },
            contrato: {
                // Defaults
                modalidade: Modalidade.PRESENCIAL,
                tipoDocumentacao: TipoDocumentacao.TCE
            }
        }
    })

    async function onSubmit(data: NovoEstagioFormData) {
        setIsSubmitting(true)
        const result = await createEstagio(data)

        if (result?.error) {
            toast({
                variant: "destructive",
                title: "Erro ao criar estágio",
                description: result.error
            })
            setIsSubmitting(false)
        } else {
            toast({
                title: "Estágio iniciado!",
                description: "Você será redirecionado para o dashboard."
            })
            // Redirect handled by Server Action or here
        }
    }

    // Split form into conceptual steps for the UI (even if it's one big form for React Hook Form)
    // Step 1: Dados do Estágio (Contrato)
    // Step 2: Dados da Empresa (Campo)
    // Step 3: Supervisor

    // For simplicity in this Phase 2 MVP, we will render all in one page or simple tabs, 
    // but using the Stepper to show "Progresso do Processo" not just form steps.
    // Wait, the Stepper in the requirement is for the 8 steps of the internship process itself, or for the Wizard?
    // "Implement Stepper Component (Visual Indicator of 8 steps)." -> likely the internship lifecycle.
    // "Create 'New Internship' Wizard/Form (Step 1: Dados do Estágio + Empresa)." -> This suggests the form is just the "Step 1" of the whole lifecycle.

    return (
        <div className="space-y-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    {/* 1. Seleção da Oferta e Dados Básicos */}
                    <Card>
                        <CardHeader>
                            <CardTitle>1. Dados do Estágio</CardTitle>
                            <CardDescription>Informe os detalhes do período e modalidade.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="contrato.ofertaId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Período Letivo / Oferta</FormLabel>
                                        <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={field.value?.toString()}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione a oferta" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {ofertas.map((of) => (
                                                    <SelectItem key={of.id} value={of.id.toString()}>
                                                        {of.semestreLetivo} - {of.curso.nome}
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
                                name="contrato.modalidade"
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
                                                {Object.values(Modalidade).map((m) => (
                                                    <SelectItem key={m} value={m}>{m}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="contrato.tipoDocumentacao"
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
                                                {Object.values(TipoDocumentacao).map((t) => (
                                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="contrato.dataInicioPrevista"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Data de Início Prevista</FormLabel>
                                        <DatePicker date={field.value} setDate={field.onChange} />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="contrato.cargaHorariaDiaria"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Carga Horária Diária (Horas)</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={1} max={6} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="contrato.atribuicoes"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Atribuições / Atividades Previstas</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Descreva as atividades que serão realizadas" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* 2. Dados da Empresa (Campo) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>2. Dados da Empresa (Campo de Estágio)</CardTitle>
                            <CardDescription>Informações sobre a empresa concedente.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="empresa.razaoSocial"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Razão Social</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="empresa.nomeFantasia"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome Fantasia</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="empresa.emailContato"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>E-mail da Empresa (Opcional)</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="empresa.telefoneContato"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Telefone da Empresa</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* 3. Supervisor */}
                    <Card>
                        <CardHeader>
                            <CardTitle>3. Supervisor do Estágio</CardTitle>
                            <CardDescription>Quem será o responsável por você na empresa.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="empresa.supervisorNome"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome Completo</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="empresa.supervisorCargo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cargo</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="empresa.supervisorAreaFormacao"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Área de Formação</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="empresa.supervisorTitulacao"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Titulação</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="empresa.supervisorEmail"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>E-mail do Supervisor</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="empresa.supervisorTelefone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Telefone do Supervisor</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={isSubmitting} className="w-full">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Iniciar Processo de Estágio
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </Form>
        </div>
    )
}
