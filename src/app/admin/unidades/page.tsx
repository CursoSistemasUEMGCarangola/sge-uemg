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
import { DeleteUnidadeButton } from "@/features/admin/components/delete-unidade-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdminUnidadesPage() {
    // Handling Prisma potential missing types gracefully in runtime via 'any' if needed, but here we assume it works or user restarts.
    // We add sorting and counting.
    const unidades = await prisma.unidadeAcademica.findMany({
        orderBy: { nome: 'asc' },
        include: {
            _count: {
                select: { cursos: true }
            }
        }
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Unidades Acadêmicas</h1>
                    <p className="text-muted-foreground">Gerencie as unidades e campus da instituição.</p>
                </div>
                <Button asChild>
                    <Link href="/admin/unidades/novo">
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Unidade
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Listagem de Unidades</CardTitle>
                    <CardDescription>Total de {unidades.length} unidades cadastradas.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead className="w-full">Nome</TableHead>
                                <TableHead className="text-center">Cursos</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {unidades.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        Nenhuma unidade cadastrada.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                unidades.map((unidade) => (
                                    <TableRow key={unidade.id}>
                                        <TableCell className="font-medium">{unidade.id}</TableCell>
                                        <TableCell>{unidade.nome}</TableCell>
                                        <TableCell className="text-center">
                                            <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                                {unidade._count.cursos}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/admin/unidades/${unidade.id}`}>
                                                        <Pencil className="h-4 w-4 text-orange-500" />
                                                    </Link>
                                                </Button>
                                                <DeleteUnidadeButton id={unidade.id} nome={unidade.nome} />
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
