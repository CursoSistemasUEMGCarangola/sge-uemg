
import { getContratoById } from "@/features/estagio/data"
import { redirect } from "next/navigation"
import { getCurrentUserRole } from "@/lib/auth"
import { RelatorioFinalClient } from "./client-page"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default async function RelatorioFinalPage({ params }: { params: { id: string } }) {
    const role = await getCurrentUserRole()
    if (role !== 'ALUNO') redirect('/')

    const id = parseInt(params.id)
    if (isNaN(id)) redirect('/aluno')

    const contrato = await getContratoById(id)
    if (!contrato) redirect('/aluno')

    // Find the Final Report stage (System Action: FILL_FINAL_REPORT)
    const etapaRelatorio = contrato.acompanhamentos.find(a =>
        a.etapaDef.systemAction === 'FILL_FINAL_REPORT' ||
        // Fallback checks just in case
        a.etapaDef.descricao.toUpperCase().includes('RELATÓRIO FINAL')
    )

    if (!etapaRelatorio) {
        return <div className="p-8">Etapa de Relatório Final não encontrada para este contrato.</div>
    }

    // Access Control Logic
    if (etapaRelatorio.status === 'ATIVO') {
        // Already completed
        redirect('/aluno')
    }

    // Check if the previous stage is active/completed (LOCKED state)
    // Find the index of the current stage
    const currentIndex = contrato.acompanhamentos.findIndex(a => a.id === etapaRelatorio.id)
    if (currentIndex > 0) {
        const prevStage = contrato.acompanhamentos[currentIndex - 1]
        // If previous stage is not ATIVO (completed), this stage is locked
        if (prevStage.status !== 'ATIVO') {
            redirect('/aluno')
        }
    }

    const canEdit = etapaRelatorio.status === 'PENDENTE' || etapaRelatorio.status === 'REJEITADO'

    // Helper to fix timezone offset (use UTC date parts to build local date)
    const toLocalDate = (date: Date | null) => {
        if (!date) return new Date()
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    }

    // Deadline for the current stage
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
                    <h1 className="text-3xl font-bold tracking-tight">Relatório Final de Avaliação</h1>
                    {dataLimite && (
                        <Badge variant="destructive" className="text-xl px-3 py-1 bg-red-600 hover:bg-red-700">
                            Prazo: {format(dataLimite, "dd/MM/yyyy", { locale: ptBR })}
                        </Badge>
                    )}
                </div>
                <p className="text-muted-foreground">
                    Estágio em {contrato.campo.nomeFantasia} | {contrato.oferta.curso.nome}
                </p>
            </div>

            <RelatorioFinalClient
                contratoId={id}
                etapaId={etapaRelatorio.etapaDef.id}
                initialText={contrato.textoRelatorioAvaliacao || ""}
                canEdit={canEdit}
                status={etapaRelatorio.status}
                observacoes={etapaRelatorio.observacoes}
            />
        </div>
    )
}
