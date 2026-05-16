"use client"

import { useState, useTransition } from "react"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { toggleModoEleitoralAction } from "@/features/admin/actions"
import { ShieldAlert, ShieldCheck } from "lucide-react"

interface ModoEleitoralToggleProps {
    initialValue: boolean
}

export function ModoEleitoralToggle({ initialValue }: ModoEleitoralToggleProps) {
    const [ativo, setAtivo] = useState(initialValue)
    const [isPending, startTransition] = useTransition()
    const { toast } = useToast()

    function handleToggle(checked: boolean) {
        startTransition(async () => {
            const result = await toggleModoEleitoralAction(checked)
            if (result.success) {
                setAtivo(checked)
                toast({
                    title: checked
                        ? "Modo Eleitoral ativado"
                        : "Modo Eleitoral desativado",
                    description: checked
                        ? "A landing page está descaracterizada conforme a legislação eleitoral."
                        : "A landing page voltou ao visual institucional completo.",
                })
            }
        })
    }

    return (
        <div className="space-y-6">
            {/* Status banner */}
            <div className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${ativo
                ? "border-amber-400 bg-amber-50 text-amber-900"
                : "border-green-400 bg-green-50 text-green-900"
                }`}>
                {ativo
                    ? <ShieldAlert className="h-6 w-6 shrink-0 text-amber-600" />
                    : <ShieldCheck className="h-6 w-6 shrink-0 text-green-600" />
                }
                <div>
                    <p className="font-semibold text-sm">
                        {ativo ? "Período de Vedação Eleitoral — ATIVO" : "Fora do Período de Vedação Eleitoral"}
                    </p>
                    <p className="text-xs mt-0.5 opacity-80">
                        {ativo
                            ? "A landing page está exibindo a versão descaracterizada."
                            : "A landing page está exibindo o visual institucional completo."}
                    </p>
                </div>
                <Badge
                    className={`ml-auto shrink-0 ${ativo
                        ? "bg-amber-500 hover:bg-amber-500 text-white"
                        : "bg-green-600 hover:bg-green-600 text-white"
                        }`}
                >
                    {ativo ? "ATIVO" : "INATIVO"}
                </Badge>
            </div>

            {/* Toggle control */}
            <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/30">
                <div className="space-y-1">
                    <Label
                        htmlFor="modo-eleitoral-switch"
                        className="text-sm font-medium leading-none cursor-pointer"
                    >
                        Ativar Modo de Vedação Eleitoral
                    </Label>
                    <p className="text-sm text-muted-foreground">
                        Descaracteriza a landing page enquanto estiver habilitado.
                    </p>
                </div>
                <Switch
                    id="modo-eleitoral-switch"
                    checked={ativo}
                    onCheckedChange={handleToggle}
                    disabled={isPending}
                />
            </div>

            {/* What changes explanation */}
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2 text-sm text-muted-foreground">
                <p><strong>O que muda quando o modo está ativo:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>A logomarca da UEMG Carangola é <strong>removida</strong> da página inicial</li>
                    <li>O texto de descrição é simplificado, sem identificação da unidade</li>
                    <li>Todas as cores são substituídas por tons de <strong>cinza e preto</strong></li>
                    <li>O rodapé não exibe mais o nome "UEMG Carangola"</li>
                </ul>
                <p className="mt-2 text-xs">
                    <strong>Nota:</strong> Somente a página inicial pública (<code>/</code>) é afetada.
                    O painel administrativo e as áreas de alunos permanecem inalterados.
                </p>
            </div>
        </div>
    )
}
