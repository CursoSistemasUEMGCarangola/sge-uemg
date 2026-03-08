import { getContratoById, getInformacoesGerais } from "@/features/estagio/data"
import { notFound, redirect } from "next/navigation"
import { getCurrentUserRole, createClient } from "@/lib/auth"
import { CapaForm } from "../form"

export default async function CapaEditPage({ params }: { params: { id: string } }) {
    const id = parseInt(params.id)
    if (isNaN(id)) return notFound()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    const contrato = await getContratoById(id)
    if (!contrato) return notFound()

    // Security check: Ensure the contract belongs to the logged-in student
    // (We could also rely on row level security but checking logic here is safer for explicit feedback)
    if (contrato.aluno.profileId !== user.id) {
        return <div className="p-8 text-center text-red-500">Acesso negado.</div>
    }

    // Find the Generate Capa stage
    const etapaCapa = contrato.acompanhamentos.find(a =>
        a.etapaDef.systemAction === 'GENERATE_DOC_CAPA' || a.etapaDef.numeroEtapa === 1
    )

    if (etapaCapa) {
        // 1. Check if Completed
        if (etapaCapa.status === 'ATIVO') {
            // Redirect to dashboard if already completed
            redirect('/aluno')
        }

        // 2. Check if Locked (Previous stage must be active) - only if it's not the first stage
        const currentIndex = contrato.acompanhamentos.findIndex(a => a.id === etapaCapa.id)
        if (currentIndex > 0) {
            const prevStage = contrato.acompanhamentos[currentIndex - 1]
            if (prevStage.status !== 'ATIVO') {
                redirect('/aluno')
            }
        }
    }

    const informacoesGerais = await getInformacoesGerais()
    const canEdit = !etapaCapa || etapaCapa.status === 'PENDENTE' || etapaCapa.status === 'REJEITADO'

    return (
        <div className="container py-8">
            <CapaForm
                contrato={contrato}
                informacoesGerais={informacoesGerais}
                canEdit={canEdit}
            />
        </div>
    )
}
