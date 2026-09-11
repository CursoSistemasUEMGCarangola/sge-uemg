import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Building2, Calendar as CalendarIcon, Clock, BookOpen, Rocket, FileText, AlertCircle, FileDown, History, MessageSquare } from "lucide-react"
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

    const contratosAtivos = contratos.filter(c => c.statusAprovacao !== 'ENCERRADO')

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Painel do Aluno</h1>
                    <p className="text-muted-foreground">Acompanhe seus estágios e submeta os documentos necessários.</p>
                </div>
                <Link href="/aluno/novo">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Iniciar Novo Estágio
                    </Button>
                </Link>
            </div>

            {contratosAtivos.length === 0 ? (
                <div className="text-center py-12 border rounded-md bg-muted/10">
                    <p className="text-muted-foreground mb-4">Você ainda não possui nenhum processo de estágio em andamento.</p>
                    <Link href="/aluno/novo">
                        <Button variant="outline">Cadastrar Primeiro Estágio</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {contratosAtivos.map((contrato) => {
                        // Determine current step index (1-based because Stepper expects IDs)
                        // Logic: Find first PENDING step. If all approved, check status.
                        const sortedAcompanhamentos = [...contrato.acompanhamentos].sort((a, b) => a.etapaDef.numeroEtapa - b.etapaDef.numeroEtapa)
                        const firstPending = sortedAcompanhamentos.find(a => a.status === 'PENDENTE' || a.status === 'EM_ANALISE' || a.status === 'REJEITADO')
                        const totalSteps = sortedAcompanhamentos.length
                        const currentStepId = firstPending ? firstPending.etapaDef.numeroEtapa : (totalSteps + 1)

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
                                    {/* Contract Rejection Alert */}
                                    {contrato.statusAprovacao === 'REJEITADO' && (
                                        <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-900 shadow-sm flex items-start gap-3">
                                            <AlertCircle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="font-bold text-red-800 text-base">Estágio Indeferido / Rejeitado pelo Professor Orientador</h4>
                                                <p className="text-sm text-red-700 mt-1">
                                                    <strong>Justificativa Oficial:</strong> {contrato.observacoesProfessor || "Sem parecer detalhado registrado. Entre em contato com seu orientador."}
                                                </p>
                                                <p className="text-xs text-red-600 mt-2 font-medium">
                                                    Este estágio não pode prosseguir. Entre em contato com a coordenação/orientação ou registre uma nova solicitação caso necessário.
                                                </p>
                                            </div>
                                        </div>
                                    )}

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

                                        {/* Feedback / Rejection Alert vs Pedagogical Orientation */}
                                        {firstPending?.observacoes && (
                                            <div className="mt-6 mb-2"><br />
                                                {firstPending.status === 'REJEITADO' ? (
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
                                                ) : (
                                                    <Alert className="bg-blue-50/90 border-blue-200 text-blue-900">
                                                        <MessageSquare className="h-4 w-4 text-blue-600" />
                                                        <AlertTitle className="font-bold flex items-center justify-between gap-2 text-blue-900">
                                                            <span>Orientação do Professor Orientador (Etapa {firstPending.etapaDef.numeroEtapa})</span>
                                                            <span className="text-xs font-normal text-blue-700 opacity-80">
                                                                {firstPending.updatedAt && new Date(firstPending.updatedAt).toLocaleDateString('pt-BR')}
                                                            </span>
                                                        </AlertTitle>
                                                        <AlertDescription className="mt-2 text-sm font-medium text-blue-800">
                                                            {firstPending.observacoes}
                                                        </AlertDescription>
                                                    </Alert>
                                                )}
                                            </div>
                                        )}

                                        <div className="mt-4 text-center">
                                            <p className="text-lg text-muted-foreground">
                                                <br />Etapa Atual: <span className="font-bold text-xl text-primary">
                                                    {contrato.statusAprovacao === 'REJEITADO'
                                                        ? "ESTÁGIO INDEFERIDO / REJEITADO"
                                                        : contrato.statusAprovacao === 'PENDENTE'
                                                            ? "PENDENTE: AGUARDANDO APROVAÇÃO DO PROFESSOR ORIENTADOR"
                                                            : (firstPending?.etapaDef.descricao || "Concluído")
                                                    }
                                                </span>
                                            </p>
                                            <p className="text-base font-medium text-foreground mt-2">
                                                {contrato.statusAprovacao === 'REJEITADO'
                                                    ? "Consulte a justificativa oficial do orientador acima."
                                                    : firstPending?.etapaDef.orientacaoTextual
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-muted/20 flex flex-col items-end gap-2 p-4 sm:flex-row sm:justify-end">
                                    {/* Deadline Display */}
                                    {firstPending && firstPending.etapaDef.prazoDias > 0 && (() => {
                                        const currentIndex = sortedAcompanhamentos.findIndex(a => a.id === firstPending.id)
                                        let baseDate: Date;
                                        
                                        const isFinalReport = firstPending.etapaDef.systemAction === 'FILL_FINAL_REPORT';
                                        let extraDays = 0;

                                        if (isFinalReport && contrato.diarios && contrato.diarios.length > 0) {
                                            baseDate = new Date(contrato.diarios[0].dataAtividade);
                                            extraDays = 1; // "a partir do dia seguinte"
                                        } else if (currentIndex > 0) {
                                            const prevStage = sortedAcompanhamentos[currentIndex - 1]
                                            baseDate = prevStage.dataConclusao 
                                                ? new Date(prevStage.dataConclusao) 
                                                : new Date(contrato.dataInicioPrevista)
                                        } else {
                                            baseDate = new Date(contrato.dataInicioPrevista)
                                        }
                                        
                                        const toLocalDate = (date: Date) => {
                                            return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
                                        }
                                        
                                        const deadline = toLocalDate(baseDate);
                                        deadline.setDate(deadline.getDate() + firstPending.etapaDef.prazoDias + extraDays);

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
                                        if (contrato.statusAprovacao === 'REJEITADO') {
                                            return (
                                                <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 px-4 py-2 rounded-md text-sm font-medium">
                                                    <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                                                    <span>Processo de estágio indeferido. Consulte a justificativa oficial acima.</span>
                                                </div>
                                            )
                                        }

                                        if (!firstPending) {
                                            // Concluído (aguardando professor encerrar ou apenas 100%)
                                            return (
                                                <div className="w-full flex justify-end sm:flex-1">
                                                    <Link href={`/api/relatorios/estagio-aluno/${contrato.id}`} target="_blank" className="w-full sm:w-auto">
                                                        <Button size="lg" className="w-full sm:min-w-[250px] text-lg font-bold shadow-lg bg-green-600 hover:bg-green-700" variant="default">
                                                            <FileDown className="mr-2 h-5 w-5" />
                                                            Baixar Relatório Detalhado
                                                        </Button>
                                                    </Link>
                                                </div>
                                            )
                                        }

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

                                        if (firstPending.etapaDef.systemAction === 'FILL_FINAL_REPORT') {
                                            let isLockedByDate = false;
                                            let dateToUnlock: Date | null = null;
                                            
                                            if (contrato.diarios && contrato.diarios.length > 0) {
                                                const lastActivityDate = new Date(contrato.diarios[0].dataAtividade);
                                                const toLocalDate = (date: Date) => new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
                                                const lastActLocal = toLocalDate(lastActivityDate);
                                                
                                                const nowBrazilStr = new Date().toLocaleString("en-US", {timeZone: "America/Sao_Paulo"});
                                                const nowBrazil = new Date(nowBrazilStr);
                                                const currentLocal = new Date(nowBrazil.getFullYear(), nowBrazil.getMonth(), nowBrazil.getDate());
                                                
                                                if (currentLocal <= lastActLocal) {
                                                    isLockedByDate = true;
                                                    dateToUnlock = new Date(lastActLocal);
                                                    dateToUnlock.setDate(dateToUnlock.getDate() + 1);
                                                }
                                            }

                                            if (isLockedByDate) {
                                                return (
                                                    <div className="w-full flex justify-end sm:flex-1">
                                                        <div className="flex items-center gap-2 bg-amber-100/50 border border-amber-200 text-amber-800 px-4 py-2 rounded-md font-medium text-sm shadow-sm">
                                                            <Clock className="h-4 w-4" />
                                                            <span>Disponível em: <strong>{dateToUnlock?.toLocaleDateString('pt-BR')}</strong></span>
                                                        </div>
                                                    </div>
                                                )
                                            }

                                            return (
                                                <div className="w-full flex justify-end sm:flex-1">
                                                    <Link href={`/aluno/relatorio-final/${contrato.id}`} className="w-full sm:w-auto">
                                                        <Button size="lg" className="w-full sm:min-w-[250px] text-lg font-bold shadow-lg bg-green-600 hover:bg-green-700" variant="default">
                                                            <FileText className="mr-2 h-5 w-5" />
                                                            Preencher Relatório Final
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
