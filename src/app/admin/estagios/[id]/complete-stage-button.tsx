"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import { completeStageAction } from "@/features/estagio/actions/stage-completion-action"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface CompleteStageButtonProps {
    acompanhamentoId: number
    disabled?: boolean
}

export function CompleteStageButton({ acompanhamentoId, disabled }: CompleteStageButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    async function handleComplete() {
        if (!confirm("Tem certeza que deseja marcar esta etapa como CONCLUÍDA? Isso liberará o acesso para o aluno avançar.")) {
            return
        }

        setIsLoading(true)
        try {
            const result = await completeStageAction(acompanhamentoId)
            if (result.error) {
                toast({
                    title: "Erro",
                    description: result.error,
                    variant: "destructive"
                })
            } else {
                toast({
                    title: "Sucesso",
                    description: "Etapa marcada como concluída!",
                    variant: "default"
                })
                router.refresh()
            }
        } catch (error) {
            toast({
                title: "Erro",
                description: "Erro inesperado.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            onClick={handleComplete}
            disabled={isLoading || disabled}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {isLoading ? "Processando..." : "Concluir Etapa e Liberar Avanço"}
        </Button>
    )
}
