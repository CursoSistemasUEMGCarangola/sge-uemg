import { AdminInternshipForm } from "@/features/admin/components/admin-internship-form"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface PageProps {
    params: {
        id: string
    }
}

export default async function EditEstagioPage({ params }: PageProps) {
    const id = parseInt(params.id)

    if (isNaN(id)) {
        notFound()
    }

    const estagio = await prisma.cursoEstagio.findUnique({
        where: { id }
    })

    if (!estagio) {
        notFound()
    }

    const cursos = await prisma.curso.findMany({
        orderBy: { nome: 'asc' },
        include: { unidade: true }
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/estagios">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Editar Tipo de Estágio</h1>
                    <p className="text-muted-foreground">
                        Edite as configurações do estágio.
                    </p>
                </div>
            </div>

            <AdminInternshipForm initialData={estagio} cursos={cursos} />
        </div>
    )
}
