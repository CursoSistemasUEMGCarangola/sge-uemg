import { ProfessorRegisterForm } from "@/features/auth/components/professor-register-form"

export default function ProfessorRegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-2xl space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        SGE - UEMG
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Cadastro de Professor
                    </p>
                </div>
                <ProfessorRegisterForm />
            </div>
        </div>
    )
}
