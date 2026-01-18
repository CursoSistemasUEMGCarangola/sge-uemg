'use client'

import { Badge } from "@/components/ui/badge"
import { toggleOfferStatusAction } from "@/features/admin/actions/toggle-offer-status-action"
import { useTransition } from "react"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface OfferStatusBadgeProps {
    id: number
    ativo: boolean | null
}

export function OfferStatusBadge({ id, ativo }: OfferStatusBadgeProps) {
    const [isPending, startTransition] = useTransition()
    const { toast } = useToast()

    const handleToggle = () => {
        startTransition(async () => {
            const result = await toggleOfferStatusAction(id, ativo)

            if (!result.success) {
                toast({
                    variant: "destructive",
                    title: "Erro",
                    description: result.error
                })
            }
        })
    }

    return (
        <div
            onClick={handleToggle}
            className={`inline-block cursor-pointer ${isPending ? 'opacity-50' : ''}`}
        >
            <Badge variant={ativo ? "default" : "secondary"} className="hover:opacity-80 transition-opacity">
                {isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : null}
                {ativo ? "Ativo" : "Inativo"}
            </Badge>
        </div>
    )
}
