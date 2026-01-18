"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DeleteOfferButton } from "@/features/admin/components/delete-offer-button"
import Link from "next/link"
import { OfferStatusBadge } from "./offer-status-badge"

export type OfferData = {
    id: number
    cursoNome: string
    professorNome: string
    semestre: string
    ativo: boolean | null
    periodo: string
}

export const columns: ColumnDef<OfferData>[] = [
    {
        accessorKey: "cursoNome",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Estágio
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "professorNome",
        header: "Professor Orientador",
    },
    {
        accessorKey: "semestre",
        header: "Semestre",
    },
    {
        accessorKey: "periodo",
        header: "Período (Início - Fim)",
    },
    {
        accessorKey: "ativo",
        header: "Status",
        cell: ({ row }) => {
            return (
                <OfferStatusBadge
                    id={row.original.id}
                    ativo={row.original.ativo}
                />
            )
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            return (
                <div className="flex justify-end gap-2">
                    <Link href={`/admin/ofertas/${row.original.id}`}>
                        <Button variant="outline" size="sm">
                            Editar
                        </Button>
                    </Link>
                    <DeleteOfferButton id={row.original.id} />
                </div>
            )
        },
    },
]
