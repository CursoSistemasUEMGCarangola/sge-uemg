import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { columns } from "./columns"

export default async function AdminOfertasPage() {
    const ofertas = await prisma.ofertaEstagio.findMany({
        include: {
            curso: true,
            professor: {
                include: {
                    profile: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    const formattedData = ofertas.map(oferta => ({
        id: oferta.id,
        cursoNome: oferta.curso.nome,
        professorNome: oferta.professor.profile.nomeCompleto,
        semestre: oferta.semestreLetivo,
        ativo: oferta.ativo,
        periodo: `${new Date(oferta.dataInicio).toLocaleDateString()} - ${new Date(oferta.dataFim).toLocaleDateString()}`
    }))

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Atribuir Orientação de Estágio</h1>
                    <p className="text-muted-foreground">Gerencie as orientações de estágio atribuídos aos professores.</p>
                </div>
                <Link href="/admin/ofertas/novo">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Atribuição
                    </Button>
                </Link>
            </div>

            <DataTable columns={columns} data={formattedData} />
        </div>
    )
}
