"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { updateEstagioAction } from "@/features/estagio/actions"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, ArrowLeft, Printer, Loader2, Save } from "lucide-react"

const capaSchema = z.object({
    supervisor: z.object({
        nome: z.string().min(3, "Nome muito curto"),
        cargo: z.string().min(2, "Cargo obrigatório"),
        formacao: z.string().min(2, "Formação obrigatória"),
        titulacao: z.string().min(2, "Titulação obrigatória"),
        telefone: z.string().min(1, "Telefone obrigatório"),
        email: z.string().email("E-mail inválido"),
    }),
    atribuicoes: z.string().min(10, "Detalhe melhor as atribuições"),
    // New fields
    razaoSocial: z.string().min(2, "Razão Social obrigatória"),
    nomeFantasia: z.string().min(2, "Nome Fantasia obrigatório"),
    telefoneEmpresa: z.string().min(1, "Telefone da empresa obrigatório"),
    emailEmpresa: z.string().email("Email da empresa inválido"),
    modalidade: z.string().min(1, "Modalidade obrigatória"),
    cargaHorariaDiaria: z.number().min(1, "Carga horária deve ser maior que 0").max(6, "Máximo de 6 horas diárias"),
    dataInicioPrevista: z.string().min(1, "Data de início obrigatória"),
})

type CapaFormValues = z.infer<typeof capaSchema>

interface CapaFormProps {
    contrato: any
    informacoesGerais?: any[]
    canEdit?: boolean
}

