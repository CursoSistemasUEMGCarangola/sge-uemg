'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Loader2, Lock } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AuthChangeEvent, Session } from '@supabase/supabase-js'

export default function ResetPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isRestoringSession, setIsRestoringSession] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    // Instância única do cliente Supabase para o componente
    const [supabase] = useState(() => createClient())

    // 1. Lógica de Restauração de Sessão
    useEffect(() => {
        const restoreSession = async () => {
            // Verifica se é um fluxo implícito (tokens no hash)
            const hasHash = window.location.hash && window.location.hash.includes('access_token')

            if (hasHash) {
                setIsRestoringSession(true) // Bloqueia UI

                try {
                    // Parse manual para garantir captura
                    const params = new URLSearchParams(window.location.hash.substring(1))
                    const access_token = params.get('access_token')
                    const refresh_token = params.get('refresh_token')

                    if (access_token && refresh_token) {
                        // Força a sessão manualmente
                        await supabase.auth.setSession({ access_token, refresh_token })
                    }
                } catch (e) {
                    console.error('Erro ao processar hash:', e)
                    setError('Link inválido ou expirado.')
                }
            }

            // Verifica estado atual
            const { data: { session } } = await supabase.auth.getSession()

            if (session) {
                setIsRestoringSession(false)
            } else {
                // Se ainda não tem sessão, aguarda evento do Supabase
                const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
                    if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY' || session) {
                        setIsRestoringSession(false)
                    }
                })

                // Timeout de segurança (5s) para não travar a tela
                if (hasHash) {
                    setTimeout(() => {
                        setIsRestoringSession(false)
                        // Se após 5s não tiver sessão, provavelmente falhou
                        supabase.auth.getSession().then(({ data }) => {
                            if (!data.session) setError('Não foi possível validar o link. Tente solicitar novamente.')
                        })
                    }, 5000)
                } else {
                    // Se não tem hash e nem sessão, o usuário caiu aqui de paraquedas
                    setIsRestoringSession(false)
                }

                return () => subscription.unsubscribe()
            }
        }
        restoreSession()
    }, [supabase])

    // 2. Handler do Formulário
    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        setError(null)
        const password = formData.get('password') as string
        const confirmPassword = formData.get('confirmPassword') as string

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.')
            setIsLoading(false)
            return
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.')
            setIsLoading(false)
            return
        }

        // Verificação de Segurança Extra
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            setError('Sessão expirada. Solicite o link novamente.')
            setIsLoading(false)
            return
        }

        // Update direto no cliente
        const { error } = await supabase.auth.updateUser({ password })

        if (error) {
            setError(error.message)
        } else {
            alert('Senha atualizada com sucesso!')
            router.push('/login')
        }
        setIsLoading(false)
    }

    if (isRestoringSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Validando link de segurança...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        Nova Senha
                    </CardTitle>
                    <CardDescription>
                        Crie uma nova senha segura para sua conta.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Nova Senha</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="******"
                                    className="pl-9"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="******"
                                    className="pl-9"
                                    required
                                />
                            </div>
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
                                    Atualizando...
                                </>
                            ) : 'Definir Nova Senha'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
