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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { rejectStage } from "@/features/estagio/actions"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { XCircle } from "lucide-react"

interface RejectDialogProps {
    contratoId: number
    etapaId: number
    etapaNome: string
}

export function RejectDialog({ contratoId, etapaId, etapaNome }: RejectDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [feedback, setFeedback] = useState("")
    const { toast } = useToast()

    async function handleReject() {
        if (!feedback || feedback.length < 10) {
            toast({ title: "Erro", description: "Justificativa obrigatória (mínimo 10 caracteres).", variant: "destructive" })
            return
        }

        setLoading(true)
        try {
            await rejectStage(contratoId, etapaId, feedback)
            toast({ title: "Sucesso", description: "Etapa rejeitada. O aluno deverá reenviar." })
            setOpen(false)
        } catch (error) {
            toast({ title: "Erro", description: "Falha ao rejeitar etapa.", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive">
                    <XCircle className="mr-2 h-4 w-4" />
                    Rejeitar
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rejeitar Etapa: {etapaNome}</DialogTitle>
                    <DialogDescription>
                        Esta ação retornará o status para "Rejeitado" e o aluno precisará corrigir o documento.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="feedback-reject">Justificativa da Rejeição (Obrigatório)</Label>
                    <Textarea
                        id="feedback-reject"
                        placeholder="Explique o motivo da rejeição para que o aluno possa corrigir..."
                        value={feedback}
                        onChange={e => setFeedback(e.target.value)}
                        className="min-h-[100px]"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleReject} disabled={loading} variant="destructive">
                        {loading ? "Processando..." : "Confirmar Rejeição"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
