import Link from "next/link"
import { Home, FileText, PlusCircle, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/features/auth/actions/logout-action"

import { createClient } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export default async function AlunoLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let userName = "Aluno"
    if (user) {
        const profile = await prisma.profile.findUnique({
            where: { id: user.id }
        })
        if (profile) userName = profile.nomeCompleto
    }

    return (
        <div className="flex h-screen w-full flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full border-b bg-muted/40 md:w-64 md:border-r md:border-b-0 md:h-full">
                <div className="flex h-16 items-left border-b px-6 flex-col justify-left items-start">
                    <Link href="/aluno" className="flex items-left gap-2 font-semibold">
                        <span className="text-xl font-bold tracking-tight">SGE Aluno</span>
                    </Link>
                    <span className="text-xs text-muted-foreground font-medium truncate w-full" title={userName}>
                        {userName}
                    </span>
                </div>
                <nav className="flex flex-col gap-2 p-4">
                    <Link href="/aluno">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <Home className="h-4 w-4" />
                            Dashboard
                        </Button>
                    </Link>
                    <Link href="/aluno/novo-estagio">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <PlusCircle className="h-4 w-4" />
                            Novo Estágio
                        </Button>
                    </Link>
                    <Link href="/aluno/perfil">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <User className="h-4 w-4" />
                            Minha Conta
                        </Button>
                    </Link>
                    <Link href="/aluno/documentos">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <FileText className="h-4 w-4" />
                            Documentos
                        </Button>
                    </Link>
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
        </div>
    )
}
