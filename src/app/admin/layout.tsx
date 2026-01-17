import Link from "next/link"
import { LayoutDashboard, Users, FileText, Settings, LogOut, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCurrentUserRole } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const role = await getCurrentUserRole()

    // Protect Admin Route: Allow only PROFESSOR or ADMIN
    if (!role || (role !== 'PROFESSOR' && role !== 'ADMIN')) {
        redirect('/')
    }

    return (
        <div className="flex h-screen w-full flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full border-b bg-muted/40 md:w-64 md:border-r md:border-b-0 md:h-full">
                <div className="flex h-16 items-center border-b px-6">
                    <Link href="/admin" className="flex items-center gap-2 font-semibold">
                        <span className="text-xl font-bold tracking-tight">SGE Admin</span>
                    </Link>
                </div>
                <nav className="flex flex-col gap-2 p-4">
                    <Link href="/admin">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <LayoutDashboard className="h-4 w-4" />
                            Painel
                        </Button>
                    </Link>
                    <Link href="/admin/estagios">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <FileText className="h-4 w-4" />
                            Estágios
                        </Button>
                    </Link>
                    <Link href="/admin/calendario">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <Calendar className="h-4 w-4" />
                            Calendário
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

                    <Link href="/perfil">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            {/* @ts-ignore - User icon import */}
                            <Users className="h-4 w-4" />
                            Minha Conta
                        </Button>
                    </Link>

                    <div className="mt-auto border-t pt-4">
                        <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground">
                            <LogOut className="h-4 w-4" />
                            Sair
                        </Button>
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
