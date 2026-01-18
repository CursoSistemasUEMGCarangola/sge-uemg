import { AdminInternshipForm } from "@/features/admin/components/admin-internship-form"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

interface EditEstagioPageProps {
    params: {
        id: string
    }
}

export default async function EditEstagioPage({ params }: EditEstagioPageProps) {
    const id = parseInt(params.id)
    if (isNaN(id)) notFound()

    const estagio = await prisma.cursoEstagio.findUnique({
        where: { id }
    })

    if (!estagio) notFound()

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Editar Tipo de Estágio</h1>
                <p className="text-muted-foreground">
                    Atualize as informações do tipo de estágio.
                </p>
            </div>

            <AdminInternshipForm initialData={estagio} />
        </div>
    )
}
