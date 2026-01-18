'use client'

import { deleteUserAction } from "@/features/admin/actions/delete-user-action"
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

interface DeleteUserButtonProps {
    userId: string
    userName: string
}

export function DeleteUserButton({ userId, userName }: DeleteUserButtonProps) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const { toast } = useToast()

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteUserAction(userId)
            if (result.success) {
                toast({
                    title: "Usuário excluído",
                    description: `O usuário ${userName} foi removido com sucesso.`,
                })
                setOpen(false)
            } else {
                toast({
                    variant: "destructive",
                    title: "Erro ao excluir",
                    description: result.error,
                })
                // Don't close modal so user sees error? check UX.
                // Or close and show toast.
                setOpen(false)
            }
        })
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Excluir Usuário?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tem certeza que deseja excluir <b>{userName}</b>? <br />
                        Esta ação não pode ser desfeita e removerá todo o histórico e acesso deste usuário.
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
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sim, Excluir
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
