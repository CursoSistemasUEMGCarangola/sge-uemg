import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/auth"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BadgeCheck } from "lucide-react"
import { ProfileForm } from "@/app/perfil/profile-form"
import { PasswordChangeForm } from "@/app/perfil/password-change-form"

export default async function AlunoPerfilPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Fetch Profile AND Student Data
    const profile = await prisma.profile.findUnique({
        where: { id: user.id },
        include: {
            aluno: true // Include relation to get matricula/periodo
        }
    })

    if (!profile) return <div>Perfil não encontrado.</div>

    // Prepare data for the form (merge student fields into profile object for simplicity in prop passing)
    const profileData = {
        ...profile,
        matricula: profile.aluno?.matricula,
        periodo: profile.aluno?.periodoAtual
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Minha Conta</h1>
                <p className="text-muted-foreground">Gerencie suas informações pessoais e de segurança.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BadgeCheck className="h-5 w-5 text-primary" />
                        Informações Básicas
                    </CardTitle>
                    <CardDescription>
                        Mantenha esses dados atualizados para facilitar o contato da coordenação e empresas.
                    </CardDescription>
                </CardHeader>
                <ProfileForm profile={profileData} />
            </Card>

            <PasswordChangeForm />
        </div>
    )
}
