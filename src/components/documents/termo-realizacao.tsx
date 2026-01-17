/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Define styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 40,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 20,
        textAlign: 'center',
        borderBottom: 1,
        borderBottomColor: '#000',
        paddingBottom: 10,
    },
    universityName: {
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 20,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    body: {
        fontSize: 12,
        lineHeight: 1.5,
        textAlign: 'justify',
        marginBottom: 10,
    },
    bold: {
        fontFamily: 'Helvetica-Bold',
        fontWeight: 'bold',
    },
    signatureSection: {
        marginTop: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    signatureBlock: {
        width: '45%',
        borderTop: 1,
        borderTopColor: '#000',
        paddingTop: 5,
        alignItems: 'center',
    },
    signatureText: {
        fontSize: 10,
        textAlign: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        fontSize: 10,
        textAlign: 'center',
        color: '#666',
    }
});

interface TermoRealizacaoProps {
    alunoNome: string;
    alunoMatricula: string;
    cursoNome: string;
    empresaNome: string;
    dataInicio: Date;
    dataFim: Date;
    cargaHorariaTotal: number;
    supervisorNome: string;
    orientadorNome: string;
}

export const TermoRealizacaoTemplate = ({
    alunoNome,
    alunoMatricula,
    cursoNome,
    empresaNome,
    dataInicio,
    dataFim,
    cargaHorariaTotal,
    supervisorNome,
    orientadorNome
}: TermoRealizacaoProps) => {

    const formattedInicio = format(new Date(dataInicio), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    const formattedFim = format(new Date(dataFim), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    const diaVigente = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.universityName}>Universidade do Estado de Minas Gerais - UEMG</Text>
                    <Text>Estágio Supervisionado</Text>
                </View>

                <Text style={styles.title}>Termo de Realização de Estágio</Text>

                <Text style={styles.body}>
                    Certificamos para os devidos fins que o(a) discente <Text style={styles.bold}>{alunoNome}</Text>,
                    matrícula nº {alunoMatricula}, regularmente matriculado(a) no curso de <Text style={styles.bold}>{cursoNome}</Text>,
                    realizou estágio curricular obrigatório na empresa <Text style={styles.bold}>{empresaNome}</Text>.
                </Text>

                <Text style={styles.body}>
                    As atividades foram desenvolvidas no período de {formattedInicio} a {formattedFim},
                    com carga horária total de <Text style={styles.bold}>{cargaHorariaTotal} horas</Text>.
                </Text>

                <Text style={styles.body}>
                    O estagiário cumpriu todas as atividades previstas no Plano de Atividades com aproveitamento satisfatório.
                </Text>

                <Text style={{ marginTop: 30, textAlign: 'right', fontSize: 12 }}>
                    Frutal/MG, {diaVigente}.
                </Text>

                <View style={styles.signatureSection}>
                    <View style={styles.signatureBlock}>
                        <Text style={styles.signatureText}>{supervisorNome}</Text>
                        <Text style={styles.signatureText}>Supervisor de Estágio</Text>
                        <Text style={styles.signatureText}>{empresaNome}</Text>
                    </View>
                    <View style={styles.signatureBlock}>
                        <Text style={styles.signatureText}>{orientadorNome}</Text>
                        <Text style={styles.signatureText}>Professor Orientador</Text>
                        <Text style={styles.signatureText}>UEMG</Text>
                    </View>
                </View>

                <Text style={styles.footer}>
                    Sistema de Gestão de Estágios - UEMG Frutal
                </Text>
            </Page>
        </Document>
    );
};
