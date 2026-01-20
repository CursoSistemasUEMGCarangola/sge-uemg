import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/auth"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BadgeCheck } from "lucide-react"
import { PasswordChangeForm } from "@/app/perfil/password-change-form"
import { ProfileForm } from "@/app/perfil/profile-form"
import { CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default async function AdminPerfilPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const profile = await prisma.profile.findUnique({
        where: { id: user.id }
    })

    const professor = await prisma.professor.findUnique({
        where: { profileId: user.id }
    })

    if (!profile) return <div>Perfil não encontrado.</div>

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Minha Conta</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BadgeCheck className="h-5 w-5 text-primary" />
                        Gerencie seu perfil
                    </CardTitle>

                </CardHeader>
                <CardContent className="space-y-4">
                    {professor && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Label htmlFor="masp">MASP (Não alterável)</Label>
                            </div>

                            <div className="relative">
                                <input
                                    id="masp"
                                    value={professor.masp}
                                    className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-9"
                                    disabled
                                />
                            </div>
                        </div>
                    )}
                    <ProfileForm profile={profile} />
                </CardContent>
            </Card>

            <PasswordChangeForm />
        </div>
    )
}
