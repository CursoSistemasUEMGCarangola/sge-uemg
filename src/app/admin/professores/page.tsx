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

export default async function AdminProfessoresPage() {
    const professores = await prisma.professor.findMany({
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
                    <h1 className="text-3xl font-bold tracking-tight">Professores</h1>
                    <p className="text-muted-foreground">Gerenciamento de professores orientadores.</p>
                </div>
                <Link href="/admin/professores/novo">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Novo Professor
                    </Button>
                </Link>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>MASP</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Telefone</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {professores.map((prof) => (
                            <TableRow key={prof.id}>
                                <TableCell className="font-medium">{prof.profile.nomeCompleto}</TableCell>
                                <TableCell>{prof.masp}</TableCell>
                                <TableCell>{prof.profile.email}</TableCell>
                                <TableCell>{prof.profile.telefone || '-'}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link href={`/admin/professores/${prof.id}`}>
                                            <Button variant="ghost" size="icon">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <DeleteUserButton userId={prof.profile.id} userName={prof.profile.nomeCompleto} />
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
