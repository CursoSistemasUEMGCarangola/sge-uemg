"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface ContratoTableProps {
    contratos: any[]
}

export function ContratoTable({ contratos }: ContratoTableProps) {
    if (contratos.length === 0) {
        return <div className="text-center py-10 text-muted-foreground">Nenhum estágio encontrado.</div>
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Estagiário</TableHead>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Etapa Atual</TableHead>
                        <TableHead>Status Etapa</TableHead>
                        <TableHead>Status Final</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {contratos.map((contrato) => {
                        const firstPending = contrato.acompanhamentos.find((a: any) => a.status === 'PENDENTE' || a.status === 'EM_ANALISE' || a.status === 'REJEITADO')
                        const currentStep = firstPending ? firstPending.etapaDef.descricao : "Concluído"
                        const currentStatus = firstPending ? firstPending.status : "Concluído"

                        return (
                            <TableRow key={contrato.id}>
                                <TableCell className="font-medium">
                                    {contrato.aluno.profile.nomeCompleto}
                                    <div className="text-xs text-muted-foreground">{contrato.aluno.matricula}</div>
                                </TableCell>
                                <TableCell>{contrato.campo.nomeFantasia}</TableCell>
                                <TableCell>{currentStep}</TableCell>
                                <TableCell>
                                    <Badge variant={
                                        currentStatus === 'EM_ANALISE' ? 'secondary' :
                                            currentStatus === 'REJEITADO' ? 'destructive' : 'outline'
                                    }>
                                        {currentStatus}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={contrato.statusAprovacao === 'APROVADO' ? 'default' : 'secondary'}>
                                        {contrato.statusAprovacao}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Link href={`/admin/estagios/${contrato.id}`}>
                                        <Button variant="ghost" size="icon">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
