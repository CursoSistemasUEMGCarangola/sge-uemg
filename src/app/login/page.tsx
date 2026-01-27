'use client'

import { useFormState } from 'react-dom'
import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { LockKeyhole, User, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// Initial state for the form action
const initialState = {
    error: null as string | null,
}

export default function LoginPage() {
    // Basic wrapper to handle form state with the server action
    async function handleLogin(prevState: any, formData: FormData) {
        const result = await login(formData)
        if (result?.error) {
            return { error: result.error }
        }
        return { error: null }
    }

    const [state, formAction] = useFormState(handleLogin, initialState)

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#305B7D] p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1 text-center relative">
                    <div className="absolute left-4 top-4">
                        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                            <Link href="/">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                    <CardTitle className="text-2xl font-bold text-[#305B7D]">SGE - UEMG</CardTitle>
                    <CardDescription>
                        Sistema de Gestão de Estágios
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    name="email"
                                    placeholder="seu.email@uemg.br"
                                    type="email"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    autoCorrect="off"
                                    required
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <div className="relative">
                                <LockKeyhole className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        {state?.error && (
                            <div className="text-sm text-red-500 font-medium text-center">
                                {state.error}
                            </div>
                        )}
                        <Button type="submit" className="w-full bg-[#E31837] hover:bg-[#b0132b]">
                            Entrar
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Novo no sistema?
                                </span>
                            </div>
                        </div>

                        <Button
                            asChild
                            variant="outline"
                            className="w-full border-[#305B7D] text-[#305B7D] hover:bg-[#305B7D] hover:text-white"
                        >
                            <Link href="/auth/cadastro">
                                PRIMEIRO ACESSO
                            </Link>
                        </Button>

                        <div className="text-center">
                            <Link
                                href="/auth/recover"
                                className="text-sm text-muted-foreground hover:text-primary hover:underline transition-all"
                            >
                                Esqueci minha senha
                            </Link>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="text-center text-sm text-muted-foreground justify-center">
                    Universidade do Estado de Minas Gerais
                </CardFooter>
            </Card>
        </div>
    )
}
