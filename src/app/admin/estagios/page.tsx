import { getAllContratos } from "@/features/estagio/data"
import { ContratoRow, columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { isBefore, startOfDay } from "date-fns"
import { Inbox } from "lucide-react"
import { ExportButton } from "./export-button"

export default async function AdminEstagiosPage() {
    const data = await getAllContratos()
    const today = startOfDay(new Date())

    // Mapper to flat structure for table
    const tableData: ContratoRow[] = data.map(c => ({
        id: c.id,
        aluno_nome: c.aluno.profile.nomeCompleto,
        empresa_nome: c.campo.nomeFantasia,
        curso: `${c.oferta.curso.nome} (${c.oferta.semestreLetivo})`,
        data_inicio: c.dataInicioPrevista,
        status: c.statusAprovacao || 'PENDENTE',
        is_late: c.statusAprovacao !== 'APROVADO' && isBefore(new Date(c.dataInicioPrevista), today)
    }))

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Estágios</h1>
                    <p className="text-muted-foreground">Gerencie todas as solicitações de estágio e acompanhe os status.</p>
                </div>
                <ExportButton data={tableData} />
            </div>

            {tableData.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/10">
                    <div className="bg-background p-4 rounded-full shadow-sm mb-4">
                        <Inbox className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">Nenhum estágio encontrado</h3>
                    <p className="text-muted-foreground mt-2 text-center max-w-sm">
                        Ainda não há solicitações de estágio cadastradas no sistema.
                    </p>
                </div>
            ) : (
                <DataTable columns={columns} data={tableData} />
            )}
        </div>
    )
}
