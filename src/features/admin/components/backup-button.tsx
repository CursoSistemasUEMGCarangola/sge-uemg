"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Database, Download, Loader2, CheckCircle2 } from "lucide-react"

export function BackupButton() {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    async function handleBackup() {
        setIsLoading(true)

        try {
            const response = await fetch('/api/backup')

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Erro ao gerar backup')
            }

            // Extrair nome do arquivo do header Content-Disposition
            const disposition = response.headers.get('Content-Disposition')
            const filenameMatch = disposition?.match(/filename="(.+)"/)
            const filename = filenameMatch ? filenameMatch[1] : 'sge-backup.json'

            // Criar blob e disparar download
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = filename
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            toast({
                title: "✅ Backup realizado com sucesso!",
                description: `Arquivo "${filename}" salvo.`,
            })
        } catch (error) {
            console.error('[BACKUP] Erro:', error)
            toast({
                title: "❌ Erro ao gerar backup",
                description: error instanceof Error ? error.message : "Erro desconhecido.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            onClick={handleBackup}
            disabled={isLoading}
            size="lg"
            className="gap-2"
            id="backup-download-button"
        >
            {isLoading ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Gerando backup...
                </>
            ) : (
                <>
                    <Download className="h-4 w-4" />
                    Baixar Backup Completo
                </>
            )}
        </Button>
    )
}
