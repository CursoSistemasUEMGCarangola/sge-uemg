'use client'

import { createUnidade } from "@/features/admin/unidade-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useFormState, useFormStatus } from "react-dom"
import { useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Cadastrando..." : "Cadastrar Unidade"}
        </Button>
    )
}

export function CreateUnidadeForm() {
    const [state, action] = useFormState(createUnidade, null)
    const { toast } = useToast()
    const formRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        if (state?.success) {
            toast({
                children: (
                    <div className="flex flex-col gap-1">
                        <span className="font-bold text-green-600">Sucesso!</span>
                        <span className="text-sm">{state.success}</span>
                    </div>
                ),
            })
            formRef.current?.reset()
        } else if (state?.error) {
            toast({
                variant: "destructive",
                title: "Erro",
                description: state.error,
            })
        }
    }, [state, toast])

    return (
        <form action={action} ref={formRef} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="nome">Nome da Unidade</Label>
                <Input id="nome" name="nome" placeholder="Ex: Unidade Carangola" required />
            </div>
            <SubmitButton />
        </form>
    )
}
