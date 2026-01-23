"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useMask } from "@react-input/mask"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { RegisterProfessorFormData, registerProfessorSchema } from "../schemas/register-professor-schema"
import { registerProfessorAction } from "../actions/register-professor-action"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ProfessorRegisterFormProps {
    unidades: { id: number; nome: string }[]
    cursos: { id: number; nome: string; unidadeId: number }[]
}

export function ProfessorRegisterForm({ unidades, cursos }: ProfessorRegisterFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [serverError, setServerError] = useState<string | null>(null)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [selectedUnidade, setSelectedUnidade] = useState<string>("")

    // Filter courses based on selected unit
    const filteredCursos = cursos.filter(c => c.unidadeId === parseInt(selectedUnidade))

    // Masks
    const phoneMaskRef = useMask({ mask: '(__) _____-____', replacement: { _: /\d/ } })

    const form = useForm<RegisterProfessorFormData>({
        resolver: zodResolver(registerProfessorSchema) as any,
        defaultValues: {
            fullName: "",
            masp: "",
            confirmMasp: "",
            email: "",
            confirmEmail: "",
            telefone: "",
            cursoId: 0,
            password: "",
            confirmPassword: "",
        },
    })

    async function onSubmit(data: RegisterProfessorFormData) {
        setIsLoading(true)
        setServerError(null)

        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value.toString())
        })

        const result = await registerProfessorAction(null, formData)

        if (result?.success) {
            setShowSuccessModal(true)
        } else if (result?.error) {
            setServerError(result.error)
            // Handle field-specific errors if returned
            if (result.fieldErrors) {
                Object.entries(result.fieldErrors).forEach(([field, errors]) => {
                    form.setError(field as any, {
                        type: "server",
                        message: (errors as string[])[0]
                    })
                })
            }
        }
        setIsLoading(false)
    }

    return (
        <>
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-2xl mx-auto">
                <div className="flex items-center mb-6">
                    <Link href="/auth/cadastro" className="mr-4 text-gray-500 hover:text-gray-700 transition-colors">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Cadastro de Professor</h2>
                        <p className="text-sm text-gray-500">Crie sua conta para gerenciar estágios</p>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* Nome Completo */}
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome Completo (em maiúsculas)</FormLabel>
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

                        {/* MASP Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="masp"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>MASP</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Seu MASP" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmMasp"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirme o MASP</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Repita o MASP" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Unidade e Curso Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Unidade Acadêmica (Filter only) */}
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

                        {/* Email Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Institucional</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="seu.email@uemg.br" {...field} />
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
                                        <FormLabel>Confirme o Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="Repita o email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

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
                                            ref={phoneMaskRef}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Password Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Senha</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
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
                                        <FormLabel>Confirme a Senha</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Repita a senha" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {serverError && (
                            <div className="text-red-500 text-sm font-medium text-center p-2 bg-red-50 rounded-md">
                                {serverError}
                            </div>
                        )}

                        <Button type="submit" className="w-full h-12 text-lg bg-[#305B7D] hover:bg-[#244560]" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Cadastrando...
                                </>
                            ) : (
                                "Finalizar Cadastro"
                            )}
                        </Button>
                    </form>
                </Form>
            </div>

            <AlertDialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cadastro realizado com sucesso!</AlertDialogTitle>
                        <AlertDialogDescription>
                            Sua conta de professor foi criada. Você já pode acessar o sistema com seu email e senha.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Link href="/login" passHref>
                            <AlertDialogAction className="w-full">Ir para Login</AlertDialogAction>
                        </Link>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
