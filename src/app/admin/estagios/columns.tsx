"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DeleteInternshipButton } from "@/features/admin/components/delete-internship-button"

export type InternshipRow = {
    id: number
    nome: string
    periodoVinculado: number
    cargaHorariaTotal: number
    curso?: {
        nome: string
        unidade?: {
            nome: string
        }
    } | null
}

export const columns: ColumnDef<InternshipRow>[] = [
    {
        accessorKey: "nome",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Nome
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        id: "curso",
        header: "Curso / Unidade",
        cell: ({ row }) => {
            const curso = row.original.curso
            if (!curso) return <span className="text-muted-foreground">-</span>

            return (
                <div className="flex flex-col">
                    <span className="font-medium">{curso.nome}</span>
                    <span className="text-xs text-muted-foreground">{curso.unidade?.nome}</span>
                </div>
            )
        }
    },
    {
        accessorKey: "periodoVinculado",
        header: "Período",
        cell: ({ row }) => {
            return <div>{row.getValue("periodoVinculado")}º Período</div>
        }
    },
    {
        accessorKey: "cargaHorariaTotal",
        header: "Carga Horária (h)",
        cell: ({ row }) => {
            return <div>{row.getValue("cargaHorariaTotal")}h</div>
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const estagio = row.original

            return (
                <div className="flex items-center gap-2">
                    <Link href={`/admin/estagios/${estagio.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-4 w-4" />
                        </Button>
                    </Link>
                    <DeleteInternshipButton id={estagio.id} nome={estagio.nome} />
                </div>
            )
        },
    },
]
