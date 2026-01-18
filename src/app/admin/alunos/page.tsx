import { prisma } from "@/lib/prisma"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle, Pencil, Trash2 } from "lucide-react"
import { DeleteUserButton } from "@/features/admin/components/delete-user-button"

export default async function AdminAlunosPage() {
    const alunos = await prisma.aluno.findMany({
        include: {
            profile: true
        },
        orderBy: {
            profile: {
                nomeCompleto: 'asc'
            }
        }
    })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Alunos</h1>
                    <p className="text-muted-foreground">Gerenciamento de alunos do curso.</p>
                </div>
                <Link href="/admin/alunos/novo">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Novo Aluno
                    </Button>
                </Link>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Matrícula</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Período</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {alunos.map((aluno) => (
                            <TableRow key={aluno.id}>
                                <TableCell className="font-medium">{aluno.profile.nomeCompleto}</TableCell>
                                <TableCell>{aluno.matricula}</TableCell>
                                <TableCell>{aluno.profile.email}</TableCell>
                                <TableCell>{aluno.periodoAtual}º Período</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link href={`/admin/alunos/${aluno.id}`}>
                                            <Button variant="ghost" size="icon">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <DeleteUserButton userId={aluno.profile.id} userName={aluno.profile.nomeCompleto} />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
