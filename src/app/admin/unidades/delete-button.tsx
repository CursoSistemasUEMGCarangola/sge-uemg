'use client'

import { deleteUnidade } from "@/features/admin/unidade-actions"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useTransition } from "react"
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

export function DeleteUnidadeButton({ id, disabled }: { id: number, disabled: boolean }) {
    const [isPending, startTransition] = useTransition()
    const { toast } = useToast()

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteUnidade(id)
            if (result.error) {
                toast({
                    variant: "destructive",
                    title: "Erro ao excluir",
                    description: result.error
                })
            } else {
                toast({
                    title: "Sucesso",
                    description: "Unidade excluída com sucesso.",
                })
            }
        })
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    disabled={disabled || isPending}
                    title={disabled ? "Possui cursos vinculados" : "Excluir"}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso excluirá permanentemente a unidade do sistema.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isPending ? "Excluindo..." : "Excluir"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
