import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { School, User, ArrowRight, Sun, Moon } from "lucide-react"

export default async function LandingPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans transition-colors duration-300">
            {/* Header */}
            <header className="pt-12 pb-8 flex flex-col items-center">
                <div className="w-32 h-32 md:w-40 md:h-40 mb-6 bg-white rounded-full shadow-lg p-4 flex items-center justify-center border-2 border-secondary">
                    <Image
                        alt="UEMG Carangola Logo"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDT_kjnH4OPttlCgSpVBJPM5_Ym10gyp4FYao0zosAI3C1ZriXUCM5kXQ685-iywTPlryfJ-PzoWZPWDi5TlG9qatuntPkk-j70vhzDX2g3WJWVv9bZ4M1vtZpFZNqtTVRe02PmBYwqozPwq3M7onJufmp2JBS4FMx8gPXY0E7YWmnIk-i8z0iOJQWIphKYfGadT6ULEFt5FGAT7OO9xciRdkWc5lid10wV80GpMKa_nQYx5cFAW1lp4pLseJiPebjfZLEeRe90Apk"
                        width={160}
                        height={160}
                        className="object-contain"
                        priority
                    />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-primary text-center">
                    Portal de Estágios
                </h1>
                <p className="text-muted-foreground mt-2 text-center max-w-md px-4">
                    Gestão simplificada de estágios para a comunidade acadêmica da UEMG Unidade Carangola.
                </p>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-5xl mx-auto px-6 py-8 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Professores Card */}
                    <div className="group bg-card p-8 rounded-2xl shadow-sm border border-border hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <School className="text-primary h-10 w-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-4">Professores</h2>
                        <p className="text-muted-foreground mb-8 leading-relaxed">
                            Acesse para orientar estágios, avaliar relatórios e acompanhar o desempenho dos seus estudantes.
                        </p>
                        <Link href={user ? "/admin" : "/login"} className="w-full">
                            <Button className="w-full py-6 text-lg font-semibold bg-primary hover:bg-primary/90 gap-2 group-hover:shadow-md transition-all">
                                {user ? "Ir para o Painel" : "Acessar como Professor"}
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>

                    {/* Estudantes Card */}
                    <div className="group bg-card p-8 rounded-2xl shadow-sm border border-border hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <User className="text-secondary h-10 w-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-4">Estudantes</h2>
                        <p className="text-muted-foreground mb-8 leading-relaxed">
                            Gerencie seus termos de compromisso, envie relatórios e acompanhe o status do seu estágio.
                        </p>
                        <Link href={user ? "/aluno" : "/login"} className="w-full">
                            <Button className="w-full py-6 text-lg font-semibold bg-secondary hover:bg-secondary/90 text-white gap-2 group-hover:shadow-md transition-all">
                                {user ? "Ir para o Painel" : "Acessar como Estudante"}
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-12 py-8 border-t border-border">
                <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        © 2024 UEMG Carangola. Todos os direitos reservados.
                    </p>
                    <div className="flex gap-6">
                        <Link href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                            Suporte
                        </Link>
                        <Link href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                            Documentação
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
