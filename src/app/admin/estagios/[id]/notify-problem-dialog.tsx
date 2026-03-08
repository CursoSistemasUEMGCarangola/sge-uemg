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
import { MessageSquareWarning } from "lucide-react"

interface NotifyProblemDialogProps {
    contratoId: number
    etapaId: number
    etapaNome: string
}

export function NotifyProblemDialog({ contratoId, etapaId, etapaNome }: NotifyProblemDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [feedback, setFeedback] = useState("")
    const { toast } = useToast()

    async function handleNotify() {
        if (!feedback || feedback.length < 10) {
            toast({ title: "Erro", description: "Mensagem obrigatória (mínimo 10 caracteres).", variant: "destructive" })
            return
        }

        setLoading(true)
        try {
            await rejectStage(contratoId, etapaId, feedback)
            toast({ title: "Sucesso", description: "Aluno notificado. O status foi alterado para Rejeitado." })
            setOpen(false)
        } catch (error) {
            toast({ title: "Erro", description: "Falha ao enviar notificação.", variant: "destructive" })
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
                    className="text-amber-700 border-amber-300 hover:bg-amber-600 hover:text-white transition-colors"
                >
                    <MessageSquareWarning className="mr-2 h-4 w-4" />
                    Notificar Problema
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Notificar Problema na Etapa: {etapaNome}</DialogTitle>
                    <DialogDescription>
                        Esta mensagem aparecerá como um alerta para o aluno. Use para solicitar correções ou ações imediatas.
                        O status da etapa mudará para "Rejeitado".
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="feedback-notify">Mensagem para o Aluno (Obrigatório)</Label>
                    <Textarea
                        id="feedback-notify"
                        placeholder="Descreva o problema ou o que o aluno deve fazer..."
                        value={feedback}
                        onChange={e => setFeedback(e.target.value)}
                        className="min-h-[100px]"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleNotify} disabled={loading} className="bg-amber-600 hover:bg-amber-700 text-white">
                        {loading ? "Enviando..." : "Enviar Notificação"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
