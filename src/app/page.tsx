import Link from "next/link"
import Image from "next/image"
import { createClient, getCurrentUserRole } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { UserRoundCheck, GraduationCap, ArrowRight, Sun, Moon } from "lucide-react"

export default async function LandingPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const role = await getCurrentUserRole()

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans transition-colors duration-300">
            {/* Header */}
            <header className="pt-6 pb-4 flex flex-col md:flex-row items-center justify-center gap-6 max-w-5xl mx-auto px-6">
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
                <div className="text-center md:text-left">
                    <h1 className="text-3xl md:text-5xl font-bold text-primary">
                        Portal de Estágios
                    </h1>
                    <p className="text-muted-foreground mt-4 max-w-lg text-lg leading-relaxed">
                        Gestão de estágios do curso de Sistemas de Informação da UEMG - Unidade Carangola.
                    </p>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-5xl mx-auto px-6 py-4 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-center">
                    {/* Professores Card - Hide if ALUNO */}
                    {role !== 'ALUNO' && (
                        <div className="group bg-card p-6 rounded-2xl shadow-sm border border-border hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <UserRoundCheck className="text-primary h-8 w-8" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground mb-2">Professores</h2>
                            <p className="text-muted-foreground mb-6 leading-relaxed text-sm">
                                Acesse para orientar estágios, avaliar relatórios e acompanhar o desempenho dos seus estudantes.
                            </p>
                            <Link href={user ? "/admin" : "/login"} className="w-full">
                                <Button className="w-full py-4 text-base font-semibold bg-primary hover:bg-primary/90 gap-2 group-hover:shadow-md transition-all">
                                    {user ? "Ir para o Painel" : "Acessar como Professor"}
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                    )}

                    {/* Estudantes Card - Hide if PROFESSOR or ADMIN */}
                    {role !== 'PROFESSOR' && role !== 'ADMIN' && (
                        <div className="group bg-card p-6 rounded-2xl shadow-sm border border-border hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <GraduationCap className="text-secondary h-8 w-8" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground mb-2">Estudantes</h2>
                            <p className="text-muted-foreground mb-6 leading-relaxed text-sm">
                                Acesse seus documentos, preencha os relatórios e acompanhe o status do seu estágio.
                            </p>
                            <Link href={user ? "/aluno" : "/login"} className="w-full">
                                <Button className="w-full py-4 text-base font-semibold bg-secondary hover:bg-secondary/90 text-white gap-2 group-hover:shadow-md transition-all">
                                    {user ? "Ir para o Painel" : "Acessar como Estudante"}
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-6 py-6 border-t border-border">
                <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        © 2026 UEMG Carangola. Todos os direitos reservados.
                    </p>
                    <div className="flex gap-6">
                        <Link href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                            Sobre
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
