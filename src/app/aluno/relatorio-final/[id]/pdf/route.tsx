
import { NextRequest, NextResponse } from "next/server"
import { renderToStream } from "@react-pdf/renderer"
import { RelatorioFinalTemplate } from "@/components/documents/relatorio-final"
import { getContratoById, getDiarioAtividades } from "@/features/estagio/data"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const id = parseInt(params.id)
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })

    const contrato = await getContratoById(id)
    if (!contrato) return NextResponse.json({ error: "Not found" }, { status: 404 })

    // Fetch activities to determine end date
    const atividades = await getDiarioAtividades(id)

    // Find the last activity date
    let dataFim = contrato.dataConclusaoEstagio
    if (atividades.length > 0) {
        // Sort by date desc
        const sorted = [...atividades].sort((a, b) => new Date(b.dataAtividade).getTime() - new Date(a.dataAtividade).getTime())
        dataFim = new Date(sorted[0].dataAtividade)
    }

    // Determines release date (Data da Etapa de liberação)
    const dataLiberacao = contrato.dataInicioPrevista

    try {
        const stream = await renderToStream(
            <RelatorioFinalTemplate
                curso={contrato.oferta.curso.curso?.nome || "CURSO NÃO DEFINIDO"}
                unidade={contrato.oferta.curso.curso?.unidade?.nome || "CARANGOLA"} // Default unit if missing
                periodo={contrato.aluno.periodoAtual.toString()}
                semestre={contrato.oferta.semestreLetivo}
                nomeEstagio={contrato.oferta.curso.nome}
                alunoNome={contrato.aluno.profile.nomeCompleto}
                alunoMatricula={contrato.aluno.matricula}
                campoEstagio={contrato.campo.razaoSocial}
                cargaHorariaTotal={contrato.oferta.curso.cargaHorariaTotal}
                supervisorNome={contrato.campo.supervisorNome}
                orientadorNome={contrato.oferta.professor.profile.nomeCompleto}
                dataInicio={dataLiberacao}
                dataFim={dataFim || new Date()}
                avaliacaoTexto={contrato.textoRelatorioAvaliacao || ""}
            />
        )

        return new NextResponse(stream as unknown as BodyInit, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="relatorio_final_${id}.pdf"`
            }
        })
    } catch (error) {
        console.error("PDF Generation Error:", error)
        return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
    }
}
