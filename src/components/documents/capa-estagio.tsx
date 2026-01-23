import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer'
import { format } from 'date-fns'

// Register fonts if needed, or use standard
// Font.register({ family: 'Roboto', src: '...' })

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
    logoContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end', // Right align logo like header
        marginBottom: 10,
        height: 50
    },
    logo: {
        width: 150,
        height: 'auto',
        objectFit: 'contain'
    },
    titleBox: {
        border: '1px solid #000',
        backgroundColor: '#E0E0E0',
        padding: 5,
        textAlign: 'center',
        marginBottom: 0,
        fontWeight: 'bold',
        fontSize: 12
    },
    sectionTitle: {
        backgroundColor: '#E5E7EB', // Approx light gray
        padding: 4,
        fontWeight: 'bold',
        textAlign: 'center',
        borderBottom: '1px solid #000'
    },
    tableContainer: {
        border: '1px solid #000',
        borderTop: 'none', // Since title has border
        marginBottom: 20
    },
    row: {
        flexDirection: 'row',
        borderBottom: '1px solid #000',
        minHeight: 25,
        alignItems: 'stretch' // Ensure dynamic height matching
    },
    lastRow: {
        borderBottom: 'none'
    },
    labelCell: {
        width: '30%',
        padding: 4,
        fontWeight: 'bold',
        borderRight: '1px solid #000',
        backgroundColor: '#F3F4F6' // faint gray
    },
    valueCell: {
        width: '70%',
        padding: 4
    },
    // Custom split row for DISCENTE and MODALIDADE
    splitRow: {
        flexDirection: 'row',
        borderBottom: '1px solid #000'
    },
    halfCell: {
        width: '50%',
        flexDirection: 'row'
    },
    smallLabel: {
        fontWeight: 'bold',
        padding: 4,
        borderRight: '1px solid #000',
        width: '30%',
        backgroundColor: '#F3F4F6'
    },
    smallValue: {
        padding: 4,
        width: '70%'
    },
    textArea: {
        padding: 5,
        height: 300,
        borderBottom: '1px solid #000',
        fontSize: 10,
        lineHeight: 1.5
    },
    signatureSection: {
        marginTop: 50,
        alignItems: 'center'
    },
    signatureLine: {
        borderTop: '1px solid #000',
        width: '80%',
        marginTop: 40,
        marginBottom: 5
    },
    footerCenter: {
        textAlign: 'center',
        marginTop: 10
    }
})

interface CapaEstagioTemplateProps {
    curso: string
    unidade: string
    periodo: string
    semestre: string
    alunoNome: string
    // ... (lines 122-135 omitted, keeping them same but need to be careful with context)
    alunoMatricula: string
    modalidade: string
    campoEstagio: string
    tipoDocumentacao: string
    dataInicio: Date
    cargaHoraria: number
    atribuicoes: string
    supervisorNome: string
    supervisorCargo: string
    supervisorFormacao: string
    supervisorTitulacao: string
    orientadorNome: string
}

