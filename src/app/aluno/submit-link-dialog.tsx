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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { submitEtapaLink, submitRelatorio } from "@/features/estagio/actions"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Link as LinkIcon, FileText } from "lucide-react"

interface SubmitLinkDialogProps {
    contratoId: number
    etapaId: number
    etapaNumero: number
    etapaNome: string
    currentLink?: string | null
    currentText?: string | null
}

export function SubmitLinkDialog({ contratoId, etapaId, etapaNumero, etapaNome, currentLink, currentText }: SubmitLinkDialogProps) {
    const [open, setOpen] = useState(false)
    const [link, setLink] = useState(currentLink || "")
    const [text, setText] = useState(currentText || "")
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const isRelatorio = etapaNumero === 6

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        try {
            let result
            if (isRelatorio) {
                result = await submitRelatorio(contratoId, etapaId, text)
            } else {
                result = await submitEtapaLink(contratoId, etapaId, link)
            }

            if (result?.error) {
                toast({ title: "Erro", description: result.error, variant: "destructive" })
            } else {
                toast({ title: "Sucesso", description: isRelatorio ? "Relatório enviado." : "Link enviado para análise." })
                setOpen(false)
            }
        } catch (error) {
            toast({ title: "Erro", description: "Ocorreu um erro ao enviar.", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="default">
                    {isRelatorio ? <FileText className="mr-2 h-4 w-4" /> : <LinkIcon className="mr-2 h-4 w-4" />}
                    {isRelatorio ? (currentText ? "Editar Relatório" : "Escrever Relatório") : (currentLink ? "Alterar Link" : "Enviar Link")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isRelatorio ? "Relatório de Avaliação" : `Enviar Documento - ${etapaNome}`}</DialogTitle>
                    <DialogDescription>
                        {isRelatorio
                            ? "Descreva as atividades desenvolvidas e os resultados alcançados (mínimo 50 caracteres)."
                            : "Cole o link público do seu arquivo (OneDrive/Google Drive) para análise do professor."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {isRelatorio ? (
                            <div className="grid gap-2">
                                <Label htmlFor="texto">Texto do Relatório</Label>
                                <Textarea
                                    id="texto"
                                    value={text}
                                    onChange={e => setText(e.target.value)}
                                    rows={10}
                                    placeholder="Digite seu relatório aqui..."
                                    required
                                    minLength={50}
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="link" className="text-right">Link</Label>
                                <Input
                                    id="link"
                                    placeholder="https://..."
                                    className="col-span-3"
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    required
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Enviando..." : "Salvar"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
