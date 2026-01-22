import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileClock, CheckCircle2, AlertCircle, Briefcase, FileText } from "lucide-react"
import { getAdminDashboardData } from "@/features/estagio/data"
import { ContratoTable } from "./dashboard/table"
import { ProfessorDashboardClient } from "./professor-dashboard-client"
import { getCurrentUserRole } from "@/lib/auth"

export default async function AdminDashboard() {
    const { contratos, ofertas } = await getAdminDashboardData()
    const role = await getCurrentUserRole()

    // Calculate stats
    const pendentes = contratos.filter(c => c.statusAprovacao === 'PENDENTE').length
    const ativos = contratos.filter(c => c.statusAprovacao === 'ATIVO' && !c.dataConclusaoEstagio).length
    const alertas = contratos.filter(c => c.acompanhamentos.some((a: any) => a.status === 'REJEITADO')).length

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Painel de Controle</h1>

            {/* Professor View: Delegated to Client Component */}
            {role === 'PROFESSOR' && (
                <ProfessorDashboardClient contratos={contratos} ofertas={ofertas} />
            )}

            {/* Admin Only: Stats Cards - Original View */}
            {role === 'ADMIN' && (
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
