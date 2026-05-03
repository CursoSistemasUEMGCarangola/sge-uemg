import { prisma } from "@/lib/prisma"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GeneralInfoList } from "@/features/admin/components/general-info-list"
import { GeneralInfoForm } from "@/features/admin/components/general-info-form"
import { BackupButton } from "@/features/admin/components/backup-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Database } from "lucide-react"

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
                    <TabsTrigger value="backup">Backup</TabsTrigger>
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

                <TabsContent value="backup">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Database className="h-5 w-5 text-muted-foreground" />
                                <CardTitle>Backup do Banco de Dados</CardTitle>
                            </div>
                            <CardDescription>
                                Exporte todos os dados do sistema em formato JSON para backup ou migração.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-lg border bg-muted/50 p-4 space-y-2 text-sm text-muted-foreground">
                                <p><strong>O que está incluído no backup:</strong></p>
                                <ul className="list-disc list-inside space-y-1 ml-2">
                                    <li><strong>Usuários de autenticação (Supabase Auth)</strong></li>
                                    <li>Perfis, Alunos e Professores</li>
                                    <li>Unidades Acadêmicas e Cursos</li>
                                    <li>Campos de Estágio e Contratos</li>
                                    <li>Ofertas, Etapas e Acompanhamentos</li>
                                    <li>Diários de Atividade</li>
                                    <li>Calendário (Feriados/Recessos)</li>
                                    <li>Documentos Modelo e Configurações</li>
                                </ul>
                                <p className="mt-3 text-xs">
                                    O arquivo gerado é um JSON completo com metadados de exportação (data/hora, total de registros).
                                    <br />
                                    <strong>Nota:</strong> As senhas dos usuários não são exportadas por segurança. Ao restaurar, será necessário redefinir as senhas.
                                </p>
                            </div>
                            <BackupButton />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
