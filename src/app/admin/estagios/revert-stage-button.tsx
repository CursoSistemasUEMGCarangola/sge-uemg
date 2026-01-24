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

interface RevertStageButtonProps {
    contratoId: number
    disabled?: boolean
}

export function RevertStageButton({ contratoId, disabled }: RevertStageButtonProps) {
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
                toast({ title: "Sucesso", description: "Etapa revertida para análise." })
                setOpen(false)
            }
        } catch (error) {
            toast({ title: "Erro", description: "Falha ao reverter etapa.", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    if (disabled) return null

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-amber-700 border-amber-200 hover:bg-amber-50">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reverter Etapa
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-amber-600">
                        <AlertTriangle className="h-5 w-5" />
                        Reverter Última Etapa Concluída
                    </DialogTitle>
                    <DialogDescription className="py-2">
                        Você está prestes a reverter o status da última etapa concluída para <strong>"Em Análise"</strong>.
                        <br /><br />
                        Isso fará com que o estágio "ande para trás", bloqueando as etapas subsequentes e exigindo uma nova aprovação para esta etapa.
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
