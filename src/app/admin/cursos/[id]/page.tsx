import { CursoForm } from "@/features/admin/components/curso-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function EditarCursoPage({ params }: { params: { id: string } }) {
    const id = parseInt(params.id)
    if (isNaN(id)) notFound()

    const [curso, unidades] = await Promise.all([
        prisma.curso.findUnique({ where: { id } }),
        prisma.unidadeAcademica.findMany({
            orderBy: { nome: 'asc' },
            select: { id: true, nome: true }
        })
    ])

    if (!curso) notFound()

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Editar Curso</h1>
                <p className="text-muted-foreground">Atualize os dados do curso.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Dados do Curso</CardTitle>
                    <CardDescription>ID: {curso.id}</CardDescription>
                </CardHeader>
                <CardContent>
                    <CursoForm initialData={curso} unidades={unidades} />
                </CardContent>
            </Card>
        </div>
    )
}
