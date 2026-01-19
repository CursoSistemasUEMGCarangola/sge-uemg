import { prisma } from "@/lib/prisma"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GeneralInfoList } from "@/features/admin/components/general-info-list"
import { GeneralInfoForm } from "@/features/admin/components/general-info-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ConfiguracoesPage() {
    const items = await prisma.informacoesGeraisEstagio.findMany({
        orderBy: { descricao: 'asc' }
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configurações Gerais</h1>
                <p className="text-muted-foreground">Gerencie as opções de preenchimento para contratos e estágios.</p>
            </div>

            <Tabs defaultValue="modalidade" className="w-full">
                <TabsList>
                    <TabsTrigger value="modalidade">Modalidades</TabsTrigger>
                    <TabsTrigger value="documentacao">Tipos de Documentação</TabsTrigger>
                    <TabsTrigger value="titulacao">Titulações do Supervisor de Campo</TabsTrigger>
                </TabsList>

                <TabsContent value="modalidade">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Modalidades de Estágio</CardTitle>
                                <CardDescription>Defina as modalidades disponíveis (ex: Presencial, Remoto).</CardDescription>
                            </div>
                            <GeneralInfoForm categoria="MODALIDADE" />
                        </CardHeader>
                        <CardContent>
                            <GeneralInfoList items={items} categoria="MODALIDADE" />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="documentacao">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Tipos de Documentação</CardTitle>
                                <CardDescription>Defina os tipos de documentos aceitos (ex: TCE, Pedido de Dispensa).</CardDescription>
                            </div>
                            <GeneralInfoForm categoria="TIPO_DOCUMENTACAO" />
                        </CardHeader>
                        <CardContent>
                            <GeneralInfoList items={items} categoria="TIPO_DOCUMENTACAO" />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="titulacao">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Titulações do Supervisor de Campo</CardTitle>
                                <CardDescription>Defina as titulações do supervisor de campo (ex: Mestrado, Doutorado).</CardDescription>
                            </div>
                            <GeneralInfoForm categoria="TITULACAO_SUPERVISOR" />
                        </CardHeader>
                        <CardContent>
                            <GeneralInfoList items={items} categoria="TITULACAO_SUPERVISOR" />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
