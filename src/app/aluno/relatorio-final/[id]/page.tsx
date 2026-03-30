
import { getContratoById, getDiarioAtividades } from "@/features/estagio/data"
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

    let canEdit = etapaRelatorio.status === 'PENDENTE' || etapaRelatorio.status === 'REJEITADO'

    // Helper to fix timezone offset (use UTC date parts to build local date)
    const toLocalDate = (date: Date | null) => {
        if (!date) return new Date()
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    }

    const diarias = await getDiarioAtividades(id);
    
    // Bloquear edição se a data atual (Brasil) não for maior que a data da última atividade
    if (canEdit && diarias.length > 0) {
        const lastActivityDate = new Date(Math.max(...diarias.map(d => new Date(d.dataAtividade).getTime())));
        const lastActLocal = toLocalDate(lastActivityDate);
        
        const nowBrazilStr = new Date().toLocaleString("en-US", {timeZone: "America/Sao_Paulo"});
        const nowBrazil = new Date(nowBrazilStr);
        const currentLocal = new Date(nowBrazil.getFullYear(), nowBrazil.getMonth(), nowBrazil.getDate());
        
        if (currentLocal <= lastActLocal) {
            canEdit = false;
        }
    }

    // Deadline for the current stage
    let dataLimite: Date | undefined = undefined

    if (etapaRelatorio && etapaRelatorio.etapaDef.prazoDias > 0) {
        let extraDays = 0;
        let baseDate: Date;

        if (diarias.length > 0) {
            baseDate = new Date(Math.max(...diarias.map(d => new Date(d.dataAtividade).getTime())));
            extraDays = 1; // "a partir do dia seguinte"
        } else {
            const currentIndex = contrato.acompanhamentos.findIndex(a => a.id === etapaRelatorio.id)
            if (currentIndex > 0) {
                const prevStage = contrato.acompanhamentos[currentIndex - 1]
                baseDate = prevStage.dataConclusao 
                    ? new Date(prevStage.dataConclusao) 
                    : new Date(contrato.dataInicioPrevista)
            } else {
                baseDate = new Date(contrato.dataInicioPrevista)
            }
        }

        const updated = toLocalDate(baseDate)
        updated.setDate(updated.getDate() + etapaRelatorio.etapaDef.prazoDias + extraDays)
        dataLimite = updated
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

            {contrato.atribuicoes && (
                <div className="rounded-md border p-4 bg-muted/10">
                    <h2 className="font-semibold text-foreground mb-2">Atribuições do Estágio</h2>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {contrato.atribuicoes}
                    </div>
                </div>
            )}

            {!canEdit && (etapaRelatorio.status === 'PENDENTE' || etapaRelatorio.status === 'REJEITADO') && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-800">
                    <p className="font-semibold flex items-center gap-2">
                        Preenchimento Bloqueado
                    </p>
                    <p className="text-sm mt-1">
                        O relatório final só poderá ser redigido a partir do dia seguinte ao último dia de atividade informado no plano.
                    </p>
                </div>
            )}

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
