import Link from "next/link"
import { UserRoundCheck, GraduationCap, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CadastroSelectionPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8 md:p-12 relative">

                <div className="absolute left-6 top-6">
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                        <Link href="/">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Bem-vindo ao SGE</h1>
                    <p className="text-lg text-gray-600">Selecione o seu tipo de perfil para continuar o cadastro</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Card Professor */}
                    <Link href="/auth/cadastro/professor" className="group">
                        <div className="h-full border-2 border-gray-100 rounded-xl p-8 hover:border-[#305B7D] hover:bg-blue-50/30 transition-all duration-300 flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <UserRoundCheck className="w-12 h-12 text-[#305B7D]" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#305B7D]">Sou Professor</h2>
                            <p className="text-gray-500">
                                Cadastro destinado a docentes para orientação e acompanhamento de estágios.
                            </p>
                        </div>
                    </Link>

                    {/* Card Aluno */}
                    <Link href="/auth/cadastro/aluno" className="group">
                        <div className="h-full border-2 border-gray-100 rounded-xl p-8 hover:border-[#E31837] hover:bg-red-50/30 transition-all duration-300 flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <GraduationCap className="w-12 h-12 text-[#E31837]" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#E31837]">Sou Estudante</h2>
                            <p className="text-gray-500">
                                Cadastro destinado a alunos do curso de Sistemas de Informação para gestão de estágios.
                            </p>
                        </div>
                    </Link>
                </div>

                <div className="mt-12 text-center text-sm text-gray-500">
                    <p>Já possui uma conta? <Link href="/login" className="text-[#305B7D] font-semibold hover:underline">Faça Login</Link></p>
                </div>
            </div>
        </div>
    )
}
