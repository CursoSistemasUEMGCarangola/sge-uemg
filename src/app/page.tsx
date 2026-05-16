import Link from "next/link"
import Image from "next/image"
import { createClient, getCurrentUserRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { UserRoundCheck, GraduationCap, ArrowRight } from "lucide-react"

export default async function LandingPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const role = await getCurrentUserRole()

    // Verifica o modo de vedação eleitoral
    const modoEleitoralConfig = await prisma.systemConfig.findUnique({
        where: { key: 'MODO_ELEITORAL' }
    })
    const E = modoEleitoralConfig?.value === 'true' // shorthand: E = modo Eleitoral ativo

    // Paleta condicional: cores institucionais vs. escala de cinza
    const cls = {
        // Cabeçalho
        heading:        E ? 'text-gray-900'                                         : 'text-primary',
        subtext:        E ? 'text-gray-500'                                         : 'text-muted-foreground',
        // Card do Professor
        profIconBg:     E ? 'bg-gray-200'                                           : 'bg-primary/10',
        profIcon:       E ? 'text-gray-600'                                         : 'text-primary',
        profBtn:        E ? 'bg-gray-800 hover:bg-gray-700 text-white'              : 'bg-primary hover:bg-primary/90 text-primary-foreground',
        // Card do Estudante
        studIconBg:     E ? 'bg-gray-200'                                           : 'bg-secondary/10',
        studIcon:       E ? 'text-gray-600'                                         : 'text-secondary',
        studBtn:        E ? 'bg-gray-600 hover:bg-gray-500 text-white'              : 'bg-secondary hover:bg-secondary/90 text-white',
        // Card geral
        cardTitle:      E ? 'text-gray-900'                                         : 'text-foreground',
        cardText:       E ? 'text-gray-500'                                         : 'text-muted-foreground',
        // Footer
        footerText:     E ? 'text-gray-500'                                         : 'text-muted-foreground',
        footerLink:     E ? 'text-gray-400 hover:text-gray-700'                    : 'text-muted-foreground hover:text-primary',
    }

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans transition-colors duration-300">
            {/* Header */}
            <header className="pt-6 pb-4 flex flex-col md:flex-row items-center justify-center gap-6 max-w-5xl mx-auto px-6">
                {/* Logo: exibida apenas fora do modo eleitoral */}
                {!E && (
                    <div className="shrink-0 w-32 h-32 md:w-40 md:h-40 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-secondary overflow-hidden">
                        <Image
                            alt="UEMG Carangola"
                            src="/uemg.jpg"
                            width={160}
                            height={160}
                            className="object-cover w-full h-full"
                            priority
                        />
                    </div>
                )}
                <div className="text-center md:text-left">
                    <h1 className={`text-3xl md:text-5xl font-bold ${cls.heading}`}>
                        Portal de Estágios
                    </h1>
                    <p className={`mt-4 max-w-lg text-lg leading-relaxed ${cls.subtext}`}>
                        {E
                            ? "Gestão de estágios do curso de Sistemas de Informação."
                            : "Gestão de estágios do curso de Sistemas de Informação da UEMG - Unidade Carangola."
                        }
                    </p>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-5xl mx-auto px-6 py-4 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-center">
                    {/* Professores Card - Hide if ALUNO */}
                    {role !== 'ALUNO' && (
                        <div className="group bg-card p-6 rounded-2xl shadow-sm border border-border hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${cls.profIconBg}`}>
                                <UserRoundCheck className={`h-8 w-8 ${cls.profIcon}`} />
                            </div>
                            <h2 className={`text-xl font-bold mb-2 ${cls.cardTitle}`}>Professores</h2>
                            <p className={`mb-6 leading-relaxed text-sm ${cls.cardText}`}>
                                Acesse para orientar estágios, avaliar relatórios e acompanhar o desempenho dos seus estudantes.
                            </p>
                            <Button asChild className={`w-full py-4 text-base font-semibold gap-2 group-hover:shadow-md transition-all ${cls.profBtn}`}>
                                <Link href={user ? "/admin" : "/login"}>
                                    {user ? "Ir para o Painel" : "Acessar como Professor"}
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                        </div>
                    )}

                    {/* Estudantes Card - Hide if PROFESSOR or ADMIN */}
                    {role !== 'PROFESSOR' && role !== 'ADMIN' && (
                        <div className="group bg-card p-6 rounded-2xl shadow-sm border border-border hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${cls.studIconBg}`}>
                                <GraduationCap className={`h-8 w-8 ${cls.studIcon}`} />
                            </div>
                            <h2 className={`text-xl font-bold mb-2 ${cls.cardTitle}`}>Estudantes</h2>
                            <p className={`mb-6 leading-relaxed text-sm ${cls.cardText}`}>
                                Acesse seus documentos, preencha os relatórios e acompanhe o status do seu estágio.
                            </p>
                            <Button asChild className={`w-full py-4 text-base font-semibold gap-2 group-hover:shadow-md transition-all ${cls.studBtn}`}>
                                <Link href={user ? "/aluno" : "/login"}>
                                    {user ? "Ir para o Painel" : "Acessar como Estudante"}
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-6 py-6 border-t border-border">
                <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className={`text-sm ${cls.footerText}`}>
                        {E
                            ? "© 2026 Todos os direitos reservados."
                            : "© 2026 UEMG Carangola. Todos os direitos reservados."
                        }
                    </p>
                    <div className="flex gap-6">
                        <Link href="#" className={`transition-colors text-sm font-medium ${cls.footerLink}`}>
                            Sobre
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
