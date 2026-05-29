"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mail, Loader2 } from "lucide-react"
import { sendBulkAlertsAction, sendSingleAlertAction } from "@/features/estagio/actions/email-actions"
import { useToast } from "@/hooks/use-toast"

interface SendAlertButtonProps {
    type: 'bulk' | 'single'
    targetId?: number | null
    className?: string
    variant?: 'default' | 'outline' | 'secondary'
}

export function SendAlertButton({ type, targetId, className, variant = "default" }: SendAlertButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    async function handleSend() {
        setIsLoading(true)
        try {
            let res;
            if (type === 'bulk') {
                res = await sendBulkAlertsAction(targetId || undefined)
            } else {
                if (!targetId) throw new Error("ID do contrato não fornecido")
                res = await sendSingleAlertAction(targetId)
            }

            if (res.success) {
                toast({
                    title: "Sucesso!",
                    description: res.message || "Alerta enviado com sucesso.",
                    variant: "default"
                })
            } else {
                toast({
                    title: "Erro no envio",
                    description: res.error,
                    variant: "destructive"
                })
            }
        } catch (error: any) {
            toast({
                title: "Erro inesperado",
                description: error.message || "Não foi possível enviar os alertas.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button 
            onClick={handleSend} 
            disabled={isLoading || (type === 'single' && !targetId)} 
            className={className}
            variant={variant}
            size="sm"
        >
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Mail className="mr-2 h-4 w-4" />
            )}
            {type === 'bulk' ? 'Enviar Alertas para Todos' : 'Enviar Alerta ao Aluno'}
        </Button>
    )
}
