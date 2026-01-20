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

                {/* 
                <ProfessorRegisterForm />
                */}

                <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">Cadastro Restrito</h3>
                            <div className="mt-2 text-sm text-yellow-700">
                                <p>
                                    Por questões de segurança, o cadastro de professores deve ser realizado exclusivamente pelo administrador do sistema.
                                    Entre em contato com a Coordenação do Curso para solicitar seu acesso.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
