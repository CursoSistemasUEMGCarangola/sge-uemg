"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileClock, CheckCircle2, Briefcase, Clock, CheckCircle, XCircle, FileDown, Ban } from "lucide-react"
import { cn } from "@/lib/utils"
import { SendMessageDialog } from "./estagios/components/send-message-dialog"
import { EncerrarOrientacaoDialog } from "@/features/estagio/components/encerrar-orientacao-dialog"

type StatusFilter = 'PENDENTE' | 'REJEITADO' | 'ATIVO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | null

const STATUS_LABELS: Record<NonNullable<StatusFilter>, string> = {
    PENDENTE: 'Pendentes de Aprovação',
    REJEITADO: 'Estágios Rejeitados',
    ATIVO: 'Estágios Ativos',
    EM_ANDAMENTO: 'Estágios em Andamento',
    CONCLUIDO: 'Estágios Concluídos',
}

function getFirstPendingStep(acompanhamentos?: any[]) {
    return acompanhamentos?.find((a: any) => 
        a.status === 'PENDENTE' || a.status === 'EM_ANALISE' || a.status === 'REJEITADO'
    )
}

const STATUS_PREDICATES: Record<NonNullable<StatusFilter>, (contrato: any, isConcluido: boolean) => boolean> = {
    PENDENTE: (c) => c.statusAprovacao === 'PENDENTE',
    REJEITADO: (c) => c.statusAprovacao === 'REJEITADO',
    ATIVO: (c) => c.statusAprovacao === 'ATIVO',
    EM_ANDAMENTO: (c, isConcluido) => c.statusAprovacao === 'ATIVO' && !isConcluido,
    CONCLUIDO: (_c, isConcluido) => isConcluido,
}

interface ProfessorDashboardClientProps {
    contratos: any[]
    ofertas: any[]
}

