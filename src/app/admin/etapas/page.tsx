import { prisma } from "@/lib/prisma"
import { getCurrentUserRole } from "@/lib/auth"
import { redirect } from "next/navigation"
import { EtapaDialog } from "./etapa-dialog"
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

export default async function EtapasPage() {
    const role = await getCurrentUserRole()
    if (role !== 'ADMIN') redirect('/admin')

    const etapas = await prisma.etapaDefinicao.findMany({
        orderBy: { numeroEtapa: 'asc' }
    })

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Etapas do Estágio</h1>
                    <p className="text-muted-foreground">Defina a sequência de etapas do estágio.</p>
                </div>
                <EtapaDialog mode="create" />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Etapas Configuradas</CardTitle>
                    <CardDescription>
                        Estas são as etapas que serão geradas automaticamente para novos estágios.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Ordem</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Orientação</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {etapas.map((etapa) => (
                                <TableRow key={etapa.id}>
                                    <TableCell className="font-bold text-center bg-muted/50 rounded-l-md">
                                        {etapa.numeroEtapa}
                                    </TableCell>
                                    <TableCell className="font-medium">{etapa.descricao}</TableCell>
                                    <TableCell className="max-w-[400px] truncate" title={etapa.orientacaoTextual}>
                                        {etapa.orientacaoTextual}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <EtapaDialog mode="edit" etapa={etapa} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