export function CapaEstagioTemplate({
    curso,
    unidade,
    periodo,
    semestre,
    alunoNome,
    alunoMatricula,
    modalidade,
    campoEstagio,
    tipoDocumentacao,
    dataInicio,
    cargaHoraria,
    atribuicoes,
    supervisorNome,
    supervisorCargo,
    supervisorFormacao,
    supervisorTitulacao,
    orientadorNome
}: CapaEstagioTemplateProps) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header Logo */}
                <View style={{ alignItems: 'flex-end', marginBottom: 10 }}>
                    {/* Placeholder for Logo - In real app, verify path or omit if image load fails. */}
                    {/* <Image src="/uemg.jpg" style={styles.logo} /> */}
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1a365d' }}>UNIVERSIDADE DO ESTADO DE MINAS GERAIS</Text>
                    <Text style={{ fontSize: 10, color: '#666', marginTop: 4 }}>UNIDADE {unidade.toUpperCase()}</Text>
                </View>

                {/* Main Table */}
                <View style={{ border: '1px solid #000' }}>
                    {/* Header Title */}
                    <View style={{ backgroundColor: '#E5E7EB', padding: 8, borderBottom: '1px solid #000' }}>
                        <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>DADOS DE IDENTIFICAÇÃO DO ESTÁGIO OBRIGATÓRIO</Text>
                    </View>

                    {/* Sub Header */}
                    <View style={[styles.row, { justifyContent: 'space-between', backgroundColor: '#F9FAFB' }]}>
                        <View style={{ padding: 4 }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 10 }}>{curso.toUpperCase()} - {periodo}º PERÍODO - {semestre}</Text>
                        </View>
                        <View style={{ padding: 4 }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 10 }}>ESTÁGIO OBRIGATÓRIO</Text>
                        </View>
                    </View>

                    {/* Aluno Row (Split) */}
                    <View style={styles.row}>
                        <View style={{ width: '15%', padding: 4, borderRight: '1px solid #000', backgroundColor: '#F3F4F6' }}>
                            <Text style={{ fontWeight: 'bold' }}>DISCENTE:</Text>
                        </View>
                        <View style={{ width: '20%', padding: 4, borderRight: '1px solid #000', justifyContent: 'center' }}>
                            <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>{alunoMatricula}</Text>
                        </View>
                        <View style={{ width: '65%', padding: 4 }}>
                            <Text>{alunoNome.toUpperCase()}</Text>
                        </View>
                    </View>

                    {/* Modalidade */}
                    <View style={styles.row}>
                        <View style={{ width: '30%', padding: 4, borderRight: '1px solid #000', backgroundColor: '#F3F4F6', justifyContent: 'center' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 9 }}>MODALIDADE DO ESTÁGIO:</Text>
                        </View>
                        <View style={{ width: '70%', padding: 4, justifyContent: 'center' }}>
                            <Text>{modalidade}</Text>
                        </View>
                    </View>

                    {/* Campo */}
                    <View style={styles.row}>
                        <View style={{ width: '30%', padding: 4, borderRight: '1px solid #000', backgroundColor: '#F3F4F6', justifyContent: 'center' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 9 }}>CAMPO DE ESTÁGIO:</Text>
                        </View>
                        <View style={{ width: '70%', padding: 4, justifyContent: 'center' }}>
                            <Text>{campoEstagio.toUpperCase()}</Text>
                        </View>
                    </View>

                    {/* Tipo Doc */}
                    <View style={styles.row}>
                        <View style={{ width: '30%', padding: 4, borderRight: '1px solid #000', backgroundColor: '#F3F4F6', justifyContent: 'center' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 9 }}>TIPO DE DOCUMENTAÇÃO:</Text>
                        </View>
                        <View style={{ width: '70%', padding: 4, justifyContent: 'center' }}>
                            {/* Map Enum to Readable if needed */}
                            <Text>{tipoDocumentacao === 'TCE' ? 'TERMO DE COMPROMISSO DE ESTÁGIO (TCE)' : tipoDocumentacao}</Text>
                        </View>
                    </View>

                    {/* Data and CH */}
                    <View style={styles.row}>
                        <View style={{ width: '30%', padding: 4, borderRight: '1px solid #000', backgroundColor: '#F3F4F6', justifyContent: 'center' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 9 }}>DATA PREVISTA PARA INÍCIO:</Text>
                        </View>
                        <View style={{ width: '20%', padding: 4, borderRight: '1px solid #000', justifyContent: 'center' }}>
                            <Text>{format(dataInicio, 'dd/MM/yyyy')}</Text>
                        </View>
                        <View style={{ width: '15%', padding: 4, borderRight: '1px solid #000', backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 9 }}>CH/DIA:</Text>
                        </View>
                        <View style={{ width: '35%', padding: 4, justifyContent: 'center' }}>
                            <Text>{cargaHoraria}</Text>
                        </View>
                    </View>

                    {/* Atribuicoes */}
                    <View style={{ borderBottom: '1px solid #000' }}>
                        <View style={{ padding: 4, backgroundColor: '#F3F4F6', borderBottom: '1px solid #000' }}>
                            <Text style={{ fontWeight: 'bold' }}>ATRIBUIÇÕES:</Text>
                        </View>
                        <View style={{ padding: 6, minHeight: 200 }}>
                            <Text style={{ fontSize: 10, lineHeight: 1.4 }}>{atribuicoes}</Text>
                        </View>
                    </View>

                    {/* Supervisor Info */}
                    <View style={styles.row}>
                        <View style={{ width: '30%', padding: 4, borderRight: '1px solid #000', backgroundColor: '#F3F4F6', justifyContent: 'center' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 9 }}>SUPERVISOR DE CAMPO:</Text>
                        </View>
                        <View style={{ width: '70%', padding: 4, justifyContent: 'center' }}>
                            <Text>{supervisorNome}</Text>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={{ width: '30%', padding: 4, borderRight: '1px solid #000', backgroundColor: '#F3F4F6', justifyContent: 'center' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 9 }}>CARGO DO SUPERVISOR:</Text>
                        </View>
                        <View style={{ width: '70%', padding: 4, justifyContent: 'center' }}>
                            <Text>{supervisorCargo}</Text>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={{ width: '30%', padding: 4, borderRight: '1px solid #000', backgroundColor: '#F3F4F6', justifyContent: 'center' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 9 }}>ÁREA DE FORMAÇÃO:</Text>
                        </View>
                        <View style={{ width: '70%', padding: 4, justifyContent: 'center' }}>
                            <Text>{supervisorFormacao}</Text>
                        </View>
                    </View>

                    <View style={[styles.row, { borderBottom: 'none' }]}>
                        <View style={{ width: '30%', padding: 4, borderRight: '1px solid #000', backgroundColor: '#F3F4F6', justifyContent: 'center' }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 9 }}>MAIOR TITULARIDADE:</Text>
                        </View>
                        <View style={{ width: '70%', padding: 4, justifyContent: 'center' }}>
                            <Text>{supervisorTitulacao}</Text>
                        </View>
                    </View>

                </View>

                {/* Footer Signatures */}
                <View style={styles.signatureSection}>
                    <Text style={{ marginBottom: 30 }}>Carangola-MG, ____ de ________________ de _________</Text>

                    <View style={{ borderTop: '1px solid #000', width: 300, alignItems: 'center', paddingTop: 4 }}>
                        <Text style={{ fontWeight: 'bold' }}>{orientadorNome}</Text>
                        <Text>Professor(a) Orientador(a) do Estágio</Text>
                    </View>
                </View>

            </Page>
        </Document>
    )
}
