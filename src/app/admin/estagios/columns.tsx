"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

// Define the shape of our data (derived from getAllContratos return type usually, but defining simplified here)
export type ContratoRow = {
    id: number
    aluno_nome: string
    empresa_nome: string
    curso: string
    data_inicio: Date
    status: string
    is_late: boolean
}

export const columns: ColumnDef<ContratoRow>[] = [
    {
        accessorKey: "aluno_nome",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Aluno
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "empresa_nome",
        header: "Empresa",
    },
    {
        accessorKey: "curso",
        header: "Curso/Semestre",
    },
    {
        accessorKey: "data_inicio",
        header: "Início Previsto",
        cell: ({ row }) => {
            return format(row.getValue("data_inicio"), "dd/MM/yyyy")
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            const isLate = row.original.is_late
            return (
                <div className="flex items-center gap-2">
                    <Badge variant={status === 'APROVADO' ? 'default' : status === 'REJEITADO' ? 'destructive' : 'secondary'}>
                        {status}
                    </Badge>
                    {isLate && (
                        <div title="Sem atualização há mais de 15 dias" className="text-amber-500">
                            <AlertTriangle className="h-4 w-4" />
                        </div>
                    )}
                </div>
            )
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const contrato = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(contrato.id.toString())}
                        >
                            Copiar ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <Link href={`/admin/estagios/${contrato.id}`}>
                            <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                        </Link>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
