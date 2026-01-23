import { NextRequest, NextResponse } from "next/server"
import { renderToStream } from "@react-pdf/renderer"
import { CapaEstagioTemplate } from "@/components/documents/capa-estagio"
import { getContratoById } from "@/features/estagio/data"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const id = parseInt(params.id)
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })

    const contrato = await getContratoById(id)
    if (!contrato) return NextResponse.json({ error: "Not found" }, { status: 404 })

    // Optionally check if user is allowed (Author or Admin)
    // For simplicity rely on secure context if needed, but this is a public route once authenticated ideally.

    try {
        const stream = await renderToStream(
            <CapaEstagioTemplate
                curso={contrato.oferta.curso.curso?.nome || "CURSO NÃO DEFINIDO"}
                unidade={contrato.oferta.curso.curso?.unidade?.nome || "CARANGOLA"}
                estagioNome={contrato.oferta.curso.nome} // This is the Internship Name (e.g. Estágio I)
                periodo={contrato.aluno.periodoAtual.toString()}
                semestre={contrato.oferta.semestreLetivo}
                alunoNome={contrato.aluno.profile.nomeCompleto}
                alunoMatricula={contrato.aluno.matricula}
                modalidade={contrato.modalidade}
                campoEstagio={contrato.campo.nomeFantasia} // or razaoSocial
                tipoDocumentacao={contrato.tipoDocumentacao}
                dataInicio={contrato.dataInicioPrevista}
                cargaHoraria={contrato.cargaHorariaDiaria}
                atribuicoes={contrato.atribuicoes}
                supervisorNome={contrato.campo.supervisorNome}
                supervisorCargo={contrato.campo.supervisorCargo}
                supervisorFormacao={contrato.campo.supervisorAreaFormacao}
                supervisorTitulacao={contrato.campo.supervisorTitulacao}
                orientadorNome={contrato.oferta.professor.profile.nomeCompleto}
            />
        )

        return new NextResponse(stream as unknown as BodyInit, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="capa_estagio_${id}.pdf"`
            }
        })
    } catch (error) {
        console.error("PDF Generation Error:", error)
        return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
    }
}
