import { getOfertasAtivas } from "@/features/estagio/data"
import { NovoEstagioForm } from "./form"

export default async function NovoEstagioPage() {
    const ofertas = await getOfertasAtivas()

    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Iniciar Novo Estágio</h1>
                <p className="text-muted-foreground">Preencha os dados do seu estágio e da empresa concedente.</p>
            </div>

            <NovoEstagioForm ofertas={ofertas} />
        </div>
    )
}
