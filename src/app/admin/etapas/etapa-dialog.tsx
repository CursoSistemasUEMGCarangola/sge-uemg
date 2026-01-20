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
import { Textarea } from "@/components/ui/textarea"
import { Plus, Pencil } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { etapaSchema, EtapaFormData } from "@/features/admin/schemas/etapa-schema"
import { upsertEtapa } from "@/features/admin/actions/etapa-actions"
import { useToast } from "@/hooks/use-toast"

interface EtapaDialogProps {
    etapa?: any // Using any to avoid importing Prisma type on client (simplify)
    mode: 'create' | 'edit'
}

export function EtapaDialog({ etapa, mode }: EtapaDialogProps) {
    const [open, setOpen] = useState(false)
    const { toast } = useToast()

    const form = useForm<EtapaFormData>({
        resolver: zodResolver(etapaSchema),
        defaultValues: {
            id: etapa?.id,
            numeroEtapa: etapa?.numeroEtapa || undefined,
            descricao: etapa?.descricao || "",
            orientacaoTextual: etapa?.orientacaoTextual || "",
        }
    })

    async function onSubmit(data: EtapaFormData) {
        try {
            const res = await upsertEtapa(data)
            if (res.error) {
                toast({ title: "Erro", description: res.error, variant: "destructive" })
            } else {
                toast({ title: "Sucesso", description: "Etapa salva com sucesso." })
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
                        Nova Etapa
                    </Button>
                ) : (
                    <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{mode === 'create' ? "Nova Etapa" : "Editar Etapa"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="numero">Número da Etapa</Label>
                        <Input id="numero" type="number" {...form.register("numeroEtapa")} />
                        {form.formState.errors.numeroEtapa && (
                            <p className="text-xs text-red-500">{form.formState.errors.numeroEtapa.message}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="descricao">Descrição (Título)</Label>
                        <Input id="descricao" {...form.register("descricao")} />
                        {form.formState.errors.descricao && (
                            <p className="text-xs text-red-500">{form.formState.errors.descricao.message}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="orientacao">Orientação (Instruções)</Label>
                        <Textarea id="orientacao" rows={5} {...form.register("orientacaoTextual")} />
                        {form.formState.errors.orientacaoTextual && (
                            <p className="text-xs text-red-500">{form.formState.errors.orientacaoTextual.message}</p>
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
