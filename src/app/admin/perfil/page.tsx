import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/auth"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BadgeCheck } from "lucide-react"
import { ProfileForm } from "@/app/perfil/profile-form"

export default async function AdminPerfilPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const profile = await prisma.profile.findUnique({
        where: { id: user.id }
    })

    if (!profile) return <div>Perfil não encontrado.</div>

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Minha Conta</h1>
                <p className="text-muted-foreground">Gerencie suas informações pessoais.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BadgeCheck className="h-5 w-5 text-primary" />
                        Informações Básicas
                    </CardTitle>
                    <CardDescription>
                        Mantenha seus dados de contato atualizados.
                    </CardDescription>
                </CardHeader>
                <ProfileForm profile={profile} />
            </Card>
        </div>
    )
}
