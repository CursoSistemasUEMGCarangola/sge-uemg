import { NextRequest, NextResponse } from "next/server"
import { renderToStream } from "@react-pdf/renderer"
import { getContratoById } from "@/features/estagio/data"
import { RelatorioAvaliacaoTemplate } from "@/components/documents/relatorio-avaliacao"
import { createClient } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    // SEG-02: Verificar autenticação antes de gerar documentos com dados pessoais
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
    }

    const id = parseInt(params.id)
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })

    const contrato = await getContratoById(id)
    if (!contrato) return NextResponse.json({ error: "Not found" }, { status: 404 })

    // Verificar que o usuário é dono do contrato OU é PROFESSOR/ADMIN
    const profile = await prisma.profile.findUnique({
        where: { id: user.id },
        select: { role: true }
    })
    const isOwner = contrato.aluno.profileId === user.id
    const isStaff = profile?.role === 'PROFESSOR' || profile?.role === 'ADMIN'
    if (!isOwner && !isStaff) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 })
    }

    // Check if textoRelatorioAvaliacao exists.
    if (!contrato.textoRelatorioAvaliacao) {
        return NextResponse.json({ error: "Relatório não preenchido" }, { status: 400 })
    }

    try {
        const stream = await renderToStream(
            <RelatorioAvaliacaoTemplate
                alunoNome={contrato.aluno.profile.nomeCompleto}
                alunoMatricula={contrato.aluno.matricula}
                cursoNome={contrato.oferta.curso.nome}
                empresaNome={contrato.campo.razaoSocial}
                supervisorNome={contrato.campo.supervisorNome}
                textoRelatorio={contrato.textoRelatorioAvaliacao}
                dataInicio={contrato.dataInicioPrevista}
            />
        )

        return new NextResponse(stream as unknown as BodyInit, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="relatorio_avaliacao_${id}.pdf"`
            }
        })
    } catch (error) {
        console.error("PDF Generation Error:", error)
        return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
    }
}
