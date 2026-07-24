import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUserRole, createClient } from "@/lib/auth"
import { renderToStream } from "@react-pdf/renderer"
import React from "react"
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import crypto from 'crypto'

const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: "Helvetica" },
    title: { fontSize: 20, marginBottom: 10, textAlign: "center", fontWeight: "bold" },
    subtitle: { fontSize: 14, marginBottom: 20, textAlign: "center", color: "#666" },
    infoSection: { marginBottom: 20, padding: 10, backgroundColor: "#f4f4f4", borderRadius: 4 },
    infoText: { fontSize: 12, marginBottom: 4 },
    table: { display: "flex", width: "auto", borderStyle: "solid", borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0 },
    tableRow: { margin: "auto", flexDirection: "row" },
    tableColHeader: { borderStyle: "solid", borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: "#e4e4e4" },
    tableCol: { borderStyle: "solid", borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0 },
    colMatricula: { width: "15%" },
    colNome: { width: "45%" },
    colEtapa: { width: "20%" },
    colStatus: { width: "20%" },
    tableCellHeader: { margin: 5, fontSize: 10, fontWeight: 500 },
    tableCell: { margin: 5, fontSize: 10 },
    footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, color: '#999', textAlign: 'center', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 }
})

const translateStatus = (status: string) => {
    if (status === 'ATIVO') return 'CONCLUÍDO';
    if (status === 'PENDENTE' || status === 'EM_ANALISE' || status === 'REJEITADO' || status === 'ENCERRADO') return 'NÃO CONCLUÍDO';
    return status;
}

const generateAutenticidadeCode = (ofertaId: number, professorId: string, dataEncerramento: string | Date) => {
    const secret = process.env.SUPABASE_JWT_SECRET || process.env.NEXTAUTH_SECRET || 'sge-uemg-secret';
    const dataStr = new Date(dataEncerramento).toISOString();
    const raw = `TURMA-${ofertaId}-${professorId}-${dataStr}-${secret}`;
    const hash = crypto.createHash('sha256').update(raw).digest('hex').substring(0, 16).toUpperCase();
    return `TURMA-${ofertaId}-${hash}`;
}

const PdfDocument = ({ oferta, snapshot, hash }: { oferta: any, snapshot: any, hash: string }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <Text style={styles.title}>Relatório de Encerramento de Orientação</Text>
            <Text style={styles.subtitle}>Sistema de Gestão de Estágios - UEMG</Text>

            <View style={styles.infoSection}>
                <Text style={styles.infoText}>Professor(a): {oferta.professor.profile.nomeCompleto}</Text>
                <Text style={styles.infoText}>Curso / Estágio: {oferta.curso.nome}</Text>
                <Text style={styles.infoText}>Semestre Letivo: {snapshot.semestre}</Text>
                <Text style={styles.infoText}>Data do Encerramento: {new Date(snapshot.dataEncerramento).toLocaleString('pt-BR')}</Text>
            </View>

            <View style={styles.table}>
                <View style={styles.tableRow}>
                    <View style={[styles.tableColHeader, styles.colMatricula]}><Text style={styles.tableCellHeader}>Matrícula</Text></View>
                    <View style={[styles.tableColHeader, styles.colNome]}><Text style={styles.tableCellHeader}>Nome</Text></View>
                    <View style={[styles.tableColHeader, styles.colEtapa]}><Text style={styles.tableCellHeader}>Última Etapa</Text></View>
                    <View style={[styles.tableColHeader, styles.colStatus]}><Text style={styles.tableCellHeader}>Status Final</Text></View>
                </View>
                {snapshot.alunos.map((aluno: any, idx: number) => (
                    <View style={styles.tableRow} key={idx}>
                        <View style={[styles.tableCol, styles.colMatricula]}><Text style={styles.tableCell}>{aluno.matricula}</Text></View>
                        <View style={[styles.tableCol, styles.colNome]}><Text style={styles.tableCell}>{aluno.nomeAluno}</Text></View>
                        <View style={[styles.tableCol, styles.colEtapa]}><Text style={styles.tableCell}>{aluno.ultimaEtapa}</Text></View>
                        <View style={[styles.tableCol, styles.colStatus]}><Text style={styles.tableCell}>{translateStatus(aluno.statusFinal)}</Text></View>
                    </View>
                ))}
            </View>

            <View style={styles.footer} fixed>
                <Text>Código de Autenticidade (SGE-UEMG)</Text>
                <Text style={{ fontWeight: 'bold', marginTop: 3 }}>{hash}</Text>
                <Text style={{ marginTop: 2 }}>Verificação exclusiva pela administração/coordenação do sistema.</Text>
            </View>
        </Page>
    </Document>
)

export async function GET(request: NextRequest, { params }: { params: { idOferta: string } }) {
    const role = await getCurrentUserRole()
    if (role !== 'PROFESSOR' && role !== 'ADMIN') {
        return NextResponse.json({ error: "Sem permissão." }, { status: 403 })
    }

    const ofertaId = Number(params.idOferta)
    if (isNaN(ofertaId)) {
        return NextResponse.json({ error: "ID Inválido" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const oferta = await prisma.ofertaEstagio.findUnique({
        where: { id: ofertaId },
        include: {
            professor: { include: { profile: true } },
            curso: true,
            relatorio: true
        }
    })

    if (!oferta || !oferta.relatorio) {
        return NextResponse.json({ error: "Relatório não encontrado ou orientação ainda não encerrada." }, { status: 404 })
    }

    if (role === 'PROFESSOR' && oferta.professor.profileId !== user?.id) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 })
    }

    try {
        const hash = generateAutenticidadeCode(oferta.id, oferta.professor.profileId, oferta.relatorio.dataEncerramento);

        const stream = await renderToStream(
            <PdfDocument oferta={oferta} snapshot={oferta.relatorio.dadosSnapshot} hash={hash} />
        )

        return new NextResponse(stream as any, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="relatorio-encerramento-${ofertaId}.pdf"`
            }
        })
    } catch (e) {
        console.error(e)
        return NextResponse.json({ error: "Erro ao gerar PDF" }, { status: 500 })
    }
}
