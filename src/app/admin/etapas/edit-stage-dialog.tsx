'use client'

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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { SYSTEM_ACTIONS } from "@/config/system-actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Pencil } from "lucide-react"
import { updateStageAction } from "@/features/admin/actions/stage-actions"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface EditStageDialogProps {
    etapa: {
        id: number
        numeroEtapa: number
        descricao: string
        orientacaoTextual: string
        prazoDias: number
        systemAction: string | null
    }
}

export function EditStageDialog({ etapa }: EditStageDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        try {
            const result = await updateStageAction(formData)
            if (result.error) {
                toast({
                    title: "Erro",
                    description: result.error,
                    variant: "destructive"
                })
            } else {
                toast({
                    title: "Sucesso",
                    description: "Etapa atualizada com sucesso!"
                })
                setOpen(false)
                router.refresh()
            }
        } catch (error) {
            toast({
                title: "Erro",
                description: "Erro inesperado. Tente novamente.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Editar Etapa {etapa.numeroEtapa}</DialogTitle>
                    <DialogDescription>
                        Ajuste as definições e prazos desta etapa do estágio.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit}>
                    <input type="hidden" name="id" value={etapa.id} />
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="descricao">Descrição (Nome da Etapa)</Label>
                            <Input
                                id="descricao"
                                name="descricao"
                                defaultValue={etapa.descricao}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="prazoDias">Prazo Padrão (Dias)</Label>
                            <Input
                                id="prazoDias"
                                name="prazoDias"
                                type="number"
                                min="0"
                                defaultValue={etapa.prazoDias}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                O prazo começa a contar a partir da conclusão da etapa anterior.
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="orientacaoTextual">Orientação para o Aluno</Label>
                            <Textarea
                                id="orientacaoTextual"
                                name="orientacaoTextual"
                                defaultValue={etapa.orientacaoTextual}
                                className="h-24"
                                required
                            />
                        </div>


                        <div className="grid gap-2">
                            <Label htmlFor="systemAction">Ação de Sistema</Label>
                            <Select name="systemAction" defaultValue={etapa.systemAction || "none"}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma ação..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Nenhuma (Padrão)</SelectItem>
                                    {Object.entries(SYSTEM_ACTIONS).map(([key, config]) => (
                                        <SelectItem key={key} value={key}>
                                            {config.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Define qual funcionalidade especial será habilitada para o aluno nesta etapa.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
