import { AdminProfessorForm } from "@/features/admin/components/admin-professor-form"
import { prisma } from "@/lib/prisma"

export default async function NovoProfessorPage() {
    const unidades = await prisma.unidadeAcademica.findMany({
        orderBy: { nome: 'asc' }
    })

    const cursos = await prisma.curso.findMany({
        orderBy: { nome: 'asc' }
    })

    return (
        <div className="container mx-auto py-6">
            <AdminProfessorForm
                unidades={unidades}
                cursos={cursos}
            />
        </div>
    )
}
