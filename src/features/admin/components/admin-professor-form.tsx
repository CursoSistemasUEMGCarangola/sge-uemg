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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { adminProfessorSchema } from "@/features/admin/schemas/admin-professor-schema"
import { createProfessorAction } from "@/features/admin/actions/create-professor-action"
import { adminProfessorUpdateSchema } from "@/features/admin/schemas/admin-professor-update-schema"
import { updateProfessorAction } from "@/features/admin/actions/update-professor-action"
import { useState, useTransition } from "react"
import { AlertCircle, Loader2, ArrowLeft, Eye, EyeOff, Wand2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { useRouter } from "next/navigation"

type RegisterFormValues = z.infer<typeof adminProfessorSchema>

interface AdminProfessorFormProps {
    initialData?: {
        id: string
        fullName: string
        masp: string
        email: string
        telefone: string
    }
}

export function AdminProfessorForm({ initialData }: AdminProfessorFormProps) {
    const [isPending, startTransition] = useTransition()
    const [serverError, setServerError] = useState<string | null>(null)
    const router = useRouter()
    const isEditing = !!initialData

    const form = useForm<any>({
        // @ts-ignore - Dynamic schema resolution causes type mismatch with rigid generic
        resolver: zodResolver(isEditing ? adminProfessorUpdateSchema : adminProfessorSchema),
        defaultValues: {
            fullName: initialData?.fullName || "",
            masp: initialData?.masp || "",
            email: initialData?.email || "",
            telefone: initialData?.telefone || "",
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

            const action = isEditing ? updateProfessorAction : createProfessorAction
            const result = await action(null as any, formData)

            if (result?.success) {
                router.push('/admin/professores')
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

    const [showPassword, setShowPassword] = useState(false)

    const generateStrongPassword = () => {
        const length = 12
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
        let retVal = ""
        for (let i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n))
        }
        form.setValue("password", retVal)
        setShowPassword(true) // Show the password so they can copy it
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <Link href="/admin/professores">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <CardTitle className="text-xl">{isEditing ? "Editar Professor" : "Novo Professor"}</CardTitle>
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
                                name="masp"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>MASP</FormLabel>
                                        <FormControl>
                                            <Input placeholder="MASP" {...field} />
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

                        <div className="flex gap-4 items-end">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>{isEditing ? "Nova Senha (Opcional)" : "Senha Inicial"}</FormLabel>
                                        <div className="relative">
                                            <FormControl>
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                                )}
                                                <span className="sr-only">{showPassword ? "Ocultar senha" : "Mostrar senha"}</span>
                                            </Button>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={generateStrongPassword}
                                className="mb-[2px]" // Align with input
                            >
                                <Wand2 className="mr-2 h-4 w-4" />
                                Gerar Senha
                            </Button>
                        </div>

                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? "Salvar Alterações" : "Cadastrar Professor"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
