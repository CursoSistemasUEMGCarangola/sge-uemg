'use client'

import { deleteInternshipAction } from "@/features/admin/actions/delete-internship-action"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
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
import { useState, useTransition } from "react"
import { useToast } from "@/hooks/use-toast"

interface DeleteInternshipButtonProps {
    id: number
    nome: string
}

export function DeleteInternshipButton({ id, nome }: DeleteInternshipButtonProps) {
    const [isPending, startTransition] = useTransition()
    const [open, setOpen] = useState(false)
    const { toast } = useToast()

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteInternshipAction(id)
            if (result.success) {
                toast({
                    title: "Sucesso",
                    description: "Estágio excluído com sucesso.",
                })
                setOpen(false)
            } else {
                toast({
                    title: "Erro",
                    description: result.error || "Erro ao excluir estágio.",
                    variant: "destructive",
                })
                // Don't close dialog on error so user can see it's intentional if it's a constraint error
                if (result.error?.includes("vinculados")) {
                    setOpen(false) // actually close it, the toast is enough, or keep it open? toast is better.
                }
            }
        })
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/90">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Excluir Estágio</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tem certeza que deseja excluir o estágio <strong>{nome}</strong>?
                        <br /><br />
                        Esta ação não pode ser desfeita. Se houverem ofertas ou contratos vinculados, a exclusão será bloqueada.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            handleDelete()
                        }}
                        disabled={isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isPending ? "Excluindo..." : "Excluir"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
