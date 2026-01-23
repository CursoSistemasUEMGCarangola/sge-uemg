import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Plus, Pencil } from "lucide-react"
import Link from "next/link"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { DeleteCursoButton } from "@/features/admin/components/delete-curso-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdminCursosPage() {
    const cursos = await prisma.curso.findMany({
        orderBy: { nome: 'asc' },
        include: {
            unidade: true,
            _count: {
                select: {
                    alunos: true,
                    professores: true
                }
            }
        }
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Cursos</h1>
                    <p className="text-muted-foreground">Gerencie os cursos oferecidos em cada unidade.</p>
                </div>
                <Button asChild>
                    <Link href="/admin/cursos/novo">
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Curso
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Listagem de Cursos</CardTitle>
                    <CardDescription>Total de {cursos.length} cursos cadastrados.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead>Unidade</TableHead>
                                <TableHead className="text-center">Alunos</TableHead>
                                <TableHead className="text-center">Professores</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cursos.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Nenhum curso cadastrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                cursos.map((curso) => (
                                    <TableRow key={curso.id}>
                                        <TableCell className="font-medium">{curso.id}</TableCell>
                                        <TableCell>{curso.nome}</TableCell>
                                        <TableCell>{curso.unidade?.nome || 'N/A'}</TableCell>
                                        <TableCell className="text-center">
                                            <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                                {curso._count.alunos}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className="inline-flex items-center justify-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                                                {curso._count.professores}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/admin/cursos/${curso.id}`}>
                                                        <Pencil className="h-4 w-4 text-orange-500" />
                                                    </Link>
                                                </Button>
                                                <DeleteCursoButton id={curso.id} nome={curso.nome} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
