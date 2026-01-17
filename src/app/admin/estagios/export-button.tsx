"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { ContratoRow } from "./columns"

interface ExportButtonProps {
    data: ContratoRow[]
}

export function ExportButton({ data }: ExportButtonProps) {
    const handleExport = () => {
        const headers = ["ID", "Aluno", "Empresa", "Curso", "Data Início", "Status", "Atrasado"]
        const csvContent = [
            headers.join(","),
            ...data.map(row => [
                row.id,
                `"${row.aluno_nome}"`,
                `"${row.empresa_nome}"`,
                `"${row.curso}"`,
                // @ts-ignore
                new Date(row.data_inicio).toLocaleDateString("pt-BR"),
                row.status,
                row.is_late ? "Sim" : "Não"
            ].join(","))
        ].join("\n")

        // Add BOM for Excel compatibility with UTF-8
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", "estagios_uemg.csv")
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
        </Button>
    )
}
