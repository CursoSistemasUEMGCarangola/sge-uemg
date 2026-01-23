"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, ArrowLeft, Printer } from "lucide-react"

interface CapaFormProps {
    contrato: any
    informacoesGerais?: any[]
}

export function CapaForm({ contrato }: CapaFormProps) {
    const router = useRouter()

    const handleGeneratePDF = () => {
        window.open(`/aluno/docs/capa/${contrato.id}/pdf`, '_blank')
    }

    // Helper to format date
    const formatDate = (date: string | Date) => {
        if (!date) return "-"
        return format(new Date(date), "dd/MM/yyyy", { locale: ptBR })
    }

    return (
        <Card className="w-full max-w-5xl mx-auto shadow-lg">
            <CardHeader className="bg-muted/30 pb-6 border-b">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-2xl font-bold">Capa do Estágio</CardTitle>
                        <CardDescription className="text-base mt-2">
                            Confira as informações que constarão no seu documento de capa.
                        </CardDescription>
                    </div>
                    <Button
                        type="button"
                        variant="default"
                        size="lg"
                        className="bg-green-600 hover:bg-green-700 font-semibold shadow-md"
                        onClick={handleGeneratePDF}
                    >
                        <Printer className="mr-2 h-5 w-5" />
                        Gerar PDF / Imprimir
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
                <div className="space-y-8">

                    {/* SECTION 1: DADOS DO ALUNO */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2 text-primary">
                            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">1</span>
                            Identificação do Estagiário
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Nome Completo</Label>
                                <Input value={contrato.aluno.profile.nomeCompleto} disabled className="font-semibold text-foreground bg-muted/50" />
                            </div>
                            <div className="space-y-2">
                                <Label>Matrícula</Label>
                                <Input value={contrato.aluno.matricula} disabled className="bg-muted/50" />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input value={contrato.aluno.profile.email} disabled className="bg-muted/50" />
                            </div>
                            <div className="space-y-2">
                                <Label>Telefone</Label>
                                <Input value={contrato.aluno.profile.telefone || '-'} disabled className="bg-muted/50" />
                            </div>
                            <div className="space-y-2">
                                <Label>Curso</Label>
                                <Input value={contrato.oferta.curso.nome} disabled className="bg-muted/50" />
                            </div>
                            <div className="space-y-2">
                                <Label>Período</Label>
                                <Input value={`${contrato.oferta.curso.periodoVinculado}º Período`} disabled className="bg-muted/50" />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: DADOS DA EMPRESA */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2 text-primary">
                            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">2</span>
                            Identificação da Unidade Concedente (Empresa)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Razão Social</Label>
                                <Input value={contrato.campo.razaoSocial} disabled className="font-medium bg-muted/50" />
                            </div>
                            <div className="space-y-2">
                                <Label>Nome Fantasia</Label>
                                <Input value={contrato.campo.nomeFantasia} disabled className="bg-muted/50" />
                            </div>
                            <div className="space-y-2">
                                <Label>Telefone da Empresa</Label>
                                <Input value={contrato.campo.telefoneContato || '-'} disabled className="bg-muted/50" />
                            </div>
                            <div className="space-y-2">
                                <Label>Email da Empresa</Label>
                                <Input value={contrato.campo.emailContato || '-'} disabled className="bg-muted/50" />
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-muted/20 rounded-lg border border-muted">
                            <h4 className="font-semibold text-sm mb-4 text-muted-foreground uppercase tracking-wider">Dados do Supervisor</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Nome do Supervisor</Label>
                                    <Input value={contrato.campo.supervisorNome} disabled className="bg-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Cargo</Label>
                                    <Input value={contrato.campo.supervisorCargo} disabled className="bg-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Formação Acadêmica</Label>
                                    <Input value={contrato.campo.supervisorAreaFormacao} disabled className="bg-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Titulação</Label>
                                    <Input value={contrato.campo.supervisorTitulacao} disabled className="bg-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email do Supervisor</Label>
                                    <Input value={contrato.campo.supervisorEmail} disabled className="bg-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Telefone do Supervisor</Label>
                                    <Input value={contrato.campo.supervisorTelefone} disabled className="bg-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: DADOS DO ESTÁGIO */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2 text-primary">
                            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">3</span>
                            Dados do Estágio
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label>Modalidade</Label>
                                <Input value={contrato.modalidade} disabled className="bg-muted/50" />
                            </div>
                            <div className="space-y-2">
                                <Label>Carga Horária Diária</Label>
                                <Input value={`${contrato.cargaHorariaDiaria} horas`} disabled className="bg-muted/50" />
                            </div>
                            <div className="space-y-2">
                                <Label>Data de Início Prevista</Label>
                                <Input value={formatDate(contrato.dataInicioPrevista)} disabled className="bg-muted/50" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Atribuições / Plano de Atividades</Label>
                            <Textarea
                                value={contrato.atribuicoes}
                                disabled
                                className="min-h-[100px] bg-muted/50 resize-none text-foreground"
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-between pt-6 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
