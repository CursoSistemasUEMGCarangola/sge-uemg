'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react'
import { recoverPassword } from './actions'
import Link from 'next/link'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function RecoverPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        setError(null)
        setSuccess(false)

        try {
            const result = await recoverPassword(formData)

            if (result.error) {
                setError(result.error)
            } else {
                setSuccess(true)
            }
        } catch (e) {
            setError('Ocorreu um erro inesperado. Tente novamente.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        Recuperar Senha
                    </CardTitle>
                    <CardDescription>
                        Digite seu email para receber um link de redefinição de senha.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {success ? (
                        <div className="space-y-4">
                            <div className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-lg border border-green-100 text-center">
                                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-green-900 mb-2">Email Enviado!</h3>
                                <p className="text-green-700 text-sm">
                                    Verifique sua caixa de entrada (e spam) para encontrar o link de redefinição.
                                </p>
                            </div>
                            <Button asChild className="w-full" variant="outline">
                                <Link href="/login">Voltar para o Login</Link>
                            </Button>
                        </div>
                    ) : (
                        <form action={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Cadastrado</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="ex: aluno@uemg.br"
                                    required
                                />
                            </div>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Erro</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Enviando...
                                    </>
                                ) : 'Enviar Link de Recuperação'}
                            </Button>
                        </form>
                    )}
                </CardContent>
                {!success && (
                    <CardFooter className="flex justify-center">
                        <Link
                            href="/login"
                            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Voltar para o Login
                        </Link>
                    </CardFooter>
                )}
            </Card>
        </div>
    )
}
