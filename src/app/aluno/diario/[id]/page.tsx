import { getContratoById, getDiarioAtividades } from "@/features/estagio/data"
import { DiarioClient } from "./client-page"
import { redirect } from "next/navigation"
import { getCurrentUserRole } from "@/lib/auth"
import { getFeriados } from "@/features/estagio/data"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default async function DiarioPage({ params }: { params: { id: string } }) {
    const role = await getCurrentUserRole()
    if (role !== 'ALUNO') redirect('/')

    const id = parseInt(params.id)
    if (isNaN(id)) redirect('/aluno')

    const contrato = await getContratoById(id)
    if (!contrato) redirect('/aluno')

    const entries = await getDiarioAtividades(id)

    // Logica para encontrar a etapa de Relatório de Atividades (assumindo ID 4 ou numeroEtapa 4)
    // Na prática, deve-se buscar pela Definição. Vamos assumir que numeroEtapa 4 = Relatório Parcial/Final de Atividades
    // Also try to find by name "Plano" since user mentioned "Plano de Atividades"
    const etapaRelatorio = contrato.acompanhamentos.find(a =>
        a.etapaDef.numeroEtapa === 4 ||
        a.etapaDef.descricao.toLowerCase().includes("plano") ||
        a.etapaDef.descricao.toLowerCase().includes("atividades")
    )
    const etapaId = etapaRelatorio ? etapaRelatorio.etapaDef.id : 0
    const canSubmit = etapaRelatorio?.status === 'PENDENTE' || etapaRelatorio?.status === 'REJEITADO'

    // Validation 1: Max Hours
    const maxHours = contrato.cargaHorariaDiaria

    // Validation 2: Holidays
    const feriados = await getFeriados()

    // Validation 3: Min Date (Stage Release Date)
    // Rule: The first possible date must be >= stage release date.
    let minDate: Date | undefined = undefined

    // Helper to fix timezone offset (use UTC date parts to build local date)
    const toLocalDate = (date: Date | null) => {
        if (!date) return new Date()
        // Create date at local midnight using UTC components to avoid timezone shift (e.g. 2023-10-25T00:00Z -> 2023-10-24T21:00-03:00)
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    }

    if (etapaRelatorio) {
        const currentIndex = contrato.acompanhamentos.findIndex(a => a.id === etapaRelatorio.id)
        if (currentIndex > 0) {
            const prevStage = contrato.acompanhamentos[currentIndex - 1]
            // If prev stage finished, use its conclusion date.
            minDate = prevStage.dataConclusao
                ? toLocalDate(new Date(prevStage.dataConclusao))
                : toLocalDate(new Date(contrato.dataInicioPrevista))
        } else {
            minDate = toLocalDate(new Date(contrato.dataInicioPrevista))
        }
    }

    // Validation 4: Max Date (Offer End Date)
    const maxDate = contrato.oferta.dataFim ? toLocalDate(new Date(contrato.oferta.dataFim)) : undefined

    // Validation 5: Total Required Hours
    const totalRequired = contrato.oferta.curso.cargaHorariaTotal

    // Deadline for the current stage (Presentation of Plan/Activities)
    // Logic matched from src/app/aluno/page.tsx
    let dataLimite: Date | undefined = undefined

    if (etapaRelatorio) {
        if (etapaRelatorio.dataLimite) {
            dataLimite = toLocalDate(new Date(etapaRelatorio.dataLimite))
        } else if (etapaRelatorio.updatedAt && etapaRelatorio.etapaDef.prazoDias > 0) {
            const updated = new Date(etapaRelatorio.updatedAt)
            updated.setDate(updated.getDate() + etapaRelatorio.etapaDef.prazoDias)
            dataLimite = toLocalDate(updated)
        }
    }

    return (
        <div className="container py-8 space-y-6">
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight">Plano de Atividades do Estágio</h1>
                    {dataLimite && (
                        <Badge variant="destructive" className="text-xl px-3 py-1 bg-red-600 hover:bg-red-700">
                            Prazo de entrega: {format(dataLimite, "dd/MM/yyyy", { locale: ptBR })}
                        </Badge>
                    )}
                </div>
                <p className="text-muted-foreground">
                    Estágio em {contrato.campo.nomeFantasia} | {contrato.oferta.curso.nome}
                </p>
            </div>

            <DiarioClient
                contratoId={id}
                initialEntries={entries}
                etapaId={etapaId}
                canSubmit={canSubmit}
                minDate={minDate}
                maxDate={maxDate}
                maxHours={maxHours}
                totalRequired={totalRequired}
                dataLimite={dataLimite}
                feriados={feriados}
            />
        </div>
    )
}

