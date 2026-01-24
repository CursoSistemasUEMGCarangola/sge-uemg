"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { saveRelatorioAvaliacao } from "@/features/estagio/actions"
import { Loader2, FileText } from "lucide-react"

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
    const { toast } = useToast()

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
                        disabled={!canEdit || isPending}
                    />

                    <div className="flex justify-end pt-4">
                        <Button
                            onClick={handleGeneratePDF}
                            disabled={isPending || text.length < 50}
                            size="lg"
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-5 w-5" />}
                            Gerar PDF do Relatório Final
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
