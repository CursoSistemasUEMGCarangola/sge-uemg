import { NextRequest, NextResponse } from "next/server"
import { renderToStream } from "@react-pdf/renderer"
import { PlanoAtividadesTemplate } from "@/components/documents/plano-atividades"
import { getContratoById, getDiarioAtividades } from "@/features/estagio/data"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const id = parseInt(params.id)
    if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })

    const contrato = await getContratoById(id)
    if (!contrato) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const atividades = await getDiarioAtividades(id)

    // Determines release date (Data da Etapa de liberação)
    // Same logic as minIndex in page.tsx roughly
    // Assuming stage 4 is Report, stage 3 is Release? Or start date.
    // User said: "A data de início das atividades é a mesma data da etapa da liberação do acesso ao plano de atividades"
    // And also: "A data ... é a data da liberação do acesso ao plano de atividades."
    // Let's use `dataConclusao` of the stage BEFORE the "Plano" stage, or just `contrato.dataInicioPrevista` if none.

    // We already use `minDate` in Page.tsx for validation.
    // Let's replicate simple logic: Start Date of Contract for now, or refine if we can find the stage date.
    const dataLiberacao = contrato.dataInicioPrevista

    try {
        const stream = await renderToStream(
            <PlanoAtividadesTemplate
                curso={contrato.oferta.curso.curso?.nome || "CURSO NÃO DEFINIDO"}
                unidade={contrato.oferta.curso.curso?.unidade?.nome || "CARANGOLA"}
                periodo={contrato.aluno.periodoAtual.toString()}
                semestre={contrato.oferta.semestreLetivo}
                nomeEstagio={contrato.oferta.curso.nome} // "ESTÁGIO OBRIGATÓRIO X"
                alunoNome={contrato.aluno.profile.nomeCompleto}
                alunoMatricula={contrato.aluno.matricula}
                campoEstagio={contrato.campo.razaoSocial} // Use Razao Social as requested
                cargaHorariaTotal={contrato.oferta.curso.cargaHorariaTotal}
                supervisorNome={contrato.campo.supervisorNome}
                orientadorNome={contrato.oferta.professor.profile.nomeCompleto}
                dataInicio={dataLiberacao}
                atividades={atividades}
            />
        )

        return new NextResponse(stream as unknown as BodyInit, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="plano_atividades_${id}.pdf"`
            }
        })
    } catch (error) {
        console.error("PDF Generation Error:", error)
        return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
    }
}
