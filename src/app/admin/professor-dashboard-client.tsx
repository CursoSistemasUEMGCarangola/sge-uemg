"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileClock, CheckCircle2, AlertCircle, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProfessorDashboardClientProps {
    contratos: any[]
    ofertas: any[]
}

export function ProfessorDashboardClient({ contratos: initialContratos, ofertas }: ProfessorDashboardClientProps) {
    const [selectedOfertaId, setSelectedOfertaId] = useState<number | null>(null)

    // Filter contracts based on selection
    const filteredContratos = selectedOfertaId
        ? initialContratos.filter(c => c.oferta?.id === selectedOfertaId)
        : initialContratos

    // Calculate stats based on filtered contracts
    const pendentes = filteredContratos.filter(c => c.statusAprovacao === 'PENDENTE').length
    const ativos = filteredContratos.filter(c => c.statusAprovacao === 'APROVADO' && !c.dataConclusaoEstagio).length
    const alertas = filteredContratos.filter(c => c.acompanhamentos.some((a: any) => a.status === 'REJEITADO')).length

    const handleOfertaClick = (ofertaId: number) => {
        if (selectedOfertaId === ofertaId) {
            setSelectedOfertaId(null) // Deselect
        } else {
            setSelectedOfertaId(ofertaId) // Select
        }
    }

    return (
        <div className="space-y-6">
            {/* Cards de Ofertas (Atribuições) */}
            {ofertas && ofertas.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-muted-foreground" />
                        Minhas Orientações
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {ofertas.map((oferta: any) => {
                            const isSelected = selectedOfertaId === oferta.id
                            return (
                                <Card
                                    key={oferta.id}
                                    className={cn(
                                        "cursor-pointer transition-all duration-200 border-l-4 shadow-sm hover:shadow-md",
                                        isSelected
                                            ? "border-l-primary ring-2 ring-primary ring-offset-2 bg-primary/5"
                                            : "border-l-yellow-500 bg-muted/40 hover:bg-muted/60"
                                    )}
                                    onClick={() => handleOfertaClick(oferta.id)}
                                >
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg font-bold">
                                            {oferta.curso.nome}
                                        </CardTitle>
                                        <CardDescription className="flex flex-col gap-1">
                                            <span>Semestre: {oferta.semestreLetivo}</span>
                                            <span className="font-medium text-foreground/80">{oferta.curso.periodoVinculado}º Período</span>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-2">Vínculo de Orientação Ativo</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                                            {isSelected ? "Selecionado" : "Clique para filtrar"}
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Stats Cards (Dynamic) */}
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

            {/* Lista de Alunos (Dynamic) */}
            {filteredContratos.length > 0 ? (
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
                            {filteredContratos.map((contrato) => (
                                <tr key={contrato.id} className="hover:bg-muted/10 transition-colors">
                                    <td className="px-4 py-3 font-medium text-foreground">
                                        {contrato.aluno.profile.nomeCompleto}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-muted-foreground">
                                        {contrato.aluno.matricula}
                                    </td>
                                    <td className="px-4 py-3 max-w-[200px] truncate" title={`${contrato.oferta?.curso?.nome} - ${contrato.campo.nomeFantasia}`}>
                                        <div className="font-medium text-foreground">{contrato.oferta?.curso?.nome || "Não definido"}</div>
                                        <div className="text-xs text-muted-foreground truncate flex flex-col">
                                            <span>{contrato.oferta?.curso?.periodoVinculado}º Período</span>
                                            <span className="font-semibold">{contrato.tipoDocumentacao}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                                            {contrato.acompanhamentos.length}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {(() => {
                                            // Find current pending step to check deadline
                                            const currentStep = contrato.acompanhamentos.find((a: any) => a.status === 'PENDENTE' || a.status === 'EM_ANALISE' || a.status === 'REJEITADO')
                                            const isLate = currentStep?.dataLimite && new Date() > new Date(currentStep.dataLimite)

                                            return (
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${contrato.statusAprovacao === 'APROVADO' ? 'bg-green-100 text-green-700' :
                                                        contrato.statusAprovacao === 'REJEITADO' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {contrato.statusAprovacao === 'APROVADO' ? 'ATIVO' : contrato.statusAprovacao}
                                                    </span>
                                                    {isLate && contrato.statusAprovacao === 'APROVADO' && (
                                                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1 rounded border border-red-200">
                                                            ATRASADO
                                                        </span>
                                                    )}
                                                </div>
                                            )
                                        })()}
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
            ) : (
                <div className="text-center py-12 border rounded-md bg-muted/10">
                    <p className="text-muted-foreground">Nenhum estágio encontrado para esta seleção.</p>
                </div>
            )}
        </div>
    )
}
