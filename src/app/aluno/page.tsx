import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Building2, Calendar as CalendarIcon, Clock, BookOpen, Rocket } from "lucide-react"
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
                                                {contrato.campo.nomeFantasia}
                                            </CardTitle>
                                            <CardDescription>
                                                <span className="font-semibold mr-1">{contrato.oferta.curso.nome}</span>
                                                <span className="font-semibold mx-1">•
                                                    Modalidade: {contrato.modalidade}</span>
                                                <span className="font-semibold mx-1">•
                                                    Carga horária: {contrato.cargaHorariaDiaria}h/dia</span>
                                            </CardDescription>
                                        </div>
                                        <Badge variant={contrato.statusAprovacao === 'APROVADO' ? 'default' : 'secondary'}>
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
                                            <p className="text-sm text-muted-foreground">
                                                Etapa Atual: <span className="font-medium text-foreground">{firstPending?.etapaDef.descricao || "Concluído"}</span>
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {firstPending?.etapaDef.orientacaoTextual}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-muted/20 flex justify-end gap-2 p-4">
                                    <Link href={`/aluno/diario/${contrato.id}`}>
                                        <Button variant="outline" size="sm">
                                            <BookOpen className="mr-2 h-4 w-4" />
                                            Diário
                                        </Button>
                                    </Link>
                                    {firstPending && (
                                        <SubmitLinkDialog
                                            contratoId={contrato.id}
                                            etapaId={firstPending.etapaDef.id}
                                            etapaNumero={firstPending.etapaDef.numeroEtapa}
                                            etapaNome={firstPending.etapaDef.descricao}
                                            currentLink={firstPending.linkDocumento}
                                            currentText={contrato.textoRelatorioAvaliacao}
                                        />
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
