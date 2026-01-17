import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import { createClient } from "@/lib/auth"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BadgeCheck } from "lucide-react"
import { ProfileForm } from "./profile-form"

const prisma = new PrismaClient()

export default async function PerfilPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const profile = await prisma.profile.findUnique({
        where: { id: user.id }
    })

    if (!profile) return <div>Perfil não encontrado.</div>

    return (
        <div className="container max-w-2xl mx-auto py-10 space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Minha Conta</h1>
                <p className="text-muted-foreground">Gerencie suas informações pessoais.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BadgeCheck className="h-5 w-5 text-primary" />
                        Informações Básicas
                    </CardTitle>
                    <CardDescription>
                        Essas informações são utilizadas nos documentos de estágio.
                    </CardDescription>
                </CardHeader>
                <ProfileForm profile={profile} />
            </Card>
        </div>
    )
}
