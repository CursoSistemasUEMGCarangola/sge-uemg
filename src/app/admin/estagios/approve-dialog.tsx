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
import { approveStage } from "@/features/estagio/actions"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle } from "lucide-react"

interface ApproveDialogProps {
    contratoId: number
    etapaId: number
    etapaNome: string
}

export function ApproveDialog({ contratoId, etapaId, etapaNome }: ApproveDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [feedback, setFeedback] = useState("")
    const { toast } = useToast()

    async function handleApprove() {
        setLoading(true)
        try {
            await approveStage(contratoId, etapaId, feedback)
            toast({ title: "Sucesso", description: "Etapa aprovada com sucesso." })
            setOpen(false)
        } catch (error) {
            toast({ title: "Erro", description: "Falha ao aprovar etapa.", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Aprovar
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Aprovar Etapa: {etapaNome}</DialogTitle>
                    <DialogDescription>
                        Confirmar a aprovação desta etapa? O aluno será notificado e a próxima etapa será liberada.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="feedback">Observações (Opcional)</Label>
                    <Textarea
                        id="feedback"
                        placeholder="Comentários sobre a aprovação..."
                        value={feedback}
                        onChange={e => setFeedback(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleApprove} disabled={loading} className="bg-green-600 hover:bg-green-700">
                        {loading ? "Processando..." : "Confirmar Aprovação"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
