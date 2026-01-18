'use client'

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
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { useTransition, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { deleteOfferAction } from "@/features/admin/actions/delete-offer-action"

interface DeleteOfferButtonProps {
    id: number
}

export function DeleteOfferButton({ id }: DeleteOfferButtonProps) {
    const [isPending, startTransition] = useTransition()
    const [open, setOpen] = useState(false)
    const { toast } = useToast()

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteOfferAction(id)
            if (result.success) {
                toast({
                    title: "Sucesso",
                    description: "Oferta excluída com sucesso.",
                })
                setOpen(false)
            } else {
                toast({
                    title: "Erro",
                    description: result.error,
                    variant: "destructive",
                })
            }
        })
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Excluir Oferta?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso excluirá permanentemente esta oferta de estágio.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-red-500 hover:bg-red-600">
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirmar Exclusão
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
