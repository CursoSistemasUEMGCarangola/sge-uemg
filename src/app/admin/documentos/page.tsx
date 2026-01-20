import { prisma } from "@/lib/prisma"
import { getCurrentUserRole } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DocumentoDialog, DeleteDocumentoDialog } from "./documento-dialog"
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

export default async function DocumentosPage() {
    const role = await getCurrentUserRole()
    if (role !== 'ADMIN' && role !== 'PROFESSOR') redirect('/admin')

    const documentos = await prisma.documentoModelo.findMany({
        orderBy: { nomeArquivo: 'asc' }
    })

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Documentos Modelo</h1>
                    <p className="text-muted-foreground">Gerencie templates e arquivos padrão para download pelos alunos.</p>
                </div>
                <DocumentoDialog mode="create" />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Arquivos Disponíveis</CardTitle>
                    <CardDescription>
                        Estes links ficarão disponíveis na área do aluno.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {documentos.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Nenhum documento cadastrado.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Arquivo</TableHead>
                                    <TableHead>Link</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {documentos.map((doc) => (
                                    <TableRow key={doc.id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-blue-500" />
                                            {doc.nomeArquivo}
                                        </TableCell>
                                        <TableCell>
                                            <a href={doc.urlLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline text-sm">
                                                <ExternalLink className="h-3 w-3" />
                                                Acessar
                                            </a>
                                        </TableCell>
                                        <TableCell className="text-right flex justify-end gap-1">
                                            <DocumentoDialog mode="edit" documento={doc} />
                                            <DeleteDocumentoDialog id={doc.id} />
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
