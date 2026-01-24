import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 30,
        fontSize: 12,
        fontFamily: 'Helvetica'
    },
    row: {
        flexDirection: 'row',
        borderBottom: '1px solid #000',
        minHeight: 25,
        alignItems: 'stretch'
    },
    signatureSection: {
        marginTop: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 20
    },
    signatureBlock: {
        width: '45%', // Wider for 2 signatures (Student and Supervisor)
        alignItems: 'center',
        marginTop: 20
    },
    signatureLine: {
        borderTop: '1px solid #000',
        width: '100%',
        marginBottom: 5
    }
})

interface RelatorioFinalTemplateProps {
    curso: string
    unidade: string
    periodo: string
    semestre: string
    nomeEstagio: string
    alunoNome: string
    alunoMatricula: string
    campoEstagio: string
    cargaHorariaTotal: number
    supervisorNome: string
    orientadorNome: string
    dataInicio: Date
    dataFim?: Date
    avaliacaoTexto: string
}

export function RelatorioFinalTemplate({
    curso,
    unidade,
    periodo,
    semestre,
    nomeEstagio,
    alunoNome,
    alunoMatricula,
    campoEstagio,
    cargaHorariaTotal,
    supervisorNome,
    orientadorNome,
    dataInicio,
    dataFim,
    avaliacaoTexto
}: RelatorioFinalTemplateProps) {
    const dataFimStr = dataFim ? format(dataFim, 'dd/MM/yyyy') : '__/__/____'

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header Logo - Fixed to repeat on all pages */}
                <View style={{ alignItems: 'flex-end', marginBottom: 10 }} fixed>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1a365d' }}>UNIVERSIDADE DO ESTADO DE MINAS GERAIS</Text>
                    <Text style={{ fontSize: 10, color: '#666', marginTop: 4 }}>UNIDADE {unidade.toUpperCase()}</Text>
                </View>

                {/* Main Table - Identification Data - Fixed to repeat */}
                <View style={{ border: '1px solid #000', marginBottom: 20 }} fixed>
                    {/* Title */}
                    <View style={{ backgroundColor: '#E5E7EB', padding: 8, borderBottom: '1px solid #000', justifyContent: 'center' }}>
                        <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>RELATÓRIO FINAL DE AVALIAÇÃO DO ESTÁGIO</Text>
                    </View>

                    {/* Course/Period/Semester - Internship Name */}
                    <View style={[styles.row, { justifyContent: 'space-between', backgroundColor: '#F9FAFB' }]}>
                        <View style={{ padding: 4, justifyContent: 'center' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 10 }}>{curso.toUpperCase()} - {periodo}º PERÍODO - {semestre}</Text>
                        </View>
                        <View style={{ padding: 4, justifyContent: 'center' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 10 }}>{nomeEstagio.toUpperCase()}</Text>
                        </View>
                    </View>

                    {/* Student Info */}
                    <View style={styles.row}>
                        <View style={{ width: '15%', padding: 4, borderRight: '1px solid #000', backgroundColor: '#F3F4F6', justifyContent: 'center' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 10 }}>DISCENTE:</Text>
                        </View>
                        <View style={{ width: '20%', padding: 4, borderRight: '1px solid #000', justifyContent: 'center' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 10 }}>{alunoMatricula}</Text>
                        </View>
                        <View style={{ width: '65%', padding: 4, justifyContent: 'center' }}>
                            <Text style={{ fontSize: 10 }}>{alunoNome.toUpperCase()}</Text>
                        </View>
                    </View>

                    {/* Campo de Estagio */}
                    <View style={styles.row}>
                        <View style={{ width: '30%', padding: 4, borderRight: '1px solid #000', backgroundColor: '#F3F4F6', justifyContent: 'center' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 10 }}>CAMPO DE ESTÁGIO:</Text>
                        </View>
                        <View style={{ width: '70%', padding: 4, justifyContent: 'center' }}>
                            <Text style={{ fontSize: 10 }}>{campoEstagio.toUpperCase()}</Text>
                        </View>
                    </View>

                    {/* Supervisor */}
                    <View style={styles.row}>
                        <View style={{ width: '30%', padding: 4, borderRight: '1px solid #000', backgroundColor: '#F3F4F6', justifyContent: 'center' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 10 }}>SUPERVISOR(A):</Text>
                        </View>
                        <View style={{ width: '70%', padding: 4, justifyContent: 'center' }}>
                            <Text style={{ fontSize: 10 }}>{supervisorNome.toUpperCase()}</Text>
                        </View>
                    </View>

                    {/* Dates and Total Hours */}
                    <View style={[styles.row, { borderBottom: 'none' }]}>
                        <View style={{ width: '30%', padding: 4, borderRight: '1px solid #000', backgroundColor: '#F3F4F6', justifyContent: 'center' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 10 }}>PERÍODO:</Text>
                        </View>
                        <View style={{ width: '40%', padding: 4, borderRight: '1px solid #000', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 10 }}>{format(dataInicio, 'dd/MM/yyyy')} a {dataFimStr}</Text>
                        </View>
                        <View style={{ width: '15%', padding: 4, borderRight: '1px solid #000', backgroundColor: '#F3F4F6', justifyContent: 'center' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 10 }}>Total de Horas:</Text>
                        </View>
                        <View style={{ width: '15%', padding: 4, justifyContent: 'center' }}>
                            <Text style={{ fontSize: 10 }}>{cargaHorariaTotal}h</Text>
                        </View>
                    </View>
                </View>

                {/* Evaluation Text Section */}
                <View style={{ marginBottom: 20 }}>
                    <View style={{ backgroundColor: '#E5E7EB', padding: 8, border: '1px solid #000', borderBottom: 'none', justifyContent: 'center' }}>
                        <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 10 }}>AVALIAÇÃO SOBRE CONFORMIDADE DAS ATIVIDADES DESENVOLVIDAS E RESULTADOS ALCANÇADOS</Text>
                    </View>
                    <View style={{ border: '1px solid #000', padding: 10, minHeight: 150 }}>
                        <Text style={{ fontSize: 10, lineHeight: 1.5, textAlign: 'justify' }}>
                            {avaliacaoTexto || "Nenhuma avaliação registrada."}
                        </Text>
                    </View>
                </View>

                {/* Termo de Encerramento */}
                <View style={{ marginBottom: 20 }}>
                    <View style={{ backgroundColor: '#E5E7EB', padding: 8, border: '1px solid #000', borderBottom: 'none', justifyContent: 'center' }}>
                        <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 11 }}>TERMO DE ENCERRAMENTO</Text>
                    </View>
                    <View style={{ border: '1px solid #000', padding: 10 }}>
                        <Text style={{ fontSize: 10, lineHeight: 1.5, textAlign: 'justify' }}>
                            Eu, {supervisorNome.toUpperCase()}, supervisor(a) de campo para o Estágio Obrigatório do(a) discente {alunoNome.toUpperCase()}, declaro, para os devidos fins, que todas as atribuições definidas para este estágio foram cumpridas, em conformidade com o PLANO DE ATIVIDADES apresentado, alcançando os resultados descritos neste documento, considerando então este {nomeEstagio.toUpperCase()} devidamente encerrado.
                        </Text>
                    </View>
                </View>


                {/* Footer Signatures */}
                <View style={{ marginTop: 20 }} wrap={false}>
                    <Text style={{ textAlign: 'center', marginBottom: 40 }}>
                        {unidade.toUpperCase()} - MG, {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </Text>

                    <View style={styles.signatureSection}>
                        <View style={{ width: '30%', alignItems: 'center', marginTop: 20 }}>
                            <View style={styles.signatureLine} />
                            <Text style={{ fontSize: 8, textAlign: 'center' }}>{alunoNome}</Text>
                            <Text style={{ fontSize: 8, textAlign: 'center' }}>Estagiário(a)</Text>
                        </View>
                        <View style={{ width: '30%', alignItems: 'center', marginTop: 20 }}>
                            <View style={styles.signatureLine} />
                            <Text style={{ fontSize: 8, textAlign: 'center' }}>{supervisorNome}</Text>
                            <Text style={{ fontSize: 8, textAlign: 'center' }}>Supervisor(a) de Campo</Text>
                            <Text style={{ fontSize: 6, textAlign: 'center' }}>Carimbo e assinatura</Text>
                        </View>
                        <View style={{ width: '30%', alignItems: 'center', marginTop: 20 }}>
                            <View style={styles.signatureLine} />
                            <Text style={{ fontSize: 8, textAlign: 'center' }}>{orientadorNome}</Text>
                            <Text style={{ fontSize: 8, textAlign: 'center' }}>Professor(a) Orientador(a)</Text>
                        </View>
                    </View>
                </View>

                {/* Page Numbers */}
                <Text
                    style={{ position: 'absolute', bottom: 30, left: 0, right: 0, textAlign: 'center', fontSize: 10, color: '#666' }}
                    render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
                    fixed
                />

            </Page>
        </Document>
    )
}
