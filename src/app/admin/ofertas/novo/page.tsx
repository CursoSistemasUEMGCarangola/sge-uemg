import { AdminOfferForm } from "@/features/admin/components/admin-offer-form"
import { prisma } from "@/lib/prisma"

export default async function NewOfferPage() {
    const internships = await prisma.cursoEstagio.findMany({
        orderBy: { nome: 'asc' },
        include: { curso: true }
    })

    const professors = await prisma.professor.findMany({
        include: {
            profile: true,
            curso: true
        },
        orderBy: { profile: { nomeCompleto: 'asc' } }
    })

    const formattedProfessors = professors.map(p => ({
        id: p.id,
        info: `${p.profile.nomeCompleto} (MASP: ${p.masp})`,
        cursoIds: p.curso ? [p.curso.id] : []
    }))

    const formattedInternships = internships.map(i => ({
        id: i.id,
        nome: i.nome,
        cursoId: i.cursoId
    }))

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Orientação de Estágio</h1>
                <p className="text-muted-foreground">
                    Vincule um estágio a um professor orientador.
                </p>
            </div>

            <AdminOfferForm
                internships={formattedInternships}
                professors={formattedProfessors}
            />
        </div>
    )
}
