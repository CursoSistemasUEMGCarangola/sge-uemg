import fs from "fs"
import path from "path"
import { redirect } from "next/navigation"
import { getCurrentUserRole } from "@/lib/auth"
import { ManualViewer } from "@/components/manual-viewer"

export default async function AdminManualPage() {
    const role = await getCurrentUserRole()
    if (!role || (role !== 'PROFESSOR' && role !== 'ADMIN')) {
        redirect("/login")
    }

    // Read manuals from root
    let estagiarioMd = ""
    let orientadorMd = ""

    try {
        const estagiarioPath = path.join(process.cwd(), "manual_estagiario.md")
        const orientadorPath = path.join(process.cwd(), "manual_orientador.md")
        
        estagiarioMd = fs.readFileSync(estagiarioPath, "utf8")
        orientadorMd = fs.readFileSync(orientadorPath, "utf8")
    } catch (error) {
        console.error("Erro ao ler arquivos de manual:", error)
        return (
            <div className="p-8 text-center text-red-500 font-bold">
                Falha ao carregar manuais. Por favor, verifique se os arquivos manual_estagiario.md e manual_orientador.md existem no servidor.
            </div>
        )
    }

    return (
        <ManualViewer
            estagiarioMd={estagiarioMd}
            orientadorMd={orientadorMd}
            defaultTab="orientador"
        />
    )
}
