import { UnidadeForm } from "@/features/admin/components/unidade-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function EditarUnidadePage({ params }: { params: { id: string } }) {
    const id = parseInt(params.id)
    if (isNaN(id)) notFound()

    const unidade = await prisma.unidadeAcademica.findUnique({
        where: { id }
    })

    if (!unidade) notFound()

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Editar Unidade</h1>
                <p className="text-muted-foreground">Atualize os dados da unidade.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Dados da Unidade</CardTitle>
                    <CardDescription>ID: {unidade.id}</CardDescription>
                </CardHeader>
                <CardContent>
                    <UnidadeForm initialData={unidade} />
                </CardContent>
            </Card>
        </div>
    )
}
