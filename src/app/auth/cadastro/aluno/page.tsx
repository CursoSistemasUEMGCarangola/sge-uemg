import { StudentRegisterForm } from "@/features/auth/components/student-register-form"
import { prisma } from "@/lib/prisma"

export default async function StudentRegisterPage() {
    const unidades = await prisma.unidadeAcademica.findMany({
        orderBy: { nome: 'asc' }
    })

    const cursos = await prisma.curso.findMany({
        orderBy: { nome: 'asc' },
        include: { unidade: true }
    })

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-2xl space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        SGE - UEMG
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Cadastro de Estudante
                    </p>
                </div>
                <StudentRegisterForm unidades={unidades} cursos={cursos} />
            </div>
        </div>
    )
}