export function CapaForm({ contrato, canEdit = false }: CapaFormProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isSaving, setIsSaving] = useState(false)

    const form = useForm<CapaFormValues>({
        resolver: zodResolver(capaSchema),
        defaultValues: {
            supervisor: {
                nome: contrato.campo.supervisorNome || "",
                cargo: contrato.campo.supervisorCargo || "",
                formacao: contrato.campo.supervisorAreaFormacao || "",
                titulacao: contrato.campo.supervisorTitulacao || "",
                telefone: contrato.campo.supervisorTelefone || "",
                email: contrato.campo.supervisorEmail || "",
            },
            atribuicoes: contrato.atribuicoes || "",
            razaoSocial: contrato.campo.razaoSocial || "",
            nomeFantasia: contrato.campo.nomeFantasia || "",
            telefoneEmpresa: contrato.campo.telefoneContato || "",
            emailEmpresa: contrato.campo.emailContato || "",
            modalidade: contrato.modalidade || "",
            cargaHorariaDiaria: contrato.cargaHorariaDiaria || 0,
            dataInicioPrevista: contrato.dataInicioPrevista ? new Date(contrato.dataInicioPrevista).toISOString().split('T')[0] : "",
        }
    })

    const handleGeneratePDF = () => {
        window.open(`/aluno/docs/capa/${contrato.id}/pdf`, '_blank')
    }

    async function onSubmit(data: CapaFormValues) {
        setIsSaving(true)
        try {
            const res = await updateEstagioAction(contrato.id, data)
            if ('success' in res && res.success) {
                toast({ title: "Sucesso", description: "Dados atualizados com sucesso!" })
                router.refresh()
            } else {
                toast({ title: "Erro", description: ('error' in res ? res.error : "Falha ao salvar"), variant: "destructive" })
            }
        } catch (error) {
            toast({ title: "Erro", description: "Erro inesperado.", variant: "destructive" })
        } finally {
            setIsSaving(false)
        }
    }

    // Helper to format date
    const formatDate = (date: string | Date) => {
        if (!date) return "-"
        return format(new Date(date), "dd/MM/yyyy", { locale: ptBR })
    }

    return (
        <Card className="w-full max-w-5xl mx-auto shadow-lg">
            <CardHeader className="bg-muted/30 pb-6 border-b">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-2xl font-bold">Capa do Estágio</CardTitle>
                        <CardDescription className="text-base mt-2">
                            {canEdit 
                                ? "Confira e ajuste as informações abaixo antes de gerar o PDF."
                                : "Confira as informações que constarão no seu documento de capa."
                            }
                        </CardDescription>
                    </div>
                    <Button
                        type="button"
                        variant="default"
                        size="lg"
                        className="bg-green-600 hover:bg-green-700 font-semibold shadow-md"
                        onClick={handleGeneratePDF}
                    >
                        <Printer className="mr-2 h-5 w-5" />
                        Gerar PDF / Imprimir
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    {/* SECTION 1: DADOS DO ALUNO */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2 text-primary">
                            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">1</span>
                            Identificação do Estagiário
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Nome Completo</Label>
                                <Input value={contrato.aluno.profile.nomeCompleto} disabled className="font-semibold text-foreground bg-muted/50" />
                            </div>
                            <div className="space-y-2">
                                <Label>Matrícula</Label>
                                <Input value={contrato.aluno.matricula} disabled className="bg-muted/50" />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input value={contrato.aluno.profile.email} disabled className="bg-muted/50" />
                            </div>
                            <div className="space-y-2">
                                <Label>Telefone</Label>
                                <Input value={contrato.aluno.profile.telefone || '-'} disabled className="bg-muted/50" />
                            </div>
                            <div className="space-y-2">
                                <Label>Curso</Label>
                                <Input value={contrato.oferta.curso.nome} disabled className="bg-muted/50" />
                            </div>
                            <div className="space-y-2">
                                <Label>Período</Label>
                                <Input value={`${contrato.oferta.curso.periodoVinculado}º Período`} disabled className="bg-muted/50" />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: DADOS DA EMPRESA */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2 text-primary">
                            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">2</span>
                            Identificação da Unidade Concedente (Empresa)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Razão Social</Label>
                                <Input 
                                    {...form.register("razaoSocial")}
                                    disabled={!canEdit} 
                                    className={!canEdit ? "font-medium bg-muted/50" : "font-medium bg-white"} 
                                />
                                {form.formState.errors.razaoSocial && <p className="text-xs text-red-500">{form.formState.errors.razaoSocial.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Nome Fantasia</Label>
                                <Input 
                                    {...form.register("nomeFantasia")}
                                    disabled={!canEdit} 
                                    className={!canEdit ? "bg-muted/50" : "bg-white"} 
                                />
                                {form.formState.errors.nomeFantasia && <p className="text-xs text-red-500">{form.formState.errors.nomeFantasia.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Telefone da Empresa</Label>
                                <Input 
                                    {...form.register("telefoneEmpresa")}
                                    disabled={!canEdit} 
                                    className={!canEdit ? "bg-muted/50" : "bg-white"} 
                                />
                                {form.formState.errors.telefoneEmpresa && <p className="text-xs text-red-500">{form.formState.errors.telefoneEmpresa.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Email da Empresa</Label>
                                <Input 
                                    {...form.register("emailEmpresa")}
                                    disabled={!canEdit} 
                                    className={!canEdit ? "bg-muted/50" : "bg-white"} 
                                />
                                {form.formState.errors.emailEmpresa && <p className="text-xs text-red-500">{form.formState.errors.emailEmpresa.message}</p>}
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-muted/20 rounded-lg border border-muted">
                            <h4 className="font-semibold text-sm mb-4 text-muted-foreground uppercase tracking-wider">Dados do Supervisor</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Nome do Supervisor</Label>
                                    <Input 
                                        {...form.register("supervisor.nome")} 
                                        disabled={!canEdit}
                                        placeholder="Nome completo do supervisor na empresa"
                                        className={!canEdit ? "bg-muted/50" : "bg-white"} 
                                    />
                                    {form.formState.errors.supervisor?.nome && <p className="text-xs text-red-500">{form.formState.errors.supervisor.nome.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Cargo</Label>
                                    <Input 
                                        {...form.register("supervisor.cargo")} 
                                        disabled={!canEdit}
                                        className={!canEdit ? "bg-muted/50" : "bg-white"} 
                                    />
                                    {form.formState.errors.supervisor?.cargo && <p className="text-xs text-red-500">{form.formState.errors.supervisor.cargo.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Formação Acadêmica</Label>
                                    <Input 
                                        {...form.register("supervisor.formacao")} 
                                        disabled={!canEdit}
                                        className={!canEdit ? "bg-muted/50" : "bg-white"} 
                                    />
                                    {form.formState.errors.supervisor?.formacao && <p className="text-xs text-red-500">{form.formState.errors.supervisor.formacao.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Titulação</Label>
                                    <Input 
                                        {...form.register("supervisor.titulacao")} 
                                        disabled={!canEdit}
                                        className={!canEdit ? "bg-muted/50" : "bg-white"} 
                                    />
                                    {form.formState.errors.supervisor?.titulacao && <p className="text-xs text-red-500">{form.formState.errors.supervisor.titulacao.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Email do Supervisor</Label>
                                    <Input 
                                        {...form.register("supervisor.email")} 
                                        disabled={!canEdit}
                                        className={!canEdit ? "bg-muted/50" : "bg-white"} 
                                    />
                                    {form.formState.errors.supervisor?.email && <p className="text-xs text-red-500">{form.formState.errors.supervisor.email.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Telefone do Supervisor</Label>
                                    <Input 
                                        {...form.register("supervisor.telefone")} 
                                        disabled={!canEdit}
                                        className={!canEdit ? "bg-muted/50" : "bg-white"} 
                                    />
                                    {form.formState.errors.supervisor?.telefone && <p className="text-xs text-red-500">{form.formState.errors.supervisor.telefone.message}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: DADOS DO ESTÁGIO */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2 text-primary">
                            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">3</span>
                            Dados do Estágio
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label>Modalidade</Label>
                                <Input 
                                    {...form.register("modalidade")}
                                    disabled={!canEdit} 
                                    className={!canEdit ? "bg-muted/50" : "bg-white"} 
                                />
                                {form.formState.errors.modalidade && <p className="text-xs text-red-500">{form.formState.errors.modalidade.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Carga Horária Diária</Label>
                                <Input 
                                    {...form.register("cargaHorariaDiaria", { valueAsNumber: true })}
                                    type="number"
                                    disabled={!canEdit} 
                                    className={!canEdit ? "bg-muted/50" : "bg-white"} 
                                />
                                {form.formState.errors.cargaHorariaDiaria && <p className="text-xs text-red-500">{form.formState.errors.cargaHorariaDiaria.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Data de Início Prevista</Label>
                                <Input 
                                    {...form.register("dataInicioPrevista")}
                                    type="date"
                                    disabled={!canEdit} 
                                    className={!canEdit ? "bg-muted/50" : "bg-white"} 
                                />
                                {form.formState.errors.dataInicioPrevista && <p className="text-xs text-red-500">{form.formState.errors.dataInicioPrevista.message}</p>}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Atribuições / Plano de Atividades</Label>
                            <Textarea
                                {...form.register("atribuicoes")}
                                disabled={!canEdit}
                                className={`min-h-[150px] resize-none text-foreground ${!canEdit ? "bg-muted/50" : "bg-white"}`}
                            />
                            {form.formState.errors.atribuicoes && <p className="text-xs text-red-500">{form.formState.errors.atribuicoes.message}</p>}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-between pt-6 border-t items-center">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar
                        </Button>

                        {canEdit && (
                            <Button 
                                type="submit" 
                                className="bg-primary px-8 hover:brightness-110 transition-all font-bold min-w-[200px]"
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Salvar Alterações
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
