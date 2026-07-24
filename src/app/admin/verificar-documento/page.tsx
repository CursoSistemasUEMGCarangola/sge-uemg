"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { verificarDocumentoAction } from "@/features/admin/actions/verify-document"
import { CheckCircle2, XCircle, Search, ShieldCheck } from "lucide-react"

export default function VerificarDocumentoPage() {
    const [codigo, setCodigo] = useState("")
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!codigo) return;

        setLoading(true)
        setError(null)
        setResult(null)

        try {
            const res = await verificarDocumentoAction(codigo.trim())
            if (res.error) {
                setError(res.error)
            } else {
                setResult(res.data)
            }
        } catch (err) {
            setError("Erro ao verificar o documento.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto py-8 max-w-3xl">
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <ShieldCheck className="h-8 w-8 text-primary" />
                Verificação de Autenticidade
            </h1>
            
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Validar Relatório</CardTitle>
                    <CardDescription>
                        Digite o código de autenticidade (formato ID-HASH ou TURMA-ID-HASH) impresso no rodapé do relatório.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleVerify} className="flex gap-4">
                        <Input 
                            value={codigo}
                            onChange={e => setCodigo(e.target.value)}
                            placeholder="Ex: 42-A1B2C3D4 ou TURMA-12-A1B2..."
                            className="flex-1 font-mono uppercase"
                        />
                        <Button type="submit" disabled={loading || !codigo}>
                            {loading ? <Search className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                            Verificar
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6 flex items-start gap-4">
                        <XCircle className="h-10 w-10 text-red-600 mt-1" />
                        <div>
                            <h3 className="text-xl font-bold text-red-800">Verificação Falhou</h3>
                            <p className="text-red-600 mt-2">{error}</p>
                            <p className="text-red-700 mt-2 text-sm">
                                Se o código foi digitado corretamente e a verificação falhou, o documento pode ter sido alterado (forjado) ou a assinatura digital está corrompida.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {result && (
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-6 flex items-start gap-4">
                        <CheckCircle2 className="h-10 w-10 text-green-600 mt-1" />
                        <div className="w-full">
                            <h3 className="text-xl font-bold text-green-800">Documento Válido e Autêntico</h3>
                            <p className="text-green-700 mt-2 mb-4 text-sm">
                                O código confere com a assinatura em nosso banco de dados. Os dados originais do documento são:
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm bg-white p-4 rounded border border-green-100">
                                <div className="col-span-2">
                                    <span className="text-muted-foreground block text-xs">Tipo de Documento</span>
                                    <span className="font-bold text-primary">{result.tipo}</span>
                                </div>
                                {result.alunoNome && (
                                    <>
                                        <div>
                                            <span className="text-muted-foreground block text-xs">Aluno(a)</span>
                                            <span className="font-medium">{result.alunoNome}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block text-xs">Matrícula</span>
                                            <span className="font-medium">{result.matricula}</span>
                                        </div>
                                    </>
                                )}
                                {result.professorNome && (
                                    <div className="col-span-2">
                                        <span className="text-muted-foreground block text-xs">Professor(a) Orientador(a)</span>
                                        <span className="font-medium">{result.professorNome}</span>
                                    </div>
                                )}
                                <div>
                                    <span className="text-muted-foreground block text-xs">Curso / Turma</span>
                                    <span className="font-medium">{result.curso}</span>
                                </div>
                                {result.statusFinal && (
                                    <div>
                                        <span className="text-muted-foreground block text-xs">Status Final do Estágio</span>
                                        <span className="font-medium">{result.statusFinal}</span>
                                    </div>
                                )}
                                <div className="col-span-2">
                                    <span className="text-muted-foreground block text-xs">Data de Conclusão / Encerramento</span>
                                    <span className="font-medium">
                                        {result.dataConclusao 
                                            ? new Date(result.dataConclusao).toLocaleString('pt-BR') 
                                            : 'Pendente/Não registrada'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
