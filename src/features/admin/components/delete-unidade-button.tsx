'use client'

import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { deleteUnidadeAction } from "../actions/unidade-action"
import { useState } from "react"
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

export function DeleteUnidadeButton({ id, nome }: { id: number, nome: string }) {
    const [isDeleting, setIsDeleting] = useState(false)
    const { toast } = useToast()

    async function handleDelete() {
        setIsDeleting(true)
        const result = await deleteUnidadeAction(id)

        if (!result.success) {
            toast({
                variant: "destructive",
                title: "Erro ao excluir",
                description: result.error
            })
        } else {
            toast({
                title: "Sucesso",
                description: "Unidade excluída com sucesso."
            })
        }
        setIsDeleting(false)
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
                    <AlertDialogTitle>Excluir Unidade?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tem certeza que deseja excluir a unidade <strong>{nome}</strong>?
                        Essa ação não pode ser desfeita e pode falhar se houver cursos vinculados.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={isDeleting}>
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Excluir"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
