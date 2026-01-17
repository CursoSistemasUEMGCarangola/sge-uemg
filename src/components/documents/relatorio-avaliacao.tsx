import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { format } from 'date-fns'

/*Font.register({
    family: 'Open Sans',
    src: 'https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFVZ0e.ttf'
})*/

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 12,
        lineHeight: 1.5,
    },
    header: {
        marginBottom: 20,
        textAlign: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        textTransform: 'uppercase'
    },
    subtitle: {
        fontSize: 12,
        marginBottom: 20,
    },
    section: {
        marginBottom: 15,
    },
    label: {
        fontSize: 10,
        color: '#666',
        marginBottom: 2,
    },
    value: {
        fontSize: 12,
        marginBottom: 5,
        fontFamily: 'Helvetica-Bold'
    },
    textValidation: {
        marginTop: 10,
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#f5f5f5',
        fontSize: 11
    },
    signature: {
        marginTop: 50,
        borderTopWidth: 1,
        borderTopColor: '#000',
        width: 250,
        textAlign: 'center',
        paddingTop: 5,
        alignSelf: 'center'
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        fontSize: 9,
        textAlign: 'center',
        color: '#999'
    }
})

interface RelatorioAvaliacaoTemplateProps {
    alunoNome: string
    alunoMatricula: string
    cursoNome: string
    empresaNome: string
    supervisorNome: string
    textoRelatorio: string
    dataInicio: Date
}

export function RelatorioAvaliacaoTemplate({
    alunoNome,
    alunoMatricula,
    cursoNome,
    empresaNome,
    supervisorNome,
    textoRelatorio,
    dataInicio
}: RelatorioAvaliacaoTemplateProps) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>Universidade do Estado de Minas Gerais</Text>
                    <Text style={styles.subtitle}>Relatório de Avaliação de Estágio Supervisionado</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Estagiário(a):</Text>
                    <Text style={styles.value}>{alunoNome} (Matrícula: {alunoMatricula})</Text>

                    <Text style={styles.label}>Curso:</Text>
                    <Text style={styles.value}>{cursoNome}</Text>

                    <Text style={styles.label}>Unidade Concedente (Empresa):</Text>
                    <Text style={styles.value}>{empresaNome}</Text>

                    <Text style={styles.label}>Supervisor de Estágio:</Text>
                    <Text style={styles.value}>{supervisorNome}</Text>
                </View>

                <View style={[styles.section, { marginTop: 20 }]}>
                    <Text style={[styles.title, { fontSize: 14, marginBottom: 10 }]}>Atividades Desenvolvidas e Resultados</Text>
                    <View style={styles.textValidation}>
                        <Text>{textoRelatorio || "Nenhum relatório preenchido."}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text>
                        Declaro que as informações acima são verdadeiras e refletem as atividades realizadas durante o período de estágio.
                    </Text>
                </View>

                <View style={styles.signature}>
                    <Text>{supervisorNome}</Text>
                    <Text style={styles.label}>Supervisor de Estágio - {empresaNome}</Text>
                </View>

                <View style={[styles.signature, { marginTop: 30 }]}>
                    <Text>Professor Orientador</Text>
                    <Text style={styles.label}>UEMG</Text>
                </View>

                <View style={styles.footer}>
                    <Text>Documento gerado automaticamente pelo Sistema de Gestão de Estágios - UEMG</Text>
                    <Text>Em {format(new Date(), "dd/MM/yyyy")}</Text>
                </View>
            </Page>
        </Document>
    )
}
