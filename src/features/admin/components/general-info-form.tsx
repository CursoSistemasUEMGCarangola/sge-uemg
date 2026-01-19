'use client'

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
import { createGeneralInfoAction, updateGeneralInfoAction } from "@/features/admin/actions/general-info-actions"
import { Loader2, Plus, Pencil } from "lucide-react"
import { useState } from "react"
import { useFormStatus, useFormState } from "react-dom"

interface GeneralInfoFormProps {
    categoria: string
    item?: { id: number; descricao: string }
    trigger?: React.ReactNode
}

const initialState = {
    success: false,
    error: null as string | null,
    message: null as string | null
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Salvar Alterações" : "Adicionar Item"}
        </Button>
    )
}

export function GeneralInfoForm({ categoria, item, trigger }: GeneralInfoFormProps) {
    const [open, setOpen] = useState(false)
    const isEditing = !!item

    async function action(prevState: any, formData: FormData) {
        formData.append('categoria', categoria)
        if (isEditing && item) {
            formData.append('id', item.id.toString())
            const res = await updateGeneralInfoAction(prevState, formData)
            if (res.success) setOpen(false)
            return res
        } else {
            const res = await createGeneralInfoAction(prevState, formData)
            if (res.success) setOpen(false)
            return res
        }
    }

    const [state, formAction] = useFormState(action, initialState)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant={isEditing ? "ghost" : "default"} size={isEditing ? "icon" : "default"}>
                        {isEditing ? <Pencil className="h-4 w-4" /> : <><Plus className="mr-2 h-4 w-4" /> Novo Item</>}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Editar Item" : "Novo Item"}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Faça alterações no item aqui." : `Adicione um novo item para ${categoria}.`}
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} className="space-y-4">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="descricao">Descrição</Label>
                        <Input
                            id="descricao"
                            name="descricao"
                            defaultValue={item?.descricao}
                            required
                        />
                    </div>
                    <DialogFooter>
                        <SubmitButton isEditing={isEditing} />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
