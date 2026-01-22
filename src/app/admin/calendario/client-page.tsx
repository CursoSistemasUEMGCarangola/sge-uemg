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

    // Process data for calendar modifiers
    // We treat the incoming date string (UTC) as the source of truth for YYYY-MM-DD
    function getDateString(dateStr: string | Date) {
        if (dateStr instanceof Date) return format(dateStr, 'yyyy-MM-dd')
        return dateStr.toString().split('T')[0]
    }

    const feriadosSet = new Set(
        initialData
            .filter(i => i.tipo === 'FERIADO')
            .map(i => getDateString(i.data))
    )

    const recessosSet = new Set(
        initialData
            .filter(i => i.tipo === 'RECESSO')
            .map(i => getDateString(i.data))
    )

    const feriadoMatcher = (day: Date) => feriadosSet.has(format(day, 'yyyy-MM-dd'))
    const recessoMatcher = (day: Date) => recessosSet.has(format(day, 'yyyy-MM-dd'))

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
                    <div className="flex justify-center">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border shadow p-3"
                            modifiers={{
                                feriado: feriadoMatcher,
                                recesso: recessoMatcher
                            }}
                            modifiersClassNames={{
                                feriado: "bg-red-100 text-red-900 font-semibold hover:bg-red-200",
                                recesso: "bg-yellow-100 text-yellow-900 font-semibold hover:bg-yellow-200"
                            }}
                        />
                    </div>
                    <div className="flex gap-4 text-xs justify-center pt-2">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-red-100 border border-red-200 rounded-full"></div>
                            <span>Feriado</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded-full"></div>
                            <span>Recesso</span>
                        </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t">
                        <Input
                            placeholder="Descrição (ex: Natal)"
                            value={descricao}
                            onChange={e => setDescricao(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <Select value={tipo} onValueChange={(v) => setTipo(v as TipoFeriado)}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FERIADO">Feriado</SelectItem>
                                    <SelectItem value="RECESSO">Recesso</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={handleAdd} className="flex-1" disabled={!date || !descricao || isPending}>
                                {isPending ? "Salvando..." : "Adicionar"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Dias Cadastrados</CardTitle>
                    <CardDescription>Lista de feriados e recessos.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {initialData.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()).map((item) => (
                            <div key={item.id} className={`flex items-center justify-between p-3 border rounded-lg ${item.tipo === 'FERIADO' ? 'bg-red-50 border-red-100' : 'bg-yellow-50 border-yellow-100'
                                }`}>
                                <div>
                                    <div className="font-medium flex items-center gap-2">
                                        <CalendarIcon className={`h-4 w-4 ${item.tipo === 'FERIADO' ? 'text-red-500' : 'text-yellow-600'}`} />
                                        {/* Use UTC handling for display to match DB storage */}
                                        {new Date(item.data).toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: 'long', year: 'numeric' })}
                                    </div>
                                    <p className="text-sm text-foreground/80 font-medium">{item.descricao} <span className="text-xs font-normal opacity-70">({item.tipo})</span></p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleRemove(item.id)} disabled={isPending}
                                    className="hover:bg-white/50 text-muted-foreground hover:text-red-600">
                                    <Trash2 className="h-4 w-4" />
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
