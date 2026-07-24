"use client"

import { useState } from "react"
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
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { encerrarOrientacaoAction } from "../actions/encerramento-actions"
import { Loader2, AlertTriangle } from "lucide-react"

interface EncerrarOrientacaoDialogProps {
    ofertaId: number
    disabled?: boolean
}

export function EncerrarOrientacaoDialog({ ofertaId, disabled }: EncerrarOrientacaoDialogProps) {
    const [open, setOpen] = useState(false)
    const [confirmText, setConfirmText] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const isConfirmValid = confirmText === "ENCERRAR"

    async function handleEncerrar() {
        if (!isConfirmValid) return

        setIsLoading(true)
        try {
            const result = await encerrarOrientacaoAction(ofertaId)
            if (result.error) {
                toast({
                    title: "Erro ao encerrar",
                    description: result.error,
                    variant: "destructive"
                })
            } else {
                toast({
                    title: "Orientação Encerrada",
                    description: "A orientação e todos os vínculos foram encerrados com sucesso.",
                    variant: "default"
                })
                setOpen(false)
            }
        } catch (error) {
            toast({
                title: "Erro inesperado",
                description: "Ocorreu um erro ao processar sua solicitação.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" size="sm" className="w-full mt-2" disabled={disabled}>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Encerrar Orientação
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-red-600 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Encerrar Orientação Definitivamente?
                    </DialogTitle>
                    <DialogDescription className="pt-3 pb-2 text-foreground space-y-2">
                        <p>
                            Você está prestes a <strong>encerrar a orientação</strong> desta turma. Esta ação é <strong>irreversível</strong>.
                        </p>
                        <p>
                            Todos os alunos vinculados perderão o acesso ao ambiente de estágio e terão seus status alterados para ENCERRADO. Um relatório PDF consolidado será gerado.
                        </p>
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <p className="text-sm font-medium">
                            Digite <span className="font-bold text-red-600">ENCERRAR</span> para confirmar:
                        </p>
                        <Input
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder="ENCERRAR"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button 
                        variant="destructive" 
                        onClick={handleEncerrar} 
                        disabled={!isConfirmValid || isLoading}
                    >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Confirmar Encerramento
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
