import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { columns } from "./columns"

export default async function AdminEstagiosPage() {
    const estagios = await prisma.cursoEstagio.findMany({
        orderBy: { nome: 'asc' }
    })

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tipos de Estágio</h1>
                    <p className="text-muted-foreground">Gerencie os tipos de estágio disponíveis.</p>
                </div>
                <Link href="/admin/estagios/novo">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Cadastrar Estágio
                    </Button>
                </Link>
            </div>

            <DataTable columns={columns} data={estagios} />
        </div>
    )
}
