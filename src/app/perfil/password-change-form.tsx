'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { updatePasswordAction } from "./update-password-action"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardContent, CardFooter, Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Lock, Eye, EyeOff, KeyRound, RefreshCw, Loader2 } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

const initialState = {
    message: null as string | null,
    error: null as string | null,
    success: false
}

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Atualizar Senha
        </Button>
    )
}

export function PasswordChangeForm() {
    const [state, formAction] = useFormState(updatePasswordAction, initialState)
    const [showPassword, setShowPassword] = useState(false)
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const generatePassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
        let newPassword = ""
        for (let i = 0; i < 16; i++) {
            newPassword += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        setPassword(newPassword)
        setConfirmPassword(newPassword)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <KeyRound className="h-5 w-5 text-primary" />
                    Alterar Senha
                </CardTitle>
                <CardDescription>
                    Defina uma nova senha para acessar sua conta.
                </CardDescription>
            </CardHeader>
            <form action={formAction}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">Nova Senha</Label>
                        <div className="relative flex gap-2">
                            <div className="relative flex-1">
                                <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-9"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => setShowPassword(!showPassword)}
                                title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={generatePassword}
                                title="Gerar senha forte"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Gerar
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                        <div className="relative">
                            <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={cn("pl-9", password !== confirmPassword && confirmPassword ? "border-red-500" : "")}
                                required
                            />
                        </div>
                        {password !== confirmPassword && confirmPassword && (
                            <p className="text-xs text-red-500">As senhas não conferem.</p>
                        )}
                    </div>

                    {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}
                    {state?.success && <p className="text-green-500 text-sm">{state.message}</p>}
                </CardContent>
                <CardFooter className="justify-end bg-muted/20 px-6 py-4">
                    <SubmitButton />
                </CardFooter>
            </form>
        </Card>
    )
}
