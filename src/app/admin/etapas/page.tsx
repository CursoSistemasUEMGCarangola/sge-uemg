import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EditStageDialog } from "./edit-stage-dialog"
import { Badge } from "@/components/ui/badge"

export default async function AdminEtapasPage() {
    const etapas = await prisma.etapaDefinicao.findMany({
        orderBy: { numeroEtapa: 'asc' }
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Etapas</h1>
                <p className="text-muted-foreground">Configure os prazos, orientações e ações automáticas de cada etapa do estágio.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Etapas do Processo</CardTitle>
                    <CardDescription>
                        Definições atuais do fluxo de estágio.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Número</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Prazo (Dias)</TableHead>
                                <TableHead>Ação de Sistema</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {etapas.map((etapa) => (
                                <TableRow key={etapa.id}>
                                    <TableCell className="font-medium text-center">
                                        <Badge variant="outline">{etapa.numeroEtapa}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{etapa.descricao}</div>
                                        <div className="text-xs text-muted-foreground truncate max-w-[300px]">
                                            {etapa.orientacaoTextual}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {etapa.prazoDias} dias
                                    </TableCell>
                                    <TableCell>
                                        {etapa.systemAction ? (
                                            <Badge variant="secondary" className="font-mono text-xs">
                                                {etapa.systemAction}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <EditStageDialog etapa={etapa} />
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
