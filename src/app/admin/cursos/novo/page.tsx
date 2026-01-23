import { CursoForm } from "@/features/admin/components/curso-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"

export default async function NovoCursoPage() {
    const unidades = await prisma.unidadeAcademica.findMany({
        orderBy: { nome: 'asc' },
        select: { id: true, nome: true }
    })

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Novo Curso</h1>
                <p className="text-muted-foreground">Cadastre um novo curso e vincule a uma unidade.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Dados do Curso</CardTitle>
                    <CardDescription>Preencha os dados e selecione a unidade.</CardDescription>
                </CardHeader>
                <CardContent>
                    <CursoForm unidades={unidades} />
                </CardContent>
            </Card>
        </div>
    )
}
