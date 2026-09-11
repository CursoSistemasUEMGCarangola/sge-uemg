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
import { notifyStageAction } from "@/features/estagio/actions"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { MessageSquare } from "lucide-react"

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
        if (!feedback || feedback.trim().length < 5) {
            toast({ title: "Erro", description: "Mensagem obrigatória (mínimo 5 caracteres).", variant: "destructive" })
            return
        }

        setLoading(true)
        try {
            const res = await notifyStageAction(contratoId, etapaId, feedback)
            if (res.error) {
                toast({ title: "Erro", description: res.error, variant: "destructive" })
            } else {
                toast({ title: "Sucesso", description: "Orientação enviada com sucesso ao aluno." })
                setOpen(false)
                setFeedback("")
            }
        } catch (error) {
            toast({ title: "Erro", description: "Falha ao enviar orientação.", variant: "destructive" })
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
                    className="text-blue-700 border-blue-300 hover:bg-blue-600 hover:text-white transition-colors"
                >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Enviar Orientação
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Enviar Orientação na Etapa: {etapaNome}</DialogTitle>
                    <DialogDescription>
                        Esta mensagem aparecerá como uma orientação para o aluno sobre procedimentos e necessidades do estágio. O status da etapa não será alterado para Rejeitado.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="feedback-notify">Texto da Orientação (Obrigatório)</Label>
                    <Textarea
                        id="feedback-notify"
                        placeholder="Descreva as orientações, procedimentos ou necessidades para o aluno..."
                        value={feedback}
                        onChange={e => setFeedback(e.target.value)}
                        className="min-h-[100px]"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleNotify} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                        {loading ? "Enviando..." : "Enviar Orientação"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

