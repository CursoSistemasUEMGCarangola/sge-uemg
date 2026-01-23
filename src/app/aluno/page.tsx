import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Building2, Calendar as CalendarIcon, Clock, BookOpen, Rocket, FileText, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getStudentDashboardData } from "@/features/estagio/data"
import { getCurrentUserRole, createClient } from "@/lib/auth"
import { Stepper } from "@/components/ui/stepper"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { SubmitLinkDialog } from "./submit-link-dialog"

export default async function AlunoDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>Acesso negado</div>

    const { contratos } = await getStudentDashboardData(user.id)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <Link href="/aluno/novo-estagio">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Iniciar Novo Estágio
                    </Button>
                </Link>
            </div>

            {contratos.length === 0 ? (
                <Card className="border-dashed border-2 shadow-none bg-muted/20">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="rounded-full bg-background p-4 mb-4 shadow-sm">
                            <Rocket className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold">Comece sua jornada de estágio</h3>
                        <p className="text-muted-foreground max-w-sm mt-2 mb-6">
                            Você ainda não tem nenhum processo de estágio cadastrado.
                            Inicie um novo processo para regularizar sua situação.
                        </p>
                        <Link href="/aluno/novo-estagio">
                            <Button size="lg" className="font-semibold">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Iniciar Novo Estágio
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {contratos.map((contrato) => {
                        // Determine current step index (1-based because Stepper expects IDs)
                        // Logic: Find first PENDING step. If all approved, check status.
                        const firstPending = contrato.acompanhamentos.find(a => a.status === 'PENDENTE' || a.status === 'EM_ANALISE' || a.status === 'REJEITADO')
                        const currentStepId = firstPending ? firstPending.etapaDef.numeroEtapa : 8

                        return (
                            <Card key={contrato.id} className="overflow-hidden">
                                <CardHeader className="bg-muted/50 pb-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Building2 className="h-5 w-5 text-muted-foreground" />
                                                {contrato.oferta.curso.nome}
                                            </CardTitle>
                                            <CardDescription>
                                                <span className="font-semibold mr-1">Campo de Estágio: {contrato.campo.nomeFantasia}</span>
                                                <span className="font-semibold mx-1">•
                                                    Modalidade: {contrato.modalidade}</span>
                                                <span className="font-semibold mx-1">•
                                                    Carga horária: {contrato.cargaHorariaDiaria}h/dia</span>
                                            </CardDescription>
                                        </div>
                                        <Badge variant={contrato.statusAprovacao === 'ATIVO' ? 'success' : contrato.statusAprovacao === 'REJEITADO' ? 'destructive' : 'secondary'}>
                                            {contrato.statusAprovacao}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                            <span>Início: {new Date(contrato.dataInicioPrevista).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span>Atualizado há pouco</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium">Progresso das Etapas</h4>
                                        {/* We map definitions to the Stepper format */}
                                        <Stepper
                                            currentStep={currentStepId}
                                            steps={contrato.acompanhamentos.map(a => ({
                                                id: a.etapaDef.numeroEtapa,
                                                label: a.etapaDef.numeroEtapa.toString() // Simplified label for space
                                            }))}
                                        />

                                        {/* Feedback / Rejection Alert */}
                                        {firstPending?.observacoes && (
                                            <div className="mt-6 mb-2"><br />
                                                <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertTitle className="font-bold flex items-center justify-between gap-2">
                                                        <span>Atenção: Correção Necessária na Etapa {firstPending.etapaDef.numeroEtapa}</span>
                                                        <span className="text-xs font-normal opacity-80">
                                                            {firstPending.updatedAt && new Date(firstPending.updatedAt).toLocaleDateString('pt-BR')}
                                                        </span>
                                                    </AlertTitle>
                                                    <AlertDescription className="mt-2 text-sm font-medium">
                                                        {firstPending.observacoes}
                                                    </AlertDescription>
                                                </Alert>
                                            </div>
                                        )}

                                        <div className="mt-4 text-center">
                                            <p className="text-lg text-muted-foreground">
                                                <br />Etapa Atual: <span className="font-bold text-xl text-primary">
                                                    {contrato.statusAprovacao === 'PENDENTE'
                                                        ? "PENDENTE: AGUARDANDO APROVAÇÃO DO PROFESSOR ORIENTADOR"
                                                        : (firstPending?.etapaDef.descricao || "Concluído")
                                                    }
                                                </span>
                                            </p>
                                            <p className="text-base font-medium text-foreground mt-2">
                                                {firstPending?.etapaDef.orientacaoTextual}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-muted/20 flex flex-col items-end gap-2 p-4 sm:flex-row sm:justify-end">
                                    {/* Deadline Display */}
                                    {firstPending && firstPending.etapaDef.prazoDias > 0 && (() => {
                                        let deadline = firstPending.dataLimite ? new Date(firstPending.dataLimite) : null;
                                        if (!deadline && firstPending.updatedAt) {
                                            const updated = new Date(firstPending.updatedAt);
                                            updated.setDate(updated.getDate() + firstPending.etapaDef.prazoDias);
                                            deadline = updated;
                                        }

                                        return (
                                            <div className={`text-sm mr-auto flex items-center gap-1 ${deadline && new Date() > deadline ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>
                                                <Clock className="h-4 w-4" />
                                                Prazo para concluir esta etapa: {deadline ? deadline.toLocaleDateString('pt-BR') : 'A definir'}
                                            </div>
                                        );
                                    })()}

                                    {/* Sequential Access Logic: Action Button visible only if:
                                        1. It's the current pending stage
                                        2. AND the PREVIOUS stage is completed (ATIVO) OR it's the first stage
                                    */}
                                    {(() => {
                                        if (!firstPending) return <Button variant="outline" size="sm" disabled>Concluído</Button>

                                        const currentStepIndex = contrato.acompanhamentos.findIndex(a => a.id === firstPending.id)
                                        const previousStep = currentStepIndex > 0 ? contrato.acompanhamentos[currentStepIndex - 1] : null
                                        const isUnlocked = !previousStep || previousStep.status === 'ATIVO'

                                        if (!isUnlocked) {
                                            return (
                                                <div className="flex items-center gap-2 text-muted-foreground bg-muted/30 px-3 py-2 rounded text-sm">
                                                    <Clock className="h-4 w-4" />
                                                    <span>Aguardando conclusão da etapa anterior</span>
                                                </div>
                                            )
                                        }

                                        // Render Action Button based on systemAction
                                        if (firstPending.etapaDef.systemAction === 'GENERATE_DOC_CAPA') {
                                            return (
                                                <div className="w-full flex justify-end sm:flex-1">
                                                    <Link href={`/aluno/docs/capa/${contrato.id}/editar`} className="w-full sm:w-auto">
                                                        <Button size="lg" className="w-full sm:min-w-[250px] text-lg font-bold shadow-lg" variant="default">
                                                            <FileText className="mr-2 h-5 w-5" />
                                                            Emitir a Capa do Estágio
                                                        </Button>
                                                    </Link>
                                                </div>
                                            )
                                        }

                                        if (firstPending.etapaDef.systemAction === 'FILL_ACTIVITY_PLAN' || firstPending.etapaDef.numeroEtapa === 4) {
                                            return (
                                                <div className="w-full flex justify-end sm:flex-1">
                                                    <Link href={`/aluno/diario/${contrato.id}`} className="w-full sm:w-auto">
                                                        <Button size="lg" className="w-full sm:min-w-[250px] text-lg font-bold shadow-lg" variant="default">
                                                            <BookOpen className="mr-2 h-5 w-5" />
                                                            Preencher Plano de Atividades
                                                        </Button>
                                                    </Link>
                                                </div>
                                            )
                                        }

                                        return (
                                            <Button variant="outline" size="sm" disabled>
                                                Aguardando Ação do Professor
                                            </Button>
                                        )
                                    })()}
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
