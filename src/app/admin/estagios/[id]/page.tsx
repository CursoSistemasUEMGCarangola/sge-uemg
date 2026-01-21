import { getContratoById, getDiarioAtividades } from "@/features/estagio/data"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Stepper } from "@/components/ui/stepper"
import { CheckCircle, XCircle, ExternalLink, FileText, ChevronLeft, FileClock } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ApproveDialog } from "../approve-dialog"
import { RejectDialog } from "../reject-dialog"

import { ContractActions } from "./contract-actions"

export default async function EstagioDetailsPage({ params }: { params: { id: string } }) {
    const id = parseInt(params.id)
    if (isNaN(id)) return notFound()

    const contrato = await getContratoById(id)
    if (!contrato) return notFound()

    // Current Step Logic
    const firstPending = contrato.acompanhamentos.find(a => a.status === 'PENDENTE' || a.status === 'EM_ANALISE' || a.status === 'REJEITADO')
    const currentStepId = firstPending ? firstPending.etapaDef.numeroEtapa : 8
    const isEmAnalise = firstPending?.status === 'EM_ANALISE'

    // Fetch Diary Entries (for Step 4 display)
    const diaryEntries = await getDiarioAtividades(id)
    const totalHoras = diaryEntries.reduce((acc, curr) => acc + curr.horasRealizadas, 0)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{contrato.aluno.profile.nomeCompleto}</h1>
                    <p className="text-muted-foreground mr-4 inline-block">
                        {contrato.oferta?.curso?.nome} - {contrato.oferta?.curso?.periodoVinculado}º Período
                    </p>
                    <Badge variant="outline">{contrato.aluno.matricula}</Badge>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Badge variant={contrato.statusAprovacao === 'APROVADO' ? 'default' : 'secondary'}>
                        {contrato.statusAprovacao === 'APROVADO' ? 'ATIVO' : contrato.statusAprovacao}
                    </Badge>
                    <ContractActions contractId={contrato.id} status={contrato.statusAprovacao || 'PENDENTE'} />
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Left Column: Details */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Dados do Estágio</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-sm">Empresa / Concedente</h4>
                                <p className="text-muted-foreground">{contrato.campo.nomeFantasia}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-semibold text-sm">Modalidade</h4>
                                    <p className="text-muted-foreground">{contrato.modalidade}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm">Carga Horária</h4>
                                    <p className="text-muted-foreground">{contrato.cargaHorariaDiaria}h / dia</p>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm">Supervisor</h4>
                                <p className="text-muted-foreground">{contrato.campo.supervisorNome} ({contrato.campo.supervisorCargo})</p>
                            </div>
                            <Separator />
                            <div>
                                <h4 className="font-semibold text-sm">Atribuições</h4>
                                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{contrato.atribuicoes}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Progress & Actions */}
                <div className="space-y-6">
                    {/* Stepper Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Progresso</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Stepper
                                currentStep={currentStepId}
                                steps={contrato.acompanhamentos.map(a => ({
                                    id: a.etapaDef.numeroEtapa,
                                    label: a.etapaDef.numeroEtapa.toString()
                                }))}
                            />
                        </CardContent>
                    </Card>

                    {/* Action Card */}
                    {contrato.statusAprovacao === 'PENDENTE' ? (
                        <Card className="border-yellow-200 bg-yellow-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-yellow-800">
                                    <FileClock className="h-5 w-5" />
                                    Aguardando Início
                                </CardTitle>
                                <CardDescription className="text-yellow-700">
                                    Este estágio aguarda sua aprovação para iniciar.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm text-yellow-800">
                                Verifique os dados e utilize o botão "Aprovar" no topo da página para iniciar o acompanhamento das etapas.
                            </CardContent>
                        </Card>
                    ) : firstPending ? (
                        <Card className={isEmAnalise ? "border-primary" : ""}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    Etapa Atual: {firstPending.etapaDef.descricao}
                                    {isEmAnalise && <Badge>Em Análise</Badge>}
                                </CardTitle>
                                <CardDescription>
                                    {firstPending.etapaDef.orientacaoTextual}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {firstPending.linkDocumento && (
                                    <div className="p-4 bg-muted rounded-md flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            <span className="text-sm font-medium">Documento enviado</span>
                                        </div>
                                        <a href={firstPending.linkDocumento} target="_blank" rel="noopener noreferrer">
                                            <Button variant="outline" size="sm">
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                Abrir Link
                                            </Button>
                                        </a>
                                    </div>
                                )}
                                {firstPending.idEtapaDef === 6 && contrato.textoRelatorioAvaliacao && ( // Assuming ID 6 is Relatorio
                                    <div className="p-4 bg-muted rounded-md space-y-2">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            <span className="text-sm font-medium">Relatório de Avaliação</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground italic p-2 border-l-2 bg-background">
                                            {contrato.textoRelatorioAvaliacao}
                                        </p>
                                    </div>
                                )}

                                {firstPending.etapaDef.numeroEtapa === 4 && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-semibold">Atividades Registradas</h4>
                                            <Badge variant="outline">Total: {totalHoras}h</Badge>
                                        </div>

                                        {diaryEntries.length === 0 ? (
                                            <div className="text-sm text-muted-foreground italic">Nenhuma atividade registrada.</div>
                                        ) : (
                                            <div className="rounded-md border text-sm">
                                                <table className="w-full">
                                                    <thead className="bg-muted">
                                                        <tr className="text-left">
                                                            <th className="p-2 font-medium">Data</th>
                                                            <th className="p-2 font-medium">Horas</th>
                                                            <th className="p-2 font-medium">Descrição</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {diaryEntries.map((entry) => (
                                                            <tr key={entry.id} className="border-t">
                                                                <td className="p-2">{format(entry.dataAtividade, "dd/MM/yyyy")}</td>
                                                                <td className="p-2">{entry.horasRealizadas}h</td>
                                                                <td className="p-2 text-muted-foreground">{entry.descricaoAtividades}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {!isEmAnalise && (
                                    <div className="text-center text-sm text-muted-foreground py-4">
                                        Aguardando envio do aluno.
                                    </div>
                                )}

                                {isEmAnalise && (
                                    <div className="flex gap-4 pt-4">
                                        <ApproveDialog
                                            contratoId={contrato.id}
                                            etapaId={firstPending.etapaDef.id} // Note: This passes the ID of Def, ensure action expects this
                                            etapaNome={firstPending.etapaDef.descricao}
                                        />
                                        <RejectDialog
                                            contratoId={contrato.id}
                                            etapaId={firstPending.etapaDef.id}
                                            etapaNome={firstPending.etapaDef.descricao}
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="bg-green-50 border-green-200">
                            <CardContent className="py-6 flex flex-col items-center text-center text-green-800">
                                <CheckCircle className="h-12 w-12 mb-4 text-green-600" />
                                <h3 className="text-xl font-bold">Estágio Concluído!</h3>
                                <p>Todas as etapas foram aprovadas.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
