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

    const informacoesGerais = await getInformacoesGerais()

    return (
        <div className="container py-8">
            <CapaForm
                contrato={contrato}
                informacoesGerais={informacoesGerais}
            />
        </div>
    )
}