export function ProfessorDashboardClient({ contratos: initialContratos, ofertas }: ProfessorDashboardClientProps) {
    const [selectedOfertaId, setSelectedOfertaId] = useState<number | null>(null)
    const [selectedStatus, setSelectedStatus] = useState<StatusFilter>(null)

    // Filter contracts based on selection
    const filteredContratos = (selectedOfertaId
        ? initialContratos.filter(c => c.oferta?.id === selectedOfertaId && c.oferta?.ativo !== false)
        : initialContratos.filter(c => c.oferta?.ativo !== false)
    ).sort((a, b) => {
            const nameA = a.aluno?.profile?.nomeCompleto || "";
            const nameB = b.aluno?.profile?.nomeCompleto || "";
            return nameA.localeCompare(nameB);
        });

    // Helper to determine if contract completed all stages
    const isContratoConcluido = (contrato: any) => {
        if (contrato.dataConclusaoEstagio || contrato.statusAprovacao === 'ENCERRADO') return true
        const hasPendingStep = getFirstPendingStep(contrato.acompanhamentos)
        return Boolean(contrato.acompanhamentos?.length > 0 && !hasPendingStep)
    }

    // Calculate stats based on filtered contracts
    const pendentes = filteredContratos.filter(c => c.statusAprovacao === 'PENDENTE').length
    const rejeitados = filteredContratos.filter(c => c.statusAprovacao === 'REJEITADO').length
    const ativos = filteredContratos.filter(c => c.statusAprovacao === 'ATIVO').length
    const emAndamento = filteredContratos.filter(c => c.statusAprovacao === 'ATIVO' && !isContratoConcluido(c)).length
    const concluidos = filteredContratos.filter(c => isContratoConcluido(c)).length

    // Filter contracts by selected card status (O(1) dictionary predicate lookup)
    const displayedContratos = selectedStatus
        ? filteredContratos.filter(c => STATUS_PREDICATES[selectedStatus](c, isContratoConcluido(c)))
        : filteredContratos

    const handleOfertaClick = (ofertaId: number) => {
        setSelectedOfertaId(prev => prev === ofertaId ? null : ofertaId)
    }

    const handleStatusClick = (status: StatusFilter) => {
        setSelectedStatus(prev => prev === status ? null : status)
    }

    const cardsConfig = [
        {
            status: 'PENDENTE' as const,
            title: 'Pendentes de Aprovação',
            count: pendentes,
            icon: FileClock,
            iconClass: 'text-amber-500',
            subtextDefault: 'Aguardando ação',
            borderColor: 'border-l-amber-500',
            activeRingClass: 'ring-2 ring-amber-500 ring-offset-2 bg-amber-50/40 dark:bg-amber-950/20',
            hoverBorderClass: 'hover:border-l-amber-400',
        },
        {
            status: 'REJEITADO' as const,
            title: 'Estágios Rejeitados',
            count: rejeitados,
            icon: XCircle,
            iconClass: 'text-destructive',
            subtextDefault: 'Indeferidos',
            borderColor: 'border-l-red-500',
            activeRingClass: 'ring-2 ring-red-500 ring-offset-2 bg-red-50/40 dark:bg-red-950/20',
            hoverBorderClass: 'hover:border-l-red-400',
        },
        {
            status: 'ATIVO' as const,
            title: 'Estágios Ativos',
            count: ativos,
            icon: CheckCircle2,
            iconClass: 'text-muted-foreground',
            subtextDefault: 'Em andamento',
            borderColor: 'border-l-blue-500',
            activeRingClass: 'ring-2 ring-blue-500 ring-offset-2 bg-blue-50/40 dark:bg-blue-950/20',
            hoverBorderClass: 'hover:border-l-blue-400',
        },
        {
            status: 'EM_ANDAMENTO' as const,
            title: 'Estágios em Andamento',
            count: emAndamento,
            icon: Clock,
            iconClass: 'text-blue-600',
            subtextDefault: 'Cursando etapas',
            borderColor: 'border-l-blue-600',
            activeRingClass: 'ring-2 ring-blue-600 ring-offset-2 bg-blue-50/40 dark:bg-blue-950/20',
            hoverBorderClass: 'hover:border-l-blue-400',
        },
        {
            status: 'CONCLUIDO' as const,
            title: 'Estágios Concluídos',
            count: concluidos,
            icon: CheckCircle,
            iconClass: 'text-green-600',
            subtextDefault: 'Com sucesso',
            borderColor: 'border-l-green-600',
            activeRingClass: 'ring-2 ring-green-600 ring-offset-2 bg-green-50/40 dark:bg-green-950/20',
            hoverBorderClass: 'hover:border-l-green-400',
        },
    ]

    return (
        <div className="space-y-6">
            {/* Cards de Ofertas (Atribuições) */}
            {ofertas && ofertas.length > 0 && (
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-muted-foreground" />
                            Minhas Orientações
                        </h2>
                        <SendMessageDialog
                            contratos={displayedContratos}
                            selectedOfertaNome={
                                selectedOfertaId
                                    ? ofertas?.find((o: any) => o.id === selectedOfertaId)?.curso?.nome
                                    : null
                            }
                            selectedStatusLabel={selectedStatus ? STATUS_LABELS[selectedStatus] : null}
                        />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {ofertas.map((oferta: any) => {
                            const isSelected = selectedOfertaId === oferta.id
                            return (
                                <Card
                                    key={oferta.id}
                                    className={cn(
                                        "transition-all duration-200 border-l-4 shadow-sm",
                                        oferta.ativo !== false ? "cursor-pointer hover:shadow-md" : "opacity-80",
                                        isSelected
                                            ? "border-l-primary ring-2 ring-primary ring-offset-2 bg-primary/5"
                                            : oferta.ativo === false ? "border-l-gray-400 bg-muted/20" : "border-l-yellow-500 bg-muted/40 hover:bg-muted/60"
                                    )}
                                    onClick={() => oferta.ativo !== false && handleOfertaClick(oferta.id)}
                                >
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg font-bold">
                                            {oferta.curso.nome}
                                            <span className="block text-sm font-normal text-muted-foreground">
                                                {oferta.curso.curso?.nome} - {oferta.curso.curso?.unidade?.nome}
                                            </span>
                                        </CardTitle>
                                        <CardDescription className="flex flex-col gap-1">
                                            <span>Semestre: {oferta.semestreLetivo}</span>
                                            <span className="font-medium text-foreground/80">{oferta.curso.periodoVinculado}º Período</span>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-2">Vínculo de Orientação Ativo</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
                                            {oferta.ativo === false ? (
                                                <div className="flex flex-col gap-2 w-full">
                                                    <span className="flex items-center gap-1 text-red-600 font-medium">
                                                        <Ban className="h-3 w-3" /> Orientação Encerrada
                                                    </span>
                                                    <Link href={`/api/relatorios/encerramento-turma/${oferta.id}`} target="_blank">
                                                        <Button variant="outline" size="sm" className="w-full text-xs h-8">
                                                            <FileDown className="mr-2 h-3 w-3" />
                                                            Baixar Relatório (PDF)
                                                        </Button>
                                                    </Link>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-2 w-full">
                                                    <span className="flex items-center gap-1">
                                                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                                                        {isSelected ? "Selecionado" : "Clique para filtrar"}
                                                    </span>
                                                    <EncerrarOrientacaoDialog ofertaId={oferta.id} disabled={!isSelected} />
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Stats Cards (Dynamic & Clickable) */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {cardsConfig.map((card) => {
                    const isSelected = selectedStatus === card.status
                    const Icon = card.icon

                    return (
                        <Card
                            key={card.status}
                            role="button"
                            tabIndex={0}
                            aria-pressed={isSelected}
                            onClick={() => handleStatusClick(card.status)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    handleStatusClick(card.status)
                                }
                            }}
                            className={cn(
                                "cursor-pointer transition-all duration-200 border-l-4 shadow-sm hover:shadow-md select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                isSelected
                                    ? cn(card.borderColor, card.activeRingClass)
                                    : cn("border-l-transparent hover:bg-muted/40", card.hoverBorderClass)
                            )}
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                                <Icon className={cn("h-4 w-4", card.iconClass)} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{card.count}</div>
                                <p className="text-xs text-muted-foreground">
                                    {isSelected ? '● Filtro ativo' : card.subtextDefault}
                                </p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Indicador de filtro ativo */}
            {selectedStatus && (
                <div className="flex items-center justify-between bg-muted/50 border rounded-lg px-4 py-2.5 text-sm shadow-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Filtro aplicado:</span>
                        <Badge variant="secondary" className="font-semibold text-xs">
                            {STATUS_LABELS[selectedStatus]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                            ({displayedContratos.length} {displayedContratos.length === 1 ? 'estágio exibido' : 'estágios exibidos'})
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedStatus(null)}
                        className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    >
                        Limpar filtro
                    </Button>
                </div>
            )}

            {/* Lista de Alunos (Dynamic) */}
            {displayedContratos.length > 0 ? (
                <div className="rounded-md border bg-white shadow-sm overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                            <tr>
                                <th className="px-4 py-3">Aluno</th>
                                <th className="px-4 py-3">Matrícula</th>
                                <th className="px-4 py-3">Estágio / Curso</th>
                                <th className="px-4 py-3 text-center">Etapa Atual</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {displayedContratos.map((contrato) => {
                                const currentStepDef = getFirstPendingStep(contrato.acompanhamentos)
                                const currentStepLabel = currentStepDef 
                                    ? `Etapa ${currentStepDef.etapaDef.numeroEtapa}` 
                                    : "Concluído"
                                const currentStepStatus = currentStepDef ? currentStepDef.status : "CONCLUIDO"

                                return (
                                    <tr key={contrato.id} className="hover:bg-muted/70 transition-colors">
                                        <td className="px-4 py-3 font-medium text-foreground">
                                            {contrato.aluno.profile.nomeCompleto}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-muted-foreground">
                                            {contrato.aluno.matricula}
                                        </td>
                                        <td className="px-4 py-3 max-w-[200px] truncate" title={`${contrato.oferta?.curso?.nome} - ${contrato.campo.nomeFantasia}`}>
                                            <div className="font-medium text-foreground">{contrato.oferta?.curso?.nome}</div>
                                            <div className="text-xs text-muted-foreground truncate flex flex-col">
                                                <span>{contrato.oferta?.curso?.curso?.nome} - {contrato.oferta?.curso?.curso?.unidade?.nome}</span>
                                                <span className="font-semibold">{contrato.tipoDocumentacao}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-xs font-semibold text-foreground">
                                                    {currentStepLabel}
                                                </span>
                                                {currentStepDef && currentStepStatus !== 'PENDENTE' && (
                                                    <Badge variant={
                                                        currentStepStatus === 'EM_ANALISE' ? 'secondary' :
                                                            currentStepStatus === 'REJEITADO' ? 'destructive' : 'outline'
                                                    } className="text-[10px] px-1.5 h-4 w-fit">
                                                        {currentStepStatus}
                                                    </Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {(() => {
                                                const isLate = currentStepDef?.dataLimite && new Date() > new Date(currentStepDef.dataLimite)

                                                return (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <Badge variant={contrato.statusAprovacao === 'ATIVO' ? 'success' : contrato.statusAprovacao === 'REJEITADO' ? 'destructive' : 'secondary'}>
                                                            {contrato.statusAprovacao}
                                                        </Badge>
                                                        {isLate && contrato.statusAprovacao === 'ATIVO' && (
                                                            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1 rounded border border-red-200">
                                                                ATRASADO
                                                            </span>
                                                        )}
                                                    </div>
                                                )
                                            })()}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link href={`/admin/estagios/contrato/${contrato.id}`}>
                                                <Button size="sm" variant="outline" className="h-8">
                                                    Acessar
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-12 border rounded-md bg-muted/10">
                    <p className="text-muted-foreground">
                        {selectedStatus 
                            ? `Nenhum estágio encontrado com o filtro "${STATUS_LABELS[selectedStatus]}".` 
                            : "Nenhum estágio encontrado para esta seleção."}
                    </p>
                    {selectedStatus && (
                        <Button variant="outline" size="sm" onClick={() => setSelectedStatus(null)} className="mt-3 text-xs">
                            Limpar filtro de status
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}
