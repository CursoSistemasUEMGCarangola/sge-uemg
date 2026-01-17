import { getFeriados } from "@/features/admin/actions"
import { CalendarManager } from "./client-page"

export default async function AdminCalendarioPage() {
    const feriados = await getFeriados()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Calendário Acadêmico</h1>
                <p className="text-muted-foreground">Gerencie feriados e recessos que impactam a contagem de dias de estágio.</p>
            </div>

            <CalendarManager initialData={feriados} />
        </div>
    )
}
