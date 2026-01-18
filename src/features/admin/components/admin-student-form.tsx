'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
import { adminStudentSchema } from "@/features/admin/schemas/admin-student-schema"
import { createStudentAction } from "@/features/admin/actions/create-student-action"
import { adminStudentUpdateSchema } from "@/features/admin/schemas/admin-student-update-schema"
import { updateStudentAction } from "@/features/admin/actions/update-student-action"
import { useState, useTransition } from "react"
import { AlertCircle, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { useRouter } from "next/navigation"

type RegisterFormValues = z.infer<typeof adminStudentSchema>

interface AdminStudentFormProps {
    initialData?: {
        id: string
        fullName: string
        matricula: string
        email: string
        telefone: string
        periodo: string
    }
}

export function AdminStudentForm({ initialData }: AdminStudentFormProps) {
    const [isPending, startTransition] = useTransition()
    const [serverError, setServerError] = useState<string | null>(null)
    const router = useRouter()
    const isEditing = !!initialData

    const form = useForm<any>({
        // @ts-ignore - Dynamic schema resolution causes type mismatch with rigid generic
        resolver: zodResolver(isEditing ? adminStudentUpdateSchema : adminStudentSchema),
        defaultValues: {
            fullName: initialData?.fullName || "",
            matricula: initialData?.matricula || "",
            email: initialData?.email || "",
            telefone: initialData?.telefone || "",
            periodo: initialData?.periodo || "",
            password: "",
        },
    })

    const formatPhone = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/^(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1')
    }

    async function onSubmit(data: RegisterFormValues) {
        setServerError(null)
        startTransition(async () => {
            const formData = new FormData()
            if (isEditing && initialData) {
                formData.append('id', initialData.id)
            }
            Object.entries(data).forEach(([key, value]) => {
                formData.append(key, value?.toString() || "")
            })

            const action = isEditing ? updateStudentAction : createStudentAction
            const result = await action(null as any, formData)

            if (result?.success) {
                // Redirect to list on success
                router.push('/admin/alunos')
                router.refresh()
            } else if (result?.success === false) {
                setServerError(result.error || "Erro desconhecido.")
                if (result.fieldErrors) {
                    Object.entries(result.fieldErrors).forEach(([field, messages]) => {
                        form.setError(field as any, { message: messages[0] })
                    })
                }
            }
        })
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <Link href="/admin/alunos">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <CardTitle className="text-xl">{isEditing ? "Editar Aluno" : "Novo Aluno"}</CardTitle>
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
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome Completo (MAIÚSCULAS)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="NOME COMPLETO"
                                            {...field}
                                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="matricula"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Matrícula</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Matrícula" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="periodo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Período</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
                                                    <SelectItem key={p} value={p.toString()}>{p}º Período</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="email@uemg.br" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="telefone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Telefone</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="(XX) XXXXX-XXXX"
                                                {...field}
                                                onChange={(e) => {
                                                    const formatted = formatPhone(e.target.value)
                                                    field.onChange(formatted)
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{isEditing ? "Nova Senha (Opcional)" : "Senha Inicial"}</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? "Salvar Alterações" : "Cadastrar Aluno"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
