import { getContratoById } from "@/features/estagio/data"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Stepper } from "@/components/ui/stepper"
import { approveStage, rejectStage } from "@/features/estagio/actions"
import { CheckCircle, XCircle, FileText, User, Building2, Download } from "lucide-react"

export default async function AdminDetalhesEstagioPage({ params }: { params: { id: string } }) {
    const id = parseInt(params.id)
    if (isNaN(id)) notFound()

    const contrato = await getContratoById(id)
    if (!contrato) notFound()

    // Find current active stage (first not approved)
    // Or last interaction.
    const currentStepIndex = contrato.acompanhamentos.findIndex(a => a.status === 'PENDENTE' || a.status === 'REJEITADO')
    const activeStage = currentStepIndex !== -1 ? contrato.acompanhamentos[currentStepIndex] : null
    const isCompleted = currentStepIndex === -1 && contrato.acompanhamentos.every(a => a.status === 'APROVADO')

    // Review Actions Wrapper
    async function handleApprove() {
        "use server"
        if (activeStage) {
            await approveStage(contrato!.id, activeStage.idEtapaDef)
        }
    }

    async function handleReject(formData: FormData) {
        "use server"
        if (activeStage) {
            const feedback = formData.get('feedback') as string
            await rejectStage(contrato!.id, activeStage.idEtapaDef, feedback)
        }
    }

    const steps = [
        { id: 1, label: "Entrega TCE" },
        { id: 2, label: "Deferimento TCE" },
        { id: 3, label: "Plano Atividades" },
        { id: 4, label: "Deferimento Plano" },
        { id: 5, label: "Relatório" },
        { id: 6, label: "Avaliação" },
        { id: 7, label: "Termo Realização" },
        { id: 8, label: "Deferimento Final" },
    ]

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Detalhes do Estágio #{contrato.id}</h1>
                    <p className="text-muted-foreground">Analise as informações e o progresso do aluno.</p>
                </div>
                <div className="flex items-center gap-2">
                    {contrato.textoRelatorioAvaliacao && (
                        <a href={`/api/documents/relatorio/${contrato.id}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline">
                                <FileText className="mr-2 h-4 w-4" />
                                Baixar Relatório
                            </Button>
                        </a>
                    )}
                    {contrato.statusAprovacao === 'APROVADO' && (
                        <a href={`/api/documents/termo/${contrato.id}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline">
                                <Download className="mr-2 h-4 w-4" />
                                Baixar Termo
                            </Button>
                        </a>
                    )}
                    <Badge variant={contrato.statusAprovacao === 'APROVADO' ? 'default' : 'secondary'} className="text-lg px-4 py-1">
                        {contrato.statusAprovacao}
                    </Badge>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Student & Course Info */}
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <User className="h-8 w-8 text-muted-foreground" />
                        <div>
                            <CardTitle>Aluno</CardTitle>
                            <CardDescription>{contrato.aluno.profile.nomeCompleto}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-2">
                        <div className="flex justify-between">
                            <span className="font-semibold">Email:</span>
                            <span>{contrato.aluno.profile.email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold">Curso:</span>
                            <span>{contrato.oferta.curso.nome}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold">Matrícula:</span>
                            <span>{contrato.aluno.matricula}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Company Info */}
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Building2 className="h-8 w-8 text-muted-foreground" />
                        <div>
                            <CardTitle>Empresa / Campo</CardTitle>
                            <CardDescription>{contrato.campo.nomeFantasia}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-2">
                        <div className="flex justify-between">
                            <span className="font-semibold">Supervisor:</span>
                            <span>{contrato.campo.supervisorNome}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold">Email Contato:</span>
                            <span>{contrato.campo.emailContato || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold">Telefone:</span>
                            <span>{contrato.campo.telefoneContato || '-'}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Separator />

            <div className="grid gap-8 md:grid-cols-3">
                {/* Timeline / Stepper */}
                <div className="md:col-span-2 space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Progresso das Etapas
                    </h2>
                    <Card>
                        <CardContent className="pt-6">
                            <Stepper steps={steps} currentStep={isCompleted ? 9 : (currentStepIndex !== -1 ? currentStepIndex + 1 : 1)} />

                            <div className="mt-8 space-y-4">
                                {contrato.acompanhamentos.map((acomp) => (
                                    <div key={acomp.idEtapaDef} className={`flex items-start gap-4 p-4 rounded-lg border ${acomp.idEtapaDef === activeStage?.idEtapaDef ? 'bg-muted/50 border-primary' : ''}`}>
                                        <div className={`mt-1 h-3 w-3 rounded-full ${acomp.status === 'APROVADO' ? 'bg-green-500' : acomp.status === 'REJEITADO' ? 'bg-red-500' : 'bg-gray-300'}`} />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium">{acomp.etapaDef.descricao}</h4>
                                                <div className="flex items-center gap-2">
                                                    {acomp.linkDocumento && (
                                                        <a href={acomp.linkDocumento} target="_blank" rel="noopener noreferrer">
                                                            <Button size="icon" variant="ghost" className="h-6 w-6">
                                                                <FileText className="h-4 w-4 text-blue-500" />
                                                            </Button>
                                                        </a>
                                                    )}
                                                    <Badge variant="outline">{acomp.status}</Badge>
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">{acomp.etapaDef.orientacaoTextual}</p>
                                            {acomp.observacoes && (
                                                <div className="mt-2 bg-red-50 text-red-700 p-2 rounded text-sm">
                                                    Feedback: {acomp.observacoes}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Review Panel */}
                <div className="md:col-span-1">
                    <h2 className="text-xl font-semibold mb-6">Ações de Revisão</h2>
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle>Etapa Atual: {activeStage ? activeStage.idEtapaDef : 'Concluído'}</CardTitle>
                            <CardDescription>
                                {activeStage ? activeStage.etapaDef.descricao : 'Todas as etapas foram concluídas.'}
                            </CardDescription>
                        </CardHeader>
                        {activeStage && (
                            <CardContent className="space-y-4">
                                <form action={handleApprove}>
                                    <Button className="w-full bg-green-600 hover:bg-green-700" type="submit">
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Aprovar Etapa
                                    </Button>
                                </form>

                                <Separator />

                                <form action={handleReject} className="space-y-2">
                                    <label className="text-sm font-medium">Motivo da Rejeição / Feedback</label>
                                    <textarea
                                        name="feedback"
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Descreva o que precisa ser corrigido..."
                                        required
                                    />
                                    <Button variant="destructive" className="w-full" type="submit">
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Solicitar Correção
                                    </Button>
                                </form>
                            </CardContent>
                        )}
                        {!activeStage && isCompleted && (
                            <CardContent>
                                <div className="text-center text-green-600 font-medium p-4 bg-green-50 rounded-lg">
                                    Processo Finalizado com Sucesso!
                                </div>
                            </CardContent>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    )
}
