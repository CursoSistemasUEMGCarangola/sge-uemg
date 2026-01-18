'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { adminInternshipSchema, AdminInternshipFormValues } from "@/features/admin/schemas/admin-internship-schema"
import { createInternshipAction } from "@/features/admin/actions/create-internship-action"
import { updateInternshipAction } from "@/features/admin/actions/update-internship-action"
import { useState, useTransition } from "react"
import { AlertCircle, Loader2, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface AdminInternshipFormProps {
    initialData?: {
        id: number
        nome: string
        periodoVinculado: number
        cargaHorariaTotal: number
    }
}

export function AdminInternshipForm({ initialData }: AdminInternshipFormProps) {
    const [isPending, startTransition] = useTransition()
    const [serverError, setServerError] = useState<string | null>(null)
    const router = useRouter()
    const isEditing = !!initialData

    const form = useForm<AdminInternshipFormValues>({
        resolver: zodResolver(adminInternshipSchema) as any,
        defaultValues: {
            nome: initialData?.nome || "",
            periodoVinculado: initialData?.periodoVinculado || 0,
            cargaHorariaTotal: initialData?.cargaHorariaTotal || 0,
        },
    })

    async function onSubmit(data: AdminInternshipFormValues) {
        setServerError(null)
        startTransition(async () => {
            const formData = new FormData()
            if (isEditing && initialData) {
                formData.append('id', initialData.id.toString())
            }
            Object.entries(data).forEach(([key, value]) => {
                formData.append(key, value.toString())
            })

            const action = isEditing ? updateInternshipAction : createInternshipAction
            const result = await action(null, formData)

            if (result?.success) {
                router.push('/admin/estagios')
                router.refresh()
            } else if (result?.success === false) {
                setServerError(result.error || "Erro desconhecido.")
                if (result.fieldErrors) {
                    Object.entries(result.fieldErrors).forEach(([field, messages]) => {
                        // @ts-ignore
                        form.setError(field, { message: messages[0] })
                    })
                }
            }
        })
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <Link href="/admin/estagios">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <CardTitle className="text-xl">{isEditing ? "Editar Tipo de Estágio" : "Novo Tipo de Estágio"}</CardTitle>
            </CardHeader>
            <CardContent>
                {serverError && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Erro</AlertTitle>
                        <AlertDescription>{serverError}</AlertDescription>
                    </Alert>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <FormField
                            control={form.control}
                            name="nome"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome (ex: Estágio Obrigatório I)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nome do estágio" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="periodoVinculado"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Período Vinculado</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="ex: 5" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="cargaHorariaTotal"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Carga Horária Total (Horas)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="ex: 100" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? "Salvar Alterações" : "Cadastrar Estágio"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
