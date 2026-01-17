import { getContratoById, getDiarioAtividades } from "@/features/estagio/data"
import { DiarioClient } from "./client-page"
import { redirect } from "next/navigation"
import { getCurrentUserRole } from "@/lib/auth"

export default async function DiarioPage({ params }: { params: { id: string } }) {
    const role = await getCurrentUserRole()
    if (role !== 'ALUNO') redirect('/')

    const id = parseInt(params.id)
    if (isNaN(id)) redirect('/aluno')

    const contrato = await getContratoById(id)
    if (!contrato) redirect('/aluno')

    const entries = await getDiarioAtividades(id)

    return (
        <div className="container py-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Diário de Atividades</h1>
                <p className="text-muted-foreground">
                    Estágio em {contrato.campo.nomeFantasia} | {contrato.oferta.curso.nome}
                </p>
            </div>

            <DiarioClient contratoId={id} initialEntries={entries} />
        </div>
    )
}
