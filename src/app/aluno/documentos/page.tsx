import { prisma } from "@/lib/prisma"
import { getCurrentUserRole } from "@/lib/auth"
import { redirect } from "next/navigation"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ExternalLink, FileText } from "lucide-react"

export default async function AlunoDocumentosPage() {
    const role = await getCurrentUserRole()
    if (role !== 'ALUNO') redirect('/aluno')

    const documentos = await prisma.documentoModelo.findMany({
        orderBy: { nomeArquivo: 'asc' }
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Documentos</h1>
                <p className="text-muted-foreground">Modelos e arquivos importantes para o seu estágio.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Arquivos Disponíveis</CardTitle>
                    <CardDescription>
                        Clique no link para visualizar ou baixar o documento.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {documentos.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Nenhum documento disponível no momento.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome do Arquivo</TableHead>
                                    <TableHead className="text-right">Ação</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {documentos.map((doc) => (
                                    <TableRow key={doc.id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-blue-500" />
                                            {doc.nomeArquivo}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <a
                                                href={doc.urlLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm font-medium"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                                Acessar
                                            </a>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
