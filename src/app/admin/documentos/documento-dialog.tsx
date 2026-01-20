"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { documentoSchema, DocumentoFormData } from "@/features/admin/schemas/documento-schema"
import { upsertDocumento, deleteDocumento } from "@/features/admin/actions/documento-actions"
import { useToast } from "@/hooks/use-toast"
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

interface DocumentoDialogProps {
    documento?: any
    mode: 'create' | 'edit'
}

export function DocumentoDialog({ documento, mode }: DocumentoDialogProps) {
    const [open, setOpen] = useState(false)
    const { toast } = useToast()

    const form = useForm<DocumentoFormData>({
        resolver: zodResolver(documentoSchema),
        defaultValues: {
            id: documento?.id,
            nomeArquivo: documento?.nomeArquivo || "",
            urlLink: documento?.urlLink || "",
        }
    })

    async function onSubmit(data: DocumentoFormData) {
        try {
            const res = await upsertDocumento(data)
            if (res.error) {
                toast({ title: "Erro", description: res.error, variant: "destructive" })
            } else {
                toast({ title: "Sucesso", description: "Documento salvo com sucesso." })
                setOpen(false)
                form.reset()
            }
        } catch (error) {
            toast({ title: "Erro", description: "Ocorreu um erro.", variant: "destructive" })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {mode === 'create' ? (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Documento
                    </Button>
                ) : (
                    <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? "Novo Documento" : "Editar Documento"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="nome">Nome do Arquivo</Label>
                        <Input id="nome" {...form.register("nomeArquivo")} placeholder="Ex: Modelo de Relatório" />
                        {form.formState.errors.nomeArquivo && (
                            <p className="text-xs text-red-500">{form.formState.errors.nomeArquivo.message}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="link">Link (URL Pública)</Label>
                        <Input id="link" {...form.register("urlLink")} placeholder="https://..." />
                        {form.formState.errors.urlLink && (
                            <p className="text-xs text-red-500">{form.formState.errors.urlLink.message}</p>
                        )}
                    </div>

                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export function DeleteDocumentoDialog({ id }: { id: number }) {
    const { toast } = useToast()

    async function handleDelete() {
        const res = await deleteDocumento(id)
        if (res.error) {
            toast({ title: "Erro", description: res.error, variant: "destructive" })
        } else {
            toast({ title: "Sucesso", description: "Documento excluído." })
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. O documento será removido permanentemente.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
