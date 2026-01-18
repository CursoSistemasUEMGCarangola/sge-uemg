import { AdminInternshipForm } from "@/features/admin/components/admin-internship-form"

export default function NovoEstagioPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Novo Tipo de Estágio</h1>
                <p className="text-muted-foreground">
                    Cadastre um novo tipo de estágio para ser ofertado aos alunos.
                </p>
            </div>

            <AdminInternshipForm />
        </div>
    )
}
