"use client"

import { useState, useTransition } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon, Trash2 } from "lucide-react"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { addFeriado, removeFeriado } from "@/features/admin/actions" // Assuming mapping is set or relative
import { useToast } from "@/hooks/use-toast"
import { TipoFeriado } from "@prisma/client"

// Note: We need to pass data from Server Component to this Client Component ideally, 
// OR fetch it here if we transform this to handle both.
// For simplicity, let's make the Page a Server Component and this a Client Component for the form?
// Actually, let's make the whole page structure here but it needs data.

// Let's stick to the pattern: Page (Server) -> Client Component (Form + List)
export function CalendarManager({ initialData }: { initialData: any[] }) {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [descricao, setDescricao] = useState("")
    const [tipo, setTipo] = useState<TipoFeriado>("FERIADO")
    const [isPending, startTransition] = useTransition()
    const { toast } = useToast()

    async function handleAdd() {
        if (!date || !descricao) return

        startTransition(async () => {
            const res = await addFeriado(date, descricao, tipo)
            if (res.error) {
                toast({ title: "Erro", description: res.error, variant: "destructive" })
            } else {
                toast({ title: "Sucesso", description: "Data adicionada." })
                setDescricao("")
            }
        })
    }

    async function handleRemove(id: number) {
        startTransition(async () => {
            await removeFeriado(id)
            toast({ title: "Removido", description: "Data removida do calendário." })
        })
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Adicionar Data</CardTitle>
                    <CardDescription>Selecione dias que não contam para estágio.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border mx-auto"
                    />
                    <Input
                        placeholder="Descrição (ex: Natal)"
                        value={descricao}
                        onChange={e => setDescricao(e.target.value)}
                    />
                    <Select value={tipo} onValueChange={(v) => setTipo(v as TipoFeriado)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="FERIADO">Feriado</SelectItem>
                            <SelectItem value="RECESSO">Recesso</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handleAdd} className="w-full" disabled={!date || !descricao || isPending}>
                        {isPending ? "Salvando..." : "Adicionar ao Calendário"}
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Dias Cadastrados</CardTitle>
                    <CardDescription>Lista de feriados e recessos.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {initialData.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                                <div>
                                    <div className="font-medium flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4 text-primary" />
                                        {format(new Date(item.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{item.descricao} ({item.tipo})</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleRemove(item.id)} disabled={isPending}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        ))}
                        {initialData.length === 0 && <p className="text-muted-foreground text-center py-8">Nenhum dia cadastrado.</p>}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
