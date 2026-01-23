'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save } from "lucide-react"
import { useState } from "react"
import { CursoFormData, cursoSchema } from "../schemas/curso-schema"
import { createCursoAction, updateCursoAction } from "../actions/curso-action"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface CursoFormProps {
    initialData?: { id: number; nome: string; unidadeId: number }
    unidades: { id: number; nome: string }[]
}

export function CursoForm({ initialData, unidades }: CursoFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    const form = useForm<CursoFormData>({
        resolver: zodResolver(cursoSchema) as any,
        defaultValues: {
            nome: initialData?.nome || "",
            unidadeId: initialData?.unidadeId || 0,
        },
    })

    async function onSubmit(data: CursoFormData) {
        setIsLoading(true)
        const formData = new FormData()
        formData.append("nome", data.nome)
        formData.append("unidadeId", data.unidadeId.toString())

        let result
        if (initialData) {
            result = await updateCursoAction(initialData.id, null, formData)
        } else {
            result = await createCursoAction(null, formData)
        }

        if (result?.error) {
            toast({
                variant: "destructive",
                title: "Erro",
                description: result.error
            })
            if (result.fieldErrors) {
                Object.entries(result.fieldErrors).forEach(([field, errors]) => {
                    form.setError(field as any, { message: errors[0] })
                })
            }
        } else {
            toast({
                title: "Sucesso",
                description: `Curso ${initialData ? 'atualizado' : 'criado'} com sucesso.`
            })
        }
        setIsLoading(false)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nome do Curso</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Sistemas de Informação" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="unidadeId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Unidade Acadêmica</FormLabel>
                            <Select
                                onValueChange={(val) => field.onChange(parseInt(val))}
                                defaultValue={field.value ? field.value.toString() : undefined}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a unidade" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {unidades.map((unidade) => (
                                        <SelectItem key={unidade.id} value={unidade.id.toString()}>
                                            {unidade.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        Salvar
                    </Button>
                </div>
            </form>
        </Form>
    )
}
