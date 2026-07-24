import { prisma } from "@/lib/prisma"
import { getCurrentUserRole, createClient } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileDown, History } from "lucide-react"
import Link from "next/link"

export default async function HistoricoOrientacoesPage() {
    const role = await getCurrentUserRole()
    if (!role || (role !== 'PROFESSOR' && role !== 'ADMIN')) {
        redirect('/')
    }

    let whereClause: any = {}

    if (role === 'PROFESSOR') {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const professor = await prisma.professor.findUnique({ where: { profileId: user.id } })
            if (professor) {
                whereClause.oferta = {
                    professorOrientadorId: professor.id
                }
            } else {
                return <div>Acesso negado: Perfil de professor não encontrado.</div>
            }
        }
    }

    const relatorios = await prisma.relatorioEncerramento.findMany({
        where: whereClause,
        include: {
            oferta: {
                include: {
                    curso: {
                        include: {
                            curso: {
                                include: { unidade: true }
                            }
                        }
                    },
                    professor: {
                        include: { profile: true }
                    }
                }
            }
        },
        orderBy: { dataEncerramento: 'desc' }
    })

    return (
        <div className="container mx-auto py-8 max-w-4xl space-y-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
                <History className="h-8 w-8 text-primary" />
                Histórico de Orientações Encerradas
            </h1>
            <p className="text-muted-foreground">
                Consulte o histórico de estágios e obtenha o Relatório Final Consolidado das turmas encerradas.
            </p>

            {relatorios.length === 0 ? (
                <div className="text-center py-12 border rounded-md bg-muted/10">
                    <p className="text-muted-foreground">Nenhuma orientação foi encerrada até o momento.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {relatorios.map((relatorio) => (
                        <Card key={relatorio.id} className="border-l-4 border-l-gray-400">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">
                                    {relatorio.oferta.curso.nome}
                                </CardTitle>
                                <CardDescription>
                                    Semestre: {relatorio.oferta.semestreLetivo}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <p><strong>Curso:</strong> {relatorio.oferta.curso.curso?.nome}</p>
                                    <p><strong>Período:</strong> {relatorio.oferta.curso.periodoVinculado}º Período</p>
                                    {role === 'ADMIN' && (
                                        <p><strong>Professor:</strong> {relatorio.oferta.professor.profile.nomeCompleto}</p>
                                    )}
                                    <p><strong>Encerrado em:</strong> {new Date(relatorio.dataEncerramento).toLocaleDateString('pt-BR')}</p>
                                </div>
                                <Link href={`/api/relatorios/encerramento-turma/${relatorio.idOferta}`} target="_blank">
                                    <Button variant="outline" className="w-full gap-2">
                                        <FileDown className="h-4 w-4" />
                                        Emitir Relatório Final (PDF)
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
