"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { revertStage } from "@/features/estagio/actions"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { RotateCcw, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface RevertStageButtonProps {
    contratoId: number
    disabled?: boolean
    className?: string
}

export function RevertStageButton({ contratoId, disabled, className }: RevertStageButtonProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    async function handleRevert() {
        setLoading(true)
        try {
            const res = await revertStage(contratoId)
            if (res.error) {
                toast({ title: "Erro", description: res.error, variant: "destructive" })
            } else {
                toast({ title: "Sucesso", description: "Etapa retrocedida. O aluno agora pode executá-la novamente." })
                setOpen(false)
            }
        } catch (error) {
            toast({ title: "Erro", description: "Falha ao reverter etapa.", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className={cn("text-amber-700 border-amber-300 hover:bg-amber-600 hover:text-white transition-colors", className)}
                    disabled={disabled || loading}
                >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Retroceder Etapa
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-amber-600">
                        <AlertTriangle className="h-5 w-5" />
                        Retroceder Última Etapa Concluída
                    </DialogTitle>
                    <DialogDescription className="py-2">
                        Você está prestes a retroceder o status da última etapa concluída para <strong>"Pendente"</strong>.
                        <br /><br />
                        Isso fará com que o estágio "ande para trás", permitindo que o aluno refaça o envio ou a execução desta etapa.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button
                        onClick={handleRevert}
                        disabled={loading}
                        variant="destructive"
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                        {loading ? "Revertendo..." : "Confirmar Reversão"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
