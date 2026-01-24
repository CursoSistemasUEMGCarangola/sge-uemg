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
    header: {
        marginBottom: 20,
        textAlign: 'right',
        color: '#666',
        fontSize: 10
    },
    // Same styles as Capa for consistency
    row: {
        flexDirection: 'row',
        borderBottom: '1px solid #000',
        minHeight: 25,
        alignItems: 'stretch'
    },
    labelCell: {
        width: '30%',
        padding: 4,
        fontWeight: 'bold',
        borderRight: '1px solid #000',
        backgroundColor: '#F3F4F6'
    },
    valueCell: {
        width: '70%',
        padding: 4
    },
    signatureSection: {
        marginTop: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 20
    },
    signatureBlock: {
        width: '30%',
        alignItems: 'center',
        marginTop: 20
    },
    signatureLine: {
        borderTop: '1px solid #000',
        width: '100%',
        marginBottom: 5
    }
})

interface Activity {
    dataAtividade: string | Date
    horasRealizadas: number
    descricaoAtividades: string
}

interface PlanoAtividadesTemplateProps {
    curso: string
    unidade: string
    periodo: string
    semestre: string
    nomeEstagio: string
    alunoNome: string
    alunoMatricula: string
    campoEstagio: string // Razao Social
    cargaHorariaTotal: number
    supervisorNome: string
    orientadorNome: string
    dataInicio: Date
    atividades: Activity[]
}

const fixDate = (dateStr: string | Date) => {
    const d = new Date(dateStr)
    return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}

export function PlanoAtividadesTemplate({
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
    atividades
}: PlanoAtividadesTemplateProps) {
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
                        <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>PLANO DE ATIVIDADES DE ESTÁGIO</Text>
                    </View>

                    {/* New Info Row: Course/Period/Semester - Internship Name */}
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

                    {/* Campo de Estagio (Razao Social) */}
                    <View style={styles.row}>
                        <View style={{ width: '30%', padding: 4, borderRight: '1px solid #000', backgroundColor: '#F3F4F6', justifyContent: 'center' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 10 }}>CAMPO DE ESTÁGIO:</Text>
                        </View>
                        <View style={{ width: '70%', padding: 4, justifyContent: 'center' }}>
                            <Text style={{ fontSize: 10 }}>{campoEstagio.toUpperCase()}</Text>
                        </View>
                    </View>

                    {/* Dates and Total Hours */}
                    <View style={[styles.row, { borderBottom: 'none' }]}>
                        <View style={{ width: '30%', padding: 4, borderRight: '1px solid #000', backgroundColor: '#F3F4F6', justifyContent: 'center' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 10 }}>DATA INÍCIO:</Text>
                        </View>
                        <View style={{ width: '20%', padding: 4, borderRight: '1px solid #000', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 10 }}>{format(dataInicio, 'dd/MM/yyyy')}</Text>
                        </View>
                        <View style={{ width: '30%', padding: 4, borderRight: '1px solid #000', backgroundColor: '#F3F4F6', justifyContent: 'center' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 10 }}>CARGA HORÁRIA TOTAL:</Text>
                        </View>
                        <View style={{ width: '20%', padding: 4, justifyContent: 'center' }}>
                            <Text style={{ fontSize: 10 }}>{cargaHorariaTotal} horas</Text>
                        </View>
                    </View>
                </View>

                {/* Activities Table */}
                <View style={{ border: '1px solid #000', borderBottom: 'none' }}>
                    {/* Header Row - Fixed to repeat for the table itself if breaks? */}
                    {/* React-PDF tables usually repeat headers if inside a specific Table component or if marked fixed. 
                        Since we build it with Views, we can mark this header row fixed too, but loop logic handles rows.
                        The previous section is fixed, so it repeats. 
                        If we mark this header fixed, it might overlap unless positioned correctly.
                        Since the user asked for the "5 first lines" (Identification) to repeat, we handled that.
                        Usually table headers also repeat. Let's make this header fixed as well to ensure it's visible. */}
                    <View style={{ flexDirection: 'row', backgroundColor: '#E5E7EB', borderBottom: '1px solid #000' }} fixed>
                        <View style={{ width: '15%', padding: 4, borderRight: '1px solid #000', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 10 }}>DATA</Text>
                        </View>
                        <View style={{ width: '10%', padding: 4, borderRight: '1px solid #000', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 10 }}>CH.D</Text>
                        </View>
                        <View style={{ width: '75%', padding: 4, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 10 }}>ATIVIDADES DESENVOLVIDAS</Text>
                        </View>
                    </View>

                    {/* Rows */}
                    {atividades.map((a, i) => (
                        <View key={i} style={{ flexDirection: 'row', borderBottom: '1px solid #000', minHeight: 25 }} wrap={false}>
                            <View style={{ width: '15%', padding: 4, borderRight: '1px solid #000', alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 10 }}>{format(fixDate(a.dataAtividade), 'dd/MM/yyyy')}</Text>
                            </View>
                            <View style={{ width: '10%', padding: 4, borderRight: '1px solid #000', alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 10 }}>{a.horasRealizadas}h</Text>
                            </View>
                            <View style={{ width: '75%', padding: 4, justifyContent: 'center' }}>
                                <Text style={{ fontSize: 10 }}>{a.descricaoAtividades}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Footer Signatures - Wrapped to prevent breaking */}
                <View style={{ marginTop: 20 }} wrap={false}>
                    <Text style={{ textAlign: 'center', marginBottom: 40 }}>
                        {unidade.toUpperCase()} - MG, {format(dataInicio, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </Text>

                    <View style={styles.signatureSection}>
                        <View style={styles.signatureBlock}>
                            <View style={styles.signatureLine} />
                            <Text style={{ fontSize: 8, textAlign: 'center' }}>{alunoNome}</Text>
                            <Text style={{ fontSize: 8, textAlign: 'center' }}>Estagiário(a)</Text>
                        </View>
                        <View style={styles.signatureBlock}>
                            <View style={styles.signatureLine} />
                            <Text style={{ fontSize: 8, textAlign: 'center' }}>{supervisorNome}</Text>
                            <Text style={{ fontSize: 8, textAlign: 'center' }}>Supervisor(a) de Campo</Text>
                            <Text style={{ fontSize: 6, textAlign: 'center' }}>Carimbo e assinatura</Text>
                        </View>
                        <View style={styles.signatureBlock}>
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
