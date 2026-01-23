import { UnidadeForm } from "@/features/admin/components/unidade-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NovaUnidadePage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Nova Unidade Acadêmica</h1>
                <p className="text-muted-foreground">Cadastre um novo campus ou unidade.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Dados da Unidade</CardTitle>
                    <CardDescription>Preencha o nome corretamente.</CardDescription>
                </CardHeader>
                <CardContent>
                    <UnidadeForm />
                </CardContent>
            </Card>
        </div>
    )
}
