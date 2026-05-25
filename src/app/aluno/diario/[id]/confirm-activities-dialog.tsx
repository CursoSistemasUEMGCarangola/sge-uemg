"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { submitRelatorioAtividades } from "@/features/estagio/actions"
import { useToast } from "@/hooks/use-toast"
import { Send, AlertTriangle } from "lucide-react"

interface ConfirmActivitiesDialogProps {
    contratoId: number
    totalHoras: number
    etapaId: number // Step 4 ID usually
}

export function ConfirmActivitiesDialog({ contratoId, totalHoras, etapaId }: ConfirmActivitiesDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    async function handleConfirm() {
        setLoading(true)
        try {
            const res = await submitRelatorioAtividades(contratoId, etapaId)
            if ('error' in res && res.error) {
                toast({ title: "Erro", description: res.error, variant: "destructive" })
            } else {
                toast({ title: "Relatório Enviado", description: "O professor receberá uma notificação." })
                setOpen(false)
                // Optional: Redirect
            }
        } catch (error) {
            toast({ title: "Erro", description: "Falha ao enviar." })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Relatório
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Enviar Relatório de Atividades?</DialogTitle>
                    <DialogDescription>
                        Você registrou um total de <strong>{totalHoras} horas</strong>.
                        Ao confirmar, o diário será enviado para análise do professor orientador e você não poderá mais alterá-lo até a aprovação.
                    </DialogDescription>
                </DialogHeader>

                {totalHoras < 20 && (
                    <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />
                        <p className="text-sm text-yellow-700">
                            Atenção: A carga horária parece baixa. Verifique se lançou todas as atividades antes de enviar.
                        </p>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleConfirm} disabled={loading}>
                        {loading ? "Enviando..." : "Confirmar Envio"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
