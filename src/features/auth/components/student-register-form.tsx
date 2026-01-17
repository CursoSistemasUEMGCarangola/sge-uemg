'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { registerStudentAction } from "@/features/auth/actions/register-action"
import { registerStudentSchema } from "@/features/auth/schemas/register-schema"
import { useFormState } from "react-dom"
import { useRef, useState, useTransition } from "react"
import { AlertCircle, Loader2, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

// Schema inference from server action file to keep synced
type RegisterFormValues = z.infer<typeof registerStudentSchema>

export function StudentRegisterForm() {
    const [isPending, startTransition] = useTransition()
    const [serverError, setServerError] = useState<string | null>(null)

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerStudentSchema),
        defaultValues: {
            fullName: "",
            matricula: "",
            confirmMatricula: "",
            email: "",
            confirmEmail: "",
            periodo: "",
            password: "",
            confirmPassword: "",
            termsAccepted: false,
        },
    })

    async function onSubmit(data: RegisterFormValues) {
        setServerError(null)
        startTransition(async () => {
            const formData = new FormData()
            Object.entries(data).forEach(([key, value]) => {
                formData.append(key, value.toString())
            })
            // Checkbox might need explicit handling if boolean isn't stringified as 'true'/'false' correctly for backend expectation, 
            // but our action handles 'on' or boolean string check. 
            // Let's ensure strict string passing.
            if (data.termsAccepted) formData.set('termsAccepted', 'on')

            const result = await registerStudentAction(null as any, formData)

            if (result?.success === false) {
                setServerError(result.message || "Erro desconhecido.")
                if (result.errors) {
                    // Map server errors back to form fields if possible
                    Object.entries(result.errors).forEach(([field, messages]) => {
                        form.setError(field as any, { message: messages[0] })
                    })
                }
            }
        })
    }

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-lg">
            <CardHeader className="relative">
                <div className="absolute left-6 top-6">
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                        <Link href="/">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
                <CardTitle className="text-2xl font-bold text-center">Cadastro de Aluno SGE</CardTitle>
                <CardDescription className="text-center">
                    Preencha seus dados para solicitar acesso. Todos os campos são obrigatórios.
                </CardDescription>
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

                        {/* Nome Completo */}
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome Completo (Sem abreviações)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Digite seu nome completo e sem abreviações"
                                            {...field}
                                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                        />
                                    </FormControl>
                                    <FormDescription>Digite apenas letras maiúsculas.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Matrícula */}
                            <FormField
                                control={form.control}
                                name="matricula"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Matrícula</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Exatamente como consta no Lyceum" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmMatricula"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirmar Matrícula</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Repita a matrícula" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Email */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Institucional</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="@uemg.br" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmEmail"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirmar Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="Repita o email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Periodo */}
                        <FormField
                            control={form.control}
                            name="periodo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Período Atual</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o período" />
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Senha */}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Senha</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirmar Senha</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Termos */}
                        <FormField
                            control={form.control}
                            name="termsAccepted"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Termo de Responsabilidade
                                        </FormLabel>
                                        <FormDescription>
                                            Declaro estar ciente de minha responsabilidade pela custódia de meu login e senha, bem como pela veracidade dos dados aqui informados.
                                        </FormDescription>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {form.formState.errors.termsAccepted && (
                            <p className="text-sm font-medium text-destructive">{form.formState.errors.termsAccepted.message}</p>
                        )}


                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Cadastrar
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
