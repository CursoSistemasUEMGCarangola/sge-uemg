import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileClock, CheckCircle2, AlertCircle, Briefcase, FileText } from "lucide-react"
import { getAdminDashboardData } from "@/features/estagio/data"
import { ContratoTable } from "./dashboard/table"
import { getCurrentUserRole } from "@/lib/auth"

export default async function AdminDashboard() {
    const { contratos, ofertas } = await getAdminDashboardData()
    const role = await getCurrentUserRole()

    // Calculate stats
    const pendentes = contratos.filter(c => c.statusAprovacao === 'PENDENTE').length
    const ativos = contratos.filter(c => c.statusAprovacao === 'APROVADO' && !c.dataConclusaoEstagio).length
    const alertas = contratos.filter(c => c.acompanhamentos.some((a: any) => a.status === 'REJEITADO')).length

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Painel de Controle</h1>

            {/* Professor: Cards de Ofertas (Atribuições) - MOVED TO TOP */}
            {role === 'PROFESSOR' && ofertas && ofertas.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-muted-foreground" />
                        Minhas Orientações
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {ofertas.map((oferta: any) => (
                            <Card key={oferta.id} className="border-l-4 border-l-yellow-500 shadow-sm bg-muted/40">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg font-bold">
                                        {oferta.curso.nome}
                                    </CardTitle>
                                    <CardDescription>
                                        Semestre: {oferta.semestreLetivo}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-2">Vínculo de Orientação Ativo</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                                        Disponível para alunos
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Shared: Stats Cards - MOVED TO SECOND */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pendentes de Aprovação</CardTitle>
                        <FileClock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendentes}</div>
                        <p className="text-xs text-muted-foreground">Aguardando ação</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Estágios Ativos</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{ativos}</div>
                        <p className="text-xs text-muted-foreground">Em andamento</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Alertas/Rejeitados</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{alertas}</div>
                        <p className="text-xs text-muted-foreground">Requer atenção</p>
                    </CardContent>
                </Card>
            </div>

            {/* Professor: Lista de Alunos - MOVED TO THIRD (Bottom of Professor/Shared view) */}
            {role === 'PROFESSOR' && contratos.length > 0 && (
                <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                            <tr>
                                <th className="px-4 py-3">Aluno</th>
                                <th className="px-4 py-3">Matrícula</th>
                                <th className="px-4 py-3">Estágio / Curso</th>
                                <th className="px-4 py-3 text-center">Etapas</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {contratos.map((contrato) => (
                                <tr key={contrato.id} className="hover:bg-muted/10 transition-colors">
                                    <td className="px-4 py-3 font-medium text-foreground">
                                        {contrato.aluno.profile.nomeCompleto}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-muted-foreground">
                                        {contrato.aluno.matricula}
                                    </td>
                                    <td className="px-4 py-3 max-w-[200px] truncate" title={`${contrato.oferta?.curso?.nome} - ${contrato.campo.nomeFantasia}`}>
                                        <div className="font-medium text-foreground">{contrato.oferta?.curso?.nome || "Não definido"}</div>
                                        <div className="text-xs text-muted-foreground truncate">
                                            <span className="font-semibold">{contrato.tipoDocumentacao}</span>

                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                                            {contrato.acompanhamentos.length}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${contrato.statusAprovacao === 'APROVADO' ? 'bg-green-100 text-green-700' :
                                            contrato.statusAprovacao === 'REJEITADO' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {contrato.statusAprovacao}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link href={`/admin/estagios/${contrato.id}`}>
                                            <Button size="sm" variant="outline" className="h-8">
                                                Acessar
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Admin Only: Visão Geral (Was at bottom, now restricted to ADMIN) */}
            {role === 'ADMIN' && (
                <div className="grid gap-4 grid-cols-1">
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Visão Geral dos Estágios</CardTitle>
                            <CardDescription>Gerencie as solicitações e acompanhe o progresso.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ContratoTable contratos={contratos} />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
