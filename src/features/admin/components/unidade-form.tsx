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
import { Loader2, Save } from "lucide-react"
import { useState } from "react"
import { UnidadeFormData, unidadeSchema } from "../schemas/unidade-schema"
import { createUnidadeAction, updateUnidadeAction } from "../actions/unidade-action"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface UnidadeFormProps {
    initialData?: { id: number; nome: string }
}

export function UnidadeForm({ initialData }: UnidadeFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    const form = useForm<UnidadeFormData>({
        resolver: zodResolver(unidadeSchema),
        defaultValues: {
            nome: initialData?.nome || "",
        },
    })

    async function onSubmit(data: UnidadeFormData) {
        setIsLoading(true)
        const formData = new FormData()
        formData.append("nome", data.nome)

        let result
        if (initialData) {
            result = await updateUnidadeAction(initialData.id, null, formData)
        } else {
            result = await createUnidadeAction(null, formData)
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
                description: `Unidade ${initialData ? 'atualizada' : 'criada'} com sucesso.`
            })
            // Redirect is handled by server action, but we can verify
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
                            <FormLabel>Nome da Unidade / Campus</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Campus Frutal, Faculdade de Direito..." {...field} />
                            </FormControl>
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
