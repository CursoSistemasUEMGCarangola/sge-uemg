import { AdminOfferForm } from "@/features/admin/components/admin-offer-form"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

interface EditOfferPageProps {
    params: {
        id: string
    }
}

export default async function EditOfferPage({ params }: EditOfferPageProps) {
    const id = Number(params.id)

    if (isNaN(id)) {
        notFound()
    }

    const offer = await prisma.ofertaEstagio.findUnique({
        where: { id }
    })

    if (!offer) {
        notFound()
    }

    const internships = await prisma.cursoEstagio.findMany({
        orderBy: { nome: 'asc' }
    })

    const professors = await prisma.professor.findMany({
        include: { profile: true },
        orderBy: { profile: { nomeCompleto: 'asc' } }
    })

    const formattedProfessors = professors.map(p => ({
        id: p.id,
        info: `${p.profile.nomeCompleto} (MASP: ${p.masp})`
    }))

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Editar Orientação de Estágio</h1>
                <p className="text-muted-foreground">
                    Altere os dados da orientação de estágio.
                </p>
            </div>

            <AdminOfferForm
                internships={internships}
                professors={formattedProfessors}
                initialData={offer}
            />
        </div>
    )
}
