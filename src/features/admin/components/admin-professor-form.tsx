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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"


interface AdminProfessorFormProps {
    initialData?: {
        id: string
        fullName: string
        masp: string
        email: string
        telefone: string
        cursoId?: number
    }
    unidades?: { id: number; nome: string }[]
    cursos?: { id: number; nome: string; unidadeId: number }[]
}

export function AdminProfessorForm({ initialData, unidades = [], cursos = [] }: AdminProfessorFormProps) {
    const [isPending, startTransition] = useTransition()
    const [serverError, setServerError] = useState<string | null>(null)
    const router = useRouter()
    const isEditing = !!initialData

    const [selectedUnidade, setSelectedUnidade] = useState<string>("")
    // If editing, try to find unit from initial course
    const initialCourse = cursos.find(c => c.id === initialData?.cursoId)
    // Initialize unit only once
    const [initializedUnit, setInitializedUnit] = useState(false)

    if (!initializedUnit && initialCourse) {
        setSelectedUnidade(initialCourse.unidadeId.toString())
        setInitializedUnit(true)
    }

    const filteredCursos = cursos.filter(c => c.unidadeId === parseInt(selectedUnidade))

    const form = useForm<any>({
        // @ts-ignore - Dynamic schema resolution
        resolver: zodResolver(isEditing ? adminProfessorUpdateSchema : adminProfessorSchema),
        defaultValues: {
            id: initialData?.id || "",
            fullName: initialData?.fullName || "",
            masp: initialData?.masp || "",
            email: initialData?.email || "",
            telefone: initialData?.telefone || "",
            cursoId: initialData?.cursoId || 0,
            password: "",
        },
    })

    const [showPassword, setShowPassword] = useState(false)

    const formatPhone = (value: string) => {
        return value
            .replace(/\D/g, "")
            .replace(/^(\d{2})(\d)/g, "($1) $2")
            .replace(/(\d)(\d{4})$/, "$1-$2")
            .slice(0, 15)
    }

    const generateStrongPassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
        let password = ""
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        form.setValue("password", password)
        setShowPassword(true)
    }

    async function onSubmit(values: any) {
        startTransition(async () => {
            try {
                const formData = new FormData()
                Object.entries(values).forEach(([key, value]) => {
                    if (value) formData.append(key, value as string)
                })

                const result = isEditing
                    ? await updateProfessorAction(null, formData)
                    : await createProfessorAction(null, formData)

                if (!result.success) {
                    setServerError(result.error || "Erro desconhecido")
                } else {
                    setServerError(null)
                    router.push("/admin/professores")
                    router.refresh()
                }
            } catch (error) {
                setServerError("Ocorreu um erro ao salvar o professor.")
            }
        })
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{isEditing ? "Editar Professor" : "Novo Professor"}</CardTitle>
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
                        {isEditing && <input type="hidden" {...form.register("id")} />}

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

                        {/* Unidade e Curso Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Unidade Acadêmica (Filter only) */}
                            <div className="space-y-2">
                                <Label>Unidade Acadêmica</Label>
                                <Select
                                    onValueChange={(value) => {
                                        setSelectedUnidade(value)
                                        form.setValue("cursoId", 0) // Reset course when unit changes
                                    }}
                                    value={selectedUnidade}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a unidade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {unidades.map((unidade) => (
                                            <SelectItem key={unidade.id} value={unidade.id.toString()}>
                                                {unidade.nome}
                                            </SelectItem>
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
                                            defaultValue={field.value?.toString()}
                                            disabled={!selectedUnidade}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o curso" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {filteredCursos.map((curso) => (
                                                    <SelectItem key={curso.id} value={curso.id.toString()}>
                                                        {curso.nome}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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
            </CardContent >
        </Card >
    )
}
