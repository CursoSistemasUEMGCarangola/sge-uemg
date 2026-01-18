import { AdminProfessorForm } from "@/features/admin/components/admin-professor-form"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

interface EditProfessorPageProps {
    params: {
        id: string
    }
}

export default async function EditProfessorPage({ params }: EditProfessorPageProps) {
    const professor = await prisma.professor.findUnique({
        where: { id: parseInt(params.id) },
        include: {
            profile: true
        }
    })

    if (!professor) {
        notFound()
    }

    const initialData = {
        id: professor.profile.id,
        fullName: professor.profile.nomeCompleto,
        masp: professor.masp,
        email: professor.profile.email,
        telefone: professor.profile.telefone || "",
    }

    return (
        <div className="container mx-auto py-6">
            <AdminProfessorForm initialData={initialData} />
        </div>
    )
}
