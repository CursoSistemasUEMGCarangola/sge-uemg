"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { saveRelatorioAvaliacao, aprimorarTextoComIA } from "@/features/estagio/actions"
import { Loader2, FileText, Sparkles } from "lucide-react"

interface RelatorioFinalClientProps {
    contratoId: number
    etapaId: number
    initialText: string
    canEdit: boolean
    status: string
    observacoes?: string | null
}


export function RelatorioFinalClient({ contratoId, etapaId, initialText, canEdit }: RelatorioFinalClientProps) {
    const [text, setText] = useState(initialText)
    const [isPending, startTransition] = useTransition()
    const [isImproving, setIsImproving] = useState(false)
    const { toast } = useToast()

    const handleAprimorar = async () => {
        if (!text || text.length < 10) {
            toast({ title: "Digite um texto para ser aprimorado.", variant: "destructive" })
            return
        }

        setIsImproving(true)
        try {
            const res = await aprimorarTextoComIA(text)
            if (res.success && res.text) {
                setText(res.text)
                toast({ title: "Texto aprimorado com sucesso!" })
            } else {
                toast({ title: res.error || "Erro ao aprimorar texto", variant: "destructive" })
            }
        } catch (error) {
            toast({ title: "Erro na conexão com a IA", variant: "destructive" })
        } finally {
            setIsImproving(false)
        }
    }

    const handleGeneratePDF = () => {
        if (!text || text.length < 50) {
            toast({ title: "O texto deve ter pelo menos 50 caracteres.", variant: "destructive" })
            return
        }

        startTransition(async () => {
            // 1. Save the text first
            const res = await saveRelatorioAvaliacao(contratoId, text)
            if (res.success) {
                // 2. Open PDF in new tab
                window.open(`/aluno/relatorio-final/${contratoId}/pdf`, '_blank')
                toast({ title: "Relatório salvo e PDF gerado!" })
            } else {
                toast({ title: "Erro ao salvar dados", variant: "destructive" })
            }
        })
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Avaliação do Estagiário</CardTitle>
                    <CardDescription>
                        Descreva a conformidade das atividades desenvolvidas e os resultados alcançados.
                        Este texto constará no seu Relatório Final PDF.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Digite sua avaliação aqui..."
                        className="min-h-[400px] text-base p-4"
                        disabled={!canEdit || isPending || isImproving}
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            onClick={handleAprimorar}
                            disabled={isPending || isImproving || text.length < 10 || !canEdit}
                            variant="secondary"
                            type="button"
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200"
                        >
                            {isImproving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            SUGESTÃO DE APRIMORAMENTO COM IA
                        </Button>
                        <Button
                            onClick={handleGeneratePDF}
                            disabled={isPending || isImproving || text.length < 50 || !canEdit}
                            size="lg"
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isPending && !isImproving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-5 w-5" />}
                            Gerar PDF do Relatório Final
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
