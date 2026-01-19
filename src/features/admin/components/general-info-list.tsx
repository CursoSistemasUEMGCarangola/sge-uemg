'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, ToggleLeft, ToggleRight } from "lucide-react"
import { GeneralInfoForm } from "./general-info-form"
import { deleteGeneralInfoAction, toggleGeneralInfoStatusAction } from "@/features/admin/actions/general-info-actions"
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

interface GeneralInfoListProps {
    items: {
        id: number
        categoria: string
        descricao: string
        ativo: boolean | null
    }[]
    categoria: string
}

export function GeneralInfoList({ items, categoria }: GeneralInfoListProps) {
    const filteredItems = items.filter(item => item.categoria === categoria)

    if (filteredItems.length === 0) {
        return <div className="text-center p-4 text-muted-foreground">Nenhum item cadastrado.</div>
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredItems.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.descricao}</TableCell>
                            <TableCell>
                                <Badge variant={item.ativo ? "default" : "secondary"}>
                                    {item.ativo ? "Ativo" : "Inativo"}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right flex items-center justify-end gap-2">
                                <form action={async () => { await toggleGeneralInfoStatusAction(item.id, !!item.ativo) }}>
                                    <Button variant="ghost" size="icon" title="Alterar Status">
                                        {item.ativo ? <ToggleRight className="h-5 w-5 text-green-600" /> : <ToggleLeft className="h-5 w-5 text-slate-400" />}
                                    </Button>
                                </form>
                                <GeneralInfoForm categoria={categoria} item={item} />

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Excluir Item</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Tem certeza que deseja excluir "{item.descricao}"? Esta ação não pode ser desfeita.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => deleteGeneralInfoAction(item.id)} className="bg-red-600 hover:bg-red-700">
                                                Excluir
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
