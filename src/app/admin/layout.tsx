import Link from "next/link"
import { LayoutDashboard, Users, FileText, Settings, LogOut, Calendar, UserRoundCheck, Briefcase, ListOrdered } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCurrentUserRole, createClient } from "@/lib/auth"
import { redirect } from "next/navigation"
import { logoutAction } from "@/features/auth/actions/logout-action"
import { prisma } from "@/lib/prisma"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const role = await getCurrentUserRole()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let userName = "Usuário"
    if (user) {
        const profile = await prisma.profile.findUnique({
            where: { id: user.id }
        })
        if (profile) userName = profile.nomeCompleto.split(' ')[0] // Primeiro nome para economizar espaço
    }

    // Protect Admin Route: Allow only PROFESSOR or ADMIN
    if (!role || (role !== 'PROFESSOR' && role !== 'ADMIN')) {
        redirect('/')
    }

    return (
        <div className="flex h-screen w-full flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full border-b bg-muted/40 md:w-64 md:border-r md:border-b-0 md:h-full">
                <div className="flex h-16 items-center border-b px-6 flex-col justify-center items-start">
                    <Link href="/admin" className="flex items-center gap-2 font-semibold">
                        <span className="text-xl font-bold tracking-tight">SGE Admin</span>
                    </Link>
                    <span className="text-xs text-muted-foreground font-medium">{userName}</span>
                </div>
                <nav className="flex flex-col gap-2 p-4">
                    <Link href="/admin">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <LayoutDashboard className="h-4 w-4" />
                            Painel
                        </Button>
                    </Link>

                    <Link href="/admin/perfil">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            {/* @ts-ignore - User icon import */}
                            <Users className="h-4 w-4" />
                            Meus Dados
                        </Button>
                    </Link>

                    {role === 'ADMIN' && (
                        <>
                            <Link href="/admin/unidades">
                                <Button variant="ghost" className="w-full justify-start gap-2">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Unidades
                                </Button>
                            </Link>

                            <Link href="/admin/cursos">
                                <Button variant="ghost" className="w-full justify-start gap-2">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    Cursos
                                </Button>
                            </Link>

                            <Link href="/admin/professores">
                                <Button variant="ghost" className="w-full justify-start gap-2">
                                    <UserRoundCheck className="h-4 w-4" />
                                    Professores
                                </Button>
                            </Link>

                            <Link href="/admin/alunos">
                                <Button variant="ghost" className="w-full justify-start gap-2">
                                    <Users className="h-4 w-4" />
                                    Alunos
                                </Button>
                            </Link>

                            <Link href="/admin/configuracoes">
                                <Button variant="ghost" className="w-full justify-start gap-2">
                                    <Settings className="h-4 w-4" />
                                    Configurações
                                </Button>
                            </Link>

                            <Link href="/admin/etapas">
                                <Button variant="ghost" className="w-full justify-start gap-2">
                                    {/* @ts-ignore */}
                                    <ListOrdered className="h-4 w-4" />
                                    Etapas do Estágio
                                </Button>
                            </Link>
                        </>
                    )}


                    <Link href="/admin/calendario">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <Calendar className="h-4 w-4" />
                            Calendário
                        </Button>
                    </Link>

                    {/* Shared: Documentos */}
                    <Link href="/admin/documentos">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <FileText className="h-4 w-4" />
                            Documentos
                        </Button>
                    </Link>

                    {/* Admin Only */}
                    {role === 'ADMIN' && (
                        <>
                            <Link href="/admin/estagios">
                                <Button variant="ghost" className="w-full justify-start gap-2">
                                    <FileText className="h-4 w-4" />
                                    Estágios
                                </Button>
                            </Link>

                            <Link href="/admin/ofertas">
                                <Button variant="ghost" className="w-full justify-start gap-2">
                                    <Briefcase className="h-4 w-4" />
                                    Atribuir Orientação
                                </Button>
                            </Link>
                        </>
                    )}

                    <div className="mt-auto border-t pt-4">
                        <form action={logoutAction}>
                            <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-red-500 hover:bg-red-50">
                                <LogOut className="h-4 w-4" />
                                Sair
                            </Button>
                        </form>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-background p-4 md:p-8">
                {children}
            </main>
        </div >
    )
}
