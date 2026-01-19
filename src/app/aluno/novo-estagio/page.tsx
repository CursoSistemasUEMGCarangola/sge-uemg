import { getInformacoesGerais } from "@/features/estagio/data"
import { NovoEstagioForm } from "./form"
import { createClient } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function NovoEstagioPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const aluno = await prisma.aluno.findUnique({
        where: { profileId: user.id }
    })

    if (!aluno) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-red-600">Perfil de Aluno não encontrado</h1>
                <p className="text-muted-foreground mt-2">
                    Por favor, entre em contato com a secretaria para regularizar seu cadastro.
                </p>
            </div>
        )
    }

    // const ofertas = await getOfertasAtivas(aluno.periodoAtual)
    const informacoesGerais = await getInformacoesGerais()

    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Iniciar Novo Estágio</h1>
                <p className="text-muted-foreground">
                    Ofertas disponíveis para o {aluno.periodoAtual}º período.
                </p>
            </div>

            <NovoEstagioForm informacoesGerais={informacoesGerais} />
        </div>
    )
}
