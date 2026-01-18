import { AdminStudentForm } from "@/features/admin/components/admin-student-form"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

interface EditAlunoPageProps {
    params: {
        id: string
    }
}

export default async function EditAlunoPage({ params }: EditAlunoPageProps) {
    const aluno = await prisma.aluno.findUnique({
        where: { id: parseInt(params.id) },
        include: {
            profile: true
        }
    })

    if (!aluno) {
        notFound()
    }

    const initialData = {
        id: aluno.profile.id,
        fullName: aluno.profile.nomeCompleto,
        matricula: aluno.matricula,
        email: aluno.profile.email,
        telefone: aluno.profile.telefone || "",
        periodo: aluno.periodoAtual.toString()
    }

    return (
        <div className="container mx-auto py-6">
            <AdminStudentForm initialData={initialData} />
        </div>
    )
}
