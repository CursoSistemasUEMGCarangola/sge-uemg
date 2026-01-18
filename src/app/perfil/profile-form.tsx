'use client'

import { useFormState } from 'react-dom'
import { updateProfile } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardContent, CardFooter } from "@/components/ui/card"
import { User, Phone, Mail } from "lucide-react"

const initialState = {
    message: null as string | null,
    error: null as string | null,
}

// @ts-ignore
export function ProfileForm({ profile }) {

    const formatPhone = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/^(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1')
    }

    // @ts-ignore
    const [state, formAction] = useFormState(updateProfile, initialState)

    return (
        <form action={formAction}>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email (Não alterável)</Label>
                    <div className="relative">
                        <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="email"
                            // @ts-ignore
                            value={profile.email}
                            className="pl-9 bg-muted"
                            disabled
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo</Label>
                    <div className="relative">
                        <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="nome"
                            name="nome"
                            // @ts-ignore
                            defaultValue={profile.nomeCompleto}
                            className="pl-9"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <div className="relative">
                        <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="telefone"
                            name="telefone"
                            placeholder="(XX) XXXXX-XXXX"
                            // @ts-ignore
                            defaultValue={profile.telefone || ''}
                            onChange={(e) => {
                                e.target.value = formatPhone(e.target.value)
                            }}
                            className="pl-9"
                        />
                    </div>
                </div>
                {/* @ts-ignore */}
                {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}
                {/* @ts-ignore */}
                {state?.success && <p className="text-green-500 text-sm">Perfil atualizado com sucesso!</p>}
            </CardContent>
            <CardFooter className="justify-end bg-muted/20 px-6 py-4">
                <Button type="submit">Salvar Alterações</Button>
            </CardFooter>
        </form>
    )
}
