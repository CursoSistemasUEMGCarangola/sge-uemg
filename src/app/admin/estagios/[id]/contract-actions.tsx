'use client'

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
import { deleteContractAction, updateContractStatusAction, rejectContractAction } from "@/features/estagio/actions"
import { Trash2, CheckCircle, Loader2, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ContractActionsProps {
    contractId: number
    status: string // 'PENDENTE' | 'ATIVO' | 'REJEITADO'
    currentStepId: number
}

export function ContractActions({ contractId, status, currentStepId }: ContractActionsProps) {
    const [isPending, startTransition] = useTransition()
    const [rejectOpen, setRejectOpen] = useState(false)
    const [rejectJustificativa, setRejectJustificativa] = useState("")
    const [isRejecting, setIsRejecting] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    const handleActivate = () => {
        startTransition(async () => {
            const result = await updateContractStatusAction(contractId, 'ATIVO')
            if (result.success) {
                toast({
                    title: "Status Atualizado",
                    description: "O estágio foi marcado como ATIVO (Aprovado).",
                })
                router.refresh()
            } else {
                toast({
                    variant: "destructive",
                    title: "Erro",
                    description: result.error,
                })
            }
        })
    }

    const handleReject = async () => {
        if (!rejectJustificativa || rejectJustificativa.trim().length < 15) {
            toast({
                variant: "destructive",
                title: "Erro",
                description: "A justificativa é obrigatória e deve ter pelo menos 15 caracteres.",
            })
            return
        }

        setIsRejecting(true)
        try {
            const result = await rejectContractAction(contractId, rejectJustificativa)
            if (result.success) {
                toast({
                    title: "Estágio Rejeitado",
                    description: "A solicitação foi indeferida e o aluno foi formalmente notificado.",
                })
                setRejectOpen(false)
                setRejectJustificativa("")
                router.refresh()
            } else {
                toast({
                    variant: "destructive",
                    title: "Erro",
                    description: result.error,
                })
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erro",
                description: "Falha ao registrar a rejeição do estágio.",
            })
        } finally {
            setIsRejecting(false)
        }
    }

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteContractAction(contractId)
            if (result.success) {
                toast({
                    title: "Contrato Liquidado",
                    description: "O registro de estágio foi excluído permanentemente.",
                })
                router.push('/admin') // Redirect to dashboard
                router.refresh()
            } else {
                toast({
                    variant: "destructive",
                    title: "Erro",
                    description: result.error,
                })
            }
        })
    }

    return (
        <div className="flex gap-2">
            {(status === 'PENDENTE' || status === 'REJEITADO') && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            {status === 'REJEITADO' ? "Reativar Estágio" : "Tornar Ativo"}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {status === 'REJEITADO' ? "Confirmar Reativação do Estágio" : "Confirmar Ativação"}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Tem certeza que deseja alterar o status deste estágio para <strong>ATIVO</strong>?<br />
                                Isso indicará que o aluno está apto a iniciar ou continuar as atividades.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleActivate} className="bg-green-600 hover:bg-green-700">
                                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            {(status === 'PENDENTE' || status === 'ATIVO') && (
                <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                            <XCircle className="mr-2 h-4 w-4" />
                            Rejeitar Estágio
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="text-red-700 flex items-center gap-2">
                                <XCircle className="h-5 w-5" />
                                Rejeitar e Indeferir Estágio
                            </DialogTitle>
                            <DialogDescription>
                                Esta ação rejeitará formalmente o estágio do aluno. O status mudará para <strong>REJEITADO</strong>, o parecer será documentado no sistema e enviado por e-mail ao aluno.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-2">
                            <Label htmlFor="justificativa-rejeicao" className="text-sm font-semibold">
                                Justificativa do Indeferimento (Obrigatória, mín. 15 caracteres)
                            </Label>
                            <Textarea
                                id="justificativa-rejeicao"
                                placeholder="Explique os motivos formais da rejeição (ex: incompatibilidade de plano pedagógico, pendência documental crítica, empresa não credenciada)..."
                                value={rejectJustificativa}
                                onChange={e => setRejectJustificativa(e.target.value)}
                                className="min-h-[120px]"
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setRejectOpen(false)} disabled={isRejecting}>
                                Cancelar
                            </Button>
                            <Button 
                                variant="destructive" 
                                onClick={handleReject} 
                                disabled={isRejecting || rejectJustificativa.trim().length < 15}
                            >
                                {isRejecting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Confirmar Rejeição do Estágio
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {currentStepId === 1 && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" title="Excluir Estágio">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Estágio?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isso excluirá permanentemente o contrato de estágio,
                                os dados submetidos na primeira etapa e eventuais rascunhos de atividades. Não será possível recuperar esses dados.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sim, Excluir"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    )
}
