"use client"

import { useState, useTransition } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon, Clock, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { logAtividade, deleteAtividade } from "@/features/estagio/actions"

import { ConfirmActivitiesDialog } from "./confirm-activities-dialog"

interface DiarioClientProps {
    contratoId: number
    initialEntries: any[]
    etapaId: number
    canSubmit: boolean
}

export function DiarioClient({ contratoId, initialEntries, etapaId, canSubmit }: DiarioClientProps) {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [horas, setHoras] = useState<string>("4")
    const [descricao, setDescricao] = useState("")
    const [isPending, startTransition] = useTransition()
    const { toast } = useToast()

    // Calculate total hours
    const totalHoras = initialEntries.reduce((acc, curr) => acc + curr.horasRealizadas, 0)

    async function handleSave() {
        if (!date || !horas || !descricao) {
            toast({ title: "Preencha todos os campos", variant: "destructive" })
            return
        }

        const h = parseInt(horas)
        if (isNaN(h)) {
            toast({ title: "Horas inválidas", variant: "destructive" })
            return
        }

        startTransition(async () => {
            const res = await logAtividade(contratoId, date, h, descricao)
            if (res.error) {
                toast({ title: "Erro", description: res.error, variant: "destructive" })
            } else {
                toast({ title: "Atividade registrada", variant: "default" })
                setDescricao("")
            }
        })
    }

    async function handleDelete(id: number) {
        if (!confirm("Tem certeza?")) return
        startTransition(async () => {
            await deleteAtividade(id)
            toast({ title: "Removido", description: "Atividade removida." })
        })
    }

    return (
        <div className="grid gap-6 md:grid-cols-12">
            {/* Form Section */}
            <div className="md:col-span-5 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Registrar Atividade</CardTitle>
                        <CardDescription>Selecione a data e descreva as atividades.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-center">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md border"
                                disabled={(date) => date > new Date() || date.getDay() === 0 || date.getDay() === 6}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Horas Realizadas</label>
                            <Input
                                type="number"
                                min={1}
                                max={6}
                                value={horas}
                                onChange={e => setHoras(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Mínimo 1h, Máximo 6h diárias.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Descrição das Atividades</label>
                            <Textarea
                                value={descricao}
                                onChange={e => setDescricao(e.target.value)}
                                placeholder="Descreva o que foi realizado..."
                                rows={4}
                            />
                        </div>

                        <Button onClick={handleSave} className="w-full" disabled={isPending || !date}>
                            {isPending ? "Salvando..." : "Registrar Atividade"}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* List Section */}
            <div className="md:col-span-7 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <span>Diário de Bordo</span>
                                {canSubmit && (
                                    <ConfirmActivitiesDialog
                                        contratoId={contratoId}
                                        totalHoras={totalHoras}
                                        etapaId={etapaId}
                                    />
                                )}
                            </div>
                            <span className="text-sm font-normal bg-secondary/10 text-secondary px-3 py-1 rounded-full">
                                Total Acumulado: {totalHoras}h
                            </span>
                        </CardTitle>
                        <CardDescription>Histórico de atividades lançadas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {initialEntries.length === 0 && (
                                <div className="text-center py-10 text-muted-foreground">
                                    Nenhuma atividade registrada.
                                </div>
                            )}
                            {initialEntries.map((entry) => (
                                <div key={entry.id} className="flex gap-4 p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                                    <div className="flex flex-col items-center justify-center min-w-[60px] border-r pr-4">
                                        <span className="text-sm font-semibold text-muted-foreground uppercase">
                                            {format(new Date(entry.dataAtividade), "MMM", { locale: ptBR })}
                                        </span>
                                        <span className="text-2xl font-bold">
                                            {format(new Date(entry.dataAtividade), "dd")}
                                        </span>
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="flex items-center text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {entry.horasRealizadas}h
                                            </div>
                                        </div>
                                        <p className="text-sm text-foreground/90 leading-relaxed">
                                            {entry.descricaoAtividades}
                                        </p>
                                    </div>
                                    <div>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)} disabled={isPending}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
