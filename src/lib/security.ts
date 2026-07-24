import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/auth"

// ─────────────────────────────────────────────────────────────────────────────
// SEG-01: Helper de segurança — verifica que o usuário autenticado é dono do contrato.
// Retorna { error: string } se falhar, ou null se OK.
// Todas as Server Actions de aluno que operam sobre um contratoId devem chamar isto.
// ─────────────────────────────────────────────────────────────────────────────
export async function assertAlunoOwnsContract(contratoId: number): Promise<{ error: string } | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Não autenticado." }

    const aluno = await prisma.aluno.findUnique({
        where: { profileId: user.id },
        select: { id: true }
    })
    if (!aluno) return { error: "Perfil de aluno não encontrado." }

    const contrato = await prisma.contratoEstagio.findUnique({
        where: { id: contratoId },
        select: { idAluno: true }
    })
    if (!contrato) return { error: "Contrato não encontrado." }
    if (contrato.idAluno !== aluno.id) return { error: "Acesso negado: este contrato não pertence ao seu perfil." }

    return null // OK
}
