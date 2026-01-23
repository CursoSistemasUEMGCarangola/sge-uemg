import { AdminProfessorForm } from "@/features/admin/components/admin-professor-form"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

interface EditProfessorPageProps {
    params: {
        id: string
    }
}

export default async function EditProfessorPage({ params }: EditProfessorPageProps) {
    const [professor, unidades, cursos] = await Promise.all([
        prisma.professor.findUnique({
            where: { id: parseInt(params.id) },
            include: {
                profile: true
            }
        }),
        prisma.unidadeAcademica.findMany({
            orderBy: { nome: 'asc' }
        }),
        prisma.curso.findMany({
            orderBy: { nome: 'asc' }
        })
    ])

    if (!professor) {
        notFound()
    }

    const initialData = {
        id: professor.profile.id,
        fullName: professor.profile.nomeCompleto,
        masp: professor.masp,
        email: professor.profile.email,
        telefone: professor.profile.telefone || "",
        cursoId: professor.cursoId || 0
    }

    return (
        <div className="container mx-auto py-6">
            <AdminProfessorForm
                initialData={initialData}
                unidades={unidades}
                cursos={cursos}
            />
        </div>
    )
}
