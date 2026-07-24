import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/auth"
import { renderToStream } from "@react-pdf/renderer"
import React from "react"
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

import crypto from 'crypto'

const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: "Helvetica", paddingBottom: 60 },
    title: { fontSize: 20, marginBottom: 10, textAlign: "center", fontWeight: "bold" },
    subtitle: { fontSize: 14, marginBottom: 20, textAlign: "center", color: "#666" },
    infoSection: { marginBottom: 20, padding: 10, backgroundColor: "#f4f4f4", borderRadius: 4 },
    infoText: { fontSize: 12, marginBottom: 4 },
    sectionTitle: { fontSize: 14, fontWeight: "bold", marginTop: 20, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: "#ccc", paddingBottom: 5 },
    stepBox: { marginBottom: 15, padding: 10, borderWidth: 1, borderColor: "#ddd", borderRadius: 4 },
    stepHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
    stepTitle: { fontSize: 12, fontWeight: "bold" },
    stepStatus: { fontSize: 10, color: "#666" },
    stepDates: { fontSize: 10, color: "#888", marginBottom: 5 },
    stepFeedback: { fontSize: 11, fontStyle: "italic", color: "#444", marginTop: 5, padding: 5, backgroundColor: "#f9f9f9" },
    footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, color: '#999', textAlign: 'center', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 }
})

const translateStatus = (status: string, contractStatus: string) => {
    if (status === 'ATIVO') return 'CONCLUÍDO';
    if (contractStatus === 'ENCERRADO') return 'NÃO CONCLUÍDO';
    switch (status) {
        case 'PENDENTE': return 'PENDENTE';
        case 'EM_ANALISE': return 'EM ANÁLISE';
        case 'REJEITADO': return 'CORREÇÃO NECESSÁRIA';
        default: return status;
    }
}

const generateAutenticidadeCode = (contratoId: number, alunoId: string, dataConclusao: string | Date | null) => {
    const secret = process.env.SUPABASE_JWT_SECRET || process.env.NEXTAUTH_SECRET || 'sge-uemg-secret';
    const dataStr = dataConclusao ? new Date(dataConclusao).toISOString() : 'pendente';
    const raw = `${contratoId}-${alunoId}-${dataStr}-${secret}`;
    const hash = crypto.createHash('sha256').update(raw).digest('hex').substring(0, 16).toUpperCase();
    return `${contratoId}-${hash}`;
}

const StudentPdfDocument = ({ contrato }: { contrato: any }) => {
    const hash = generateAutenticidadeCode(contrato.id, contrato.aluno.profileId, contrato.dataConclusaoEstagio);
    
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.title}>Relatório Detalhado de Conclusão de Estágio</Text>
                <Text style={styles.subtitle}>Sistema de Gestão de Estágios - UEMG</Text>

                <View style={styles.infoSection}>
                    <Text style={styles.infoText}>Aluno(a): {contrato.aluno.profile.nomeCompleto}</Text>
                    <Text style={styles.infoText}>Matrícula: {contrato.aluno.matricula}</Text>
                    <Text style={styles.infoText}>Curso: {contrato.oferta.curso.nome}</Text>
                    <Text style={styles.infoText}>Campo de Estágio: {contrato.campo.nomeFantasia}</Text>
                    <Text style={styles.infoText}>Professor Orientador: {contrato.oferta.professor.profile.nomeCompleto}</Text>
                    <Text style={styles.infoText}>Status Final: {contrato.statusAprovacao === 'ENCERRADO' ? 'ENCERRADO' : contrato.statusAprovacao === 'ATIVO' ? 'CONCLUÍDO' : contrato.statusAprovacao}</Text>
                    {contrato.dataConclusaoEstagio && (
                        <Text style={styles.infoText}>Concluído em: {new Date(contrato.dataConclusaoEstagio).toLocaleDateString('pt-BR')}</Text>
                    )}
                </View>

                <Text style={styles.sectionTitle}>Histórico de Etapas</Text>
                {contrato.acompanhamentos.map((acomp: any, idx: number) => (
                    <View style={styles.stepBox} key={idx}>
                        <View style={styles.stepHeader}>
                            <Text style={styles.stepTitle}>Etapa {acomp.etapaDef.numeroEtapa} - {acomp.etapaDef.descricao}</Text>
                            <Text style={styles.stepStatus}>Status: {translateStatus(acomp.status, contrato.statusAprovacao)}</Text>
                        </View>
                        <Text style={styles.stepDates}>
                            Data Limite: {acomp.dataLimite ? new Date(acomp.dataLimite).toLocaleDateString('pt-BR') : 'N/A'} | 
                            Conclusão: {acomp.dataConclusao ? new Date(acomp.dataConclusao).toLocaleDateString('pt-BR') : 'Pendente'}
                        </Text>
                        {acomp.observacoes && (
                            <View style={styles.stepFeedback}>
                                <Text>Observações/Feedback:</Text>
                                <Text>{acomp.observacoes}</Text>
                            </View>
                        )}
                    </View>
                ))}

                <View style={styles.footer} fixed>
                    <Text>Código de Autenticidade (SGE-UEMG)</Text>
                    <Text style={{ fontWeight: 'bold', marginTop: 3 }}>{hash}</Text>
                    <Text style={{ marginTop: 2 }}>Verificação exclusiva pela administração/coordenação do sistema.</Text>
                </View>
            </Page>
        </Document>
    );
}

export async function GET(request: NextRequest, { params }: { params: { idContrato: string } }) {
    const idContrato = Number(params.idContrato)
    if (isNaN(idContrato)) {
        return NextResponse.json({ error: "ID Inválido" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
    }

    const contrato = await prisma.contratoEstagio.findUnique({
        where: { id: idContrato },
        include: {
            aluno: { include: { profile: true } },
            oferta: { 
                include: { 
                    curso: true,
                    professor: { include: { profile: true } }
                } 
            },
            campo: true,
            acompanhamentos: {
                include: { etapaDef: true },
                orderBy: { etapaDef: { numeroEtapa: 'asc' } }
            }
        }
    })

    if (!contrato) {
        return NextResponse.json({ error: "Contrato não encontrado." }, { status: 404 })
    }

    // Verificar se o usuário é o aluno dono ou Admin/Professor
    const userRole = user.user_metadata?.role || 'ALUNO'
    if (userRole === 'ALUNO' && contrato.aluno.profileId !== user.id) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 })
    }

    try {
        const stream = await renderToStream(
            <StudentPdfDocument contrato={contrato} />
        )

        return new NextResponse(stream as any, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="relatorio-aluno-${idContrato}.pdf"`
            }
        })
    } catch (e) {
        console.error(e)
        return NextResponse.json({ error: "Erro ao gerar PDF" }, { status: 500 })
    }
}
