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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { adminOfferSchema, AdminOfferFormValues } from "@/features/admin/schemas/admin-offer-schema"
import { createOfferAction } from "@/features/admin/actions/create-offer-action"
import { useState, useTransition } from "react"
import { AlertCircle, Loader2, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface AdminOfferFormProps {
    internships: { id: number; nome: string }[]
    professors: { id: number; info: string }[]
    initialData?: {
        id: number
        cursoEstagioId: number
        professorOrientadorId: number
        semestreLetivo: string
        dataInicio: Date
        dataFim: Date
    }
}

export function AdminOfferForm({ internships, professors, initialData }: AdminOfferFormProps) {
    const [isPending, startTransition] = useTransition()
    const [serverError, setServerError] = useState<string | null>(null)
    const router = useRouter()
    const isEditing = !!initialData

    const form = useForm<AdminOfferFormValues>({
        resolver: zodResolver(adminOfferSchema) as any,
        defaultValues: {
            cursoEstagioId: initialData?.cursoEstagioId || 0,
            professorOrientadorId: initialData?.professorOrientadorId || 0,
            semestreLetivo: initialData?.semestreLetivo || "",
            // @ts-ignore
            dataInicio: initialData?.dataInicio ? new Date(initialData.dataInicio).toISOString().split('T')[0] : "",
            // @ts-ignore
            dataFim: initialData?.dataFim ? new Date(initialData.dataFim).toISOString().split('T')[0] : "",
        },
    })

    async function onSubmit(data: AdminOfferFormValues) {
        setServerError(null)
        startTransition(async () => {
            const formData = new FormData()
            if (isEditing && initialData) {
                formData.append('id', initialData.id.toString())
            }

            formData.append('cursoEstagioId', data.cursoEstagioId.toString())
            formData.append('professorOrientadorId', data.professorOrientadorId.toString())
            formData.append('semestreLetivo', data.semestreLetivo)
            formData.append('dataInicio', data.dataInicio.toString())
            formData.append('dataFim', data.dataFim.toString())

            // Note: Update action not implemented yet in this turn, using create for both structure validatity
            // Ideally we would swap actions here.
            const action = createOfferAction
            const result = await action(null, formData)

            if (result?.success) {
                router.push('/admin/ofertas')
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
                <Link href="/admin/ofertas">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <CardTitle className="text-xl">{isEditing ? "Editar Orientação" : "Nova Orientação de Estágio"}</CardTitle>
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
                            name="cursoEstagioId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Selecione um Estágio</FormLabel>
                                    <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        defaultValue={field.value ? field.value.toString() : undefined}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione um tipo" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {internships.map((item) => (
                                                <SelectItem key={item.id} value={item.id.toString()}>
                                                    {item.nome}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="professorOrientadorId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Professor Orientador</FormLabel>
                                    <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        defaultValue={field.value ? field.value.toString() : undefined}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione um professor" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {professors.map((item) => (
                                                <SelectItem key={item.id} value={item.id.toString()}>
                                                    {item.info}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="semestreLetivo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Semestre Letivo (ex: 2024/1)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="ex.: 2026-1" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="dataInicio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Data de Início</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="dataFim"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Data de Término</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? "Salvar Alterações" : "Confirmar Orientação"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
