import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Building2, Calendar as CalendarIcon, Clock, BookOpen, Rocket, FileText } from "lucide-react"
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
                                    {firstPending?.dataLimite && (
                                        <div className={`text-sm mr-auto flex items-center gap-1 ${new Date() > new Date(firstPending.dataLimite) ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>
                                            <Clock className="h-4 w-4" />
                                            Prazo: {new Date(firstPending.dataLimite).toLocaleDateString('pt-BR')}
                                        </div>
                                    )}

                                    {/* Actions based on systemAction */}
                                    {/* Fallback for hardcoded Step 4 or mapped action */}
                                    {(firstPending?.etapaDef.numeroEtapa === 4 || firstPending?.etapaDef.systemAction === 'FILL_ACTIVITY_PLAN') && (
                                        <Link href={`/aluno/diario/${contrato.id}`}>
                                            <Button variant="outline" size="sm">
                                                <BookOpen className="mr-2 h-4 w-4" />
                                                Plano de Atividades do Estágio
                                            </Button>
                                        </Link>
                                    )}

                                    {firstPending?.etapaDef.systemAction === 'GENERATE_DOC_CAPA' && (
                                        <Link href={`/aluno/docs/capa/${contrato.id}/editar`}>
                                            <Button variant="outline" size="sm">
                                                <FileText className="mr-2 h-4 w-4" />
                                                Preencher Capa
                                            </Button>
                                        </Link>
                                    )}

                                    {!firstPending && <Button variant="outline" size="sm" disabled>Concluído</Button>}
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
