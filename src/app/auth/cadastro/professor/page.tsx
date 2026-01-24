import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"

export default function ProfessorRegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md text-center space-y-6">
                <div className="flex justify-center">
                    <div className="p-3 bg-yellow-100 rounded-full">
                        <AlertTriangle className="h-8 w-8 text-yellow-600" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900">
                    Acesso Restrito
                </h2>

                <p className="text-gray-600">
                    CADASTRO DE PROFESSORES ORIENTADORES.
                </p>

                <p className="text-sm text-muted-foreground bg-muted p-4 rounded border">
                    Para solicitar acesso, entre em contato com a administração do sistema ou solicite o cadastro manual do seu perfil de orientador.
                </p>

                <div className="pt-4">
                    <Link href="/">
                        <Button className="w-full">
                            Voltar para o Início
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
