'use client'

import { createCurso } from "@/features/admin/curso-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFormState, useFormStatus } from "react-dom"
import { useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Cadastrando..." : "Cadastrar Curso"}
        </Button>
    )
}

interface CreateCursoFormProps {
    unidades: { id: number; nome: string }[]
}

export function CreateCursoForm({ unidades }: CreateCursoFormProps) {
    const [state, action] = useFormState(createCurso, null)
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
                <Label htmlFor="nome">Nome do Curso</Label>
                <Input id="nome" name="nome" placeholder="Ex: Sistemas de Informação" required />
            </div>

            <div className="space-y-2">
                <Label htmlFor="unidadeId">Unidade Acadêmica</Label>
                <Select name="unidadeId" required>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione a unidade" />
                    </SelectTrigger>
                    <SelectContent>
                        {unidades.map((unidade) => (
                            <SelectItem key={unidade.id} value={String(unidade.id)}>
                                {unidade.nome}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <SubmitButton />
        </form>
    )
}
