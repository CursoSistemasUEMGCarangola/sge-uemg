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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Mail, Loader2, Send, AlertCircle, Users, CheckCircle2 } from "lucide-react"
import { sendCustomBulkMessageAction } from "@/features/estagio/actions/email-actions"
import { useToast } from "@/hooks/use-toast"

interface ContratoItemSummary {
    id: number
    aluno?: {
        profile?: {
            nomeCompleto?: string
            email?: string
            emailAlternativo?: string | null
        }
    }
}

interface SendMessageDialogProps {
    contratos: ContratoItemSummary[]
    selectedOfertaNome?: string | null
    selectedStatusLabel?: string | null
    className?: string
}

export function SendMessageDialog({
    contratos,
    selectedOfertaNome,
    selectedStatusLabel,
    className
}: SendMessageDialogProps) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [assunto, setAssunto] = useState("")
    const [mensagem, setMensagem] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const count = contratos.length
    const hasActiveFilter = Boolean(selectedOfertaNome || selectedStatusLabel)
    const filterDescription = [
        selectedOfertaNome ? `Turma: ${selectedOfertaNome}` : "Todas as turmas ativas",
        selectedStatusLabel ? `Status: ${selectedStatusLabel}` : "Todos os status"
    ].join(" | ")

    function handleOpenPromptConfirm() {
        if (!mensagem || mensagem.trim().length < 5) {
            toast({
                title: "Mensagem obrigatória",
                description: "Por favor, digite o conteúdo da mensagem (mínimo de 5 caracteres).",
                variant: "destructive"
            })
            return
        }
        setConfirmOpen(true)
    }

    async function handleConfirmSend() {
        setConfirmOpen(false)
        setIsLoading(true)

        try {
            const contratoIds = contratos.map(c => c.id)
            const res = await sendCustomBulkMessageAction({
                contratoIds,
                assunto: assunto.trim() || undefined,
                mensagem: mensagem.trim(),
                contextoFiltro: filterDescription
            })

            if (res.success) {
                toast({
                    title: "Mensagens enviadas!",
                    description: res.message || `Mensagem enviada com sucesso para os alunos.`,
                    variant: "default"
                })
                setDialogOpen(false)
                setMensagem("")
                setAssunto("")
            } else {
                toast({
                    title: "Erro no envio",
                    description: res.error || "Ocorreu uma falha ao enviar as mensagens.",
                    variant: "destructive"
                })
            }
        } catch (error: any) {
            toast({
                title: "Erro inesperado",
                description: error.message || "Não foi possível concluir o envio.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                    <Button
                        size="sm"
                        disabled={count === 0 || isLoading}
                        className={className}
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Mail className="mr-2 h-4 w-4" />
                        )}
                        Enviar Mensagem a Todos
                    </Button>
                </DialogTrigger>

                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5 text-primary" />
                            Enviar Mensagem aos Alunos
                        </DialogTitle>
                        <DialogDescription>
                            Envie um comunicado oficial direto para a caixa de e-mail dos alunos selecionados.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Mensagem explicativa do filtro ativo */}
                    <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-4 text-sm text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200 space-y-2.5">
                        <div className="flex items-start gap-2.5">
                            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                            <div>
                                <p className="font-semibold text-blue-950 dark:text-blue-100">
                                    Atenção: O envio será realizado para os alunos do filtro ativo no momento
                                </p>
                                <p className="text-xs text-blue-800 dark:text-blue-300 mt-0.5">
                                    A mensagem será enviada preferencialmente para os <strong>e-mails alternativos</strong> cadastrados pelos alunos.
                                </p>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-blue-200/80 dark:border-blue-800/60 flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-medium text-blue-900 dark:text-blue-200 flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />
                                Destinatários no filtro:
                            </span>
                            <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-100 font-bold px-2">
                                {count} {count === 1 ? "aluno" : "alunos"}
                            </Badge>

                            {selectedOfertaNome && (
                                <Badge variant="outline" className="border-blue-300 text-blue-900 dark:text-blue-200">
                                    Turma: {selectedOfertaNome}
                                </Badge>
                            )}

                            {selectedStatusLabel && (
                                <Badge variant="outline" className="border-blue-300 text-blue-900 dark:text-blue-200">
                                    Status: {selectedStatusLabel}
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="msg-assunto">Assunto (opcional)</Label>
                            <Input
                                id="msg-assunto"
                                placeholder="Ex: Comunicado sobre relatórios parciais e prazos"
                                value={assunto}
                                onChange={e => setAssunto(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="msg-texto">
                                Mensagem <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="msg-texto"
                                placeholder="Digite o comunicado ou orientação que deseja enviar para este grupo de alunos..."
                                value={mensagem}
                                onChange={e => setMensagem(e.target.value)}
                                rows={6}
                                className="resize-none"
                                disabled={isLoading}
                            />
                            <p className="text-xs text-muted-foreground text-right">
                                {mensagem.length} caracteres
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setDialogOpen(false)}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleOpenPromptConfirm}
                            disabled={isLoading || count === 0 || !mensagem.trim()}
                            className="bg-primary"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Avançar para Envio
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de Confirmação Obrigatório */}
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            Confirmar Envio da Mensagem
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2 text-sm text-foreground/80 pt-2">
                            <p>
                                Você confirma o disparo deste e-mail para os <strong>{count} {count === 1 ? "aluno" : "alunos"}</strong> que constam no filtro ativo?
                            </p>
                            <div className="rounded bg-muted p-2.5 text-xs text-muted-foreground space-y-1">
                                <p><strong>Filtro ativo:</strong> {filterDescription}</p>
                                <p><strong>Destino:</strong> E-mails alternativos cadastrados pelos alunos</p>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading}>Voltar e Editar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmSend}
                            disabled={isLoading}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                            Confirmar e Enviar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
