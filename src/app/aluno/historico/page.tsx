import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Calendar as CalendarIcon, FileDown, History } from "lucide-react"
import { getStudentDashboardData } from "@/features/estagio/data"
import { getCurrentUserRole, createClient } from "@/lib/auth"

export default async function AlunoHistoricoPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>Acesso negado</div>

    const { contratos } = await getStudentDashboardData(user.id)
    const contratosEncerrados = contratos.filter(c => c.statusAprovacao === 'ENCERRADO')

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <History className="h-8 w-8 text-primary" />
                Histórico de Estágios Encerrados
            </h1>
            
            <p className="text-muted-foreground mb-6">
                Consulte seus estágios que foram finalizados e faça o download do Relatório Detalhado de Conclusão.
            </p>

            {contratosEncerrados.length === 0 ? (
                <div className="text-center py-12 border rounded-md bg-muted/10">
                    <p className="text-muted-foreground">Você ainda não possui estágios encerrados no histórico.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {contratosEncerrados.map((contrato) => (
                        <Card key={contrato.id} className="overflow-hidden border-muted">
                            <CardHeader className="bg-muted/30 pb-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg flex items-center gap-2 text-muted-foreground">
                                            <Building2 className="h-5 w-5" />
                                            {contrato.oferta.curso.nome}
                                        </CardTitle>
                                        <CardDescription>
                                            <span className="mr-1">Campo de Estágio: {contrato.campo.nomeFantasia}</span>
                                            <span className="mx-1">• Modalidade: {contrato.modalidade}</span>
                                        </CardDescription>
                                    </div>
                                    <Badge variant="secondary">
                                        {contrato.statusAprovacao}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <CalendarIcon className="h-4 w-4" />
                                        <span>Data de Início: {new Date(contrato.dataInicioPrevista).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Este estágio foi oficialmente encerrado pela coordenação/orientação.
                                </p>
                                <Link href={`/api/relatorios/estagio-aluno/${contrato.id}`} target="_blank">
                                    <Button variant="outline" className="w-full sm:w-auto">
                                        <FileDown className="mr-2 h-4 w-4" />
                                        Baixar Relatório Detalhado (PDF)
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
