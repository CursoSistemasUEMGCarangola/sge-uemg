'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

// Schema inference from server action file to keep synced
type RegisterFormValues = z.infer<typeof registerStudentSchema>


// Props interface
interface StudentRegisterFormProps {
    unidades: { id: number; nome: string }[]
    cursos: { id: number; nome: string; unidadeId: number }[]
}

export function StudentRegisterForm({ unidades, cursos }: StudentRegisterFormProps) {
    const [isPending, startTransition] = useTransition()
    const [serverError, setServerError] = useState<string | null>(null)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [selectedUnidade, setSelectedUnidade] = useState<string>("")

    // Filter courses based on selected unit
    const filteredCursos = cursos.filter(c => c.unidadeId === parseInt(selectedUnidade))

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerStudentSchema) as any,
        defaultValues: {
            fullName: "",
            matricula: "",
            confirmMatricula: "",
            email: "",
            confirmEmail: "",
            telefone: "",
            periodo: "",
            cursoId: 0, // Initial value
            password: "",
            confirmPassword: "",
            termsAccepted: false,
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
            Object.entries(data).forEach(([key, value]) => {
                formData.append(key, value.toString())
            })
            // Checkbox might need explicit handling if boolean isn't stringified as 'true'/'false' correctly for backend expectation, 
            // but our action handles 'on' or boolean string check. 
            // Let's ensure strict string passing.
            if (data.termsAccepted) formData.set('termsAccepted', 'on')

            const result = await registerStudentAction(null as any, formData)

            if (result?.success) {
                setShowSuccessModal(true)
            } else if (result?.success === false) {
                setServerError(result.message || "Erro desconhecido.")
                window.scrollTo({ top: 0, behavior: 'smooth' })
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Unidade Acadêmica */}
                            {/* Unidade Acadêmica */}
                            <div className="space-y-2">
                                <Label>Unidade Acadêmica</Label>
                                <Select onValueChange={setSelectedUnidade} value={selectedUnidade}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a unidade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {unidades.map((u) => (
                                            <SelectItem key={u.id} value={u.id.toString()}>{u.nome}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Curso */}
                            <FormField
                                control={form.control}
                                name="cursoId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Curso</FormLabel>
                                        <Select
                                            onValueChange={(val) => field.onChange(parseInt(val))}
                                            disabled={!selectedUnidade}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o curso" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {filteredCursos.map((c) => (
                                                    <SelectItem key={c.id} value={c.id.toString()}>{c.nome}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Telefone */}
                            <FormField
                                control={form.control}
                                name="telefone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Telefone / WhatsApp</FormLabel>
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
                        </div>

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

            <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl text-green-600">Cadastro realizado com sucesso</DialogTitle>
                        <DialogDescription className="text-center text-base pt-2">
                            Faça seu login no sistema com seu e-mail e senha.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center">
                        <Button asChild className="w-full sm:w-1/2">
                            <Link href="/login">
                                Login
                            </Link>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </Card>
    )
}
