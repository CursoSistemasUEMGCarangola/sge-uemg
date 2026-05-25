'use server'

import { GoogleGenerativeAI } from "@google/generative-ai"
import { getCurrentUserRole } from "@/lib/auth"

const apiKey = process.env.GEMINI_API_KEY

export async function enhanceTextAction(text: string) {
    // SEG-04: Verificar autenticação antes de consumir a API de IA
    const role = await getCurrentUserRole()
    if (!role) {
        return { success: false, error: "Não autenticado." }
    }

    if (!apiKey) {
        return { success: false, error: "Chave de API do Gemini não configurada." }
    }

    if (!text || text.trim().length < 10) {
        return { success: false, error: "O texto é muito curto para ser aprimorado." }
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" })

        const prompt = `
        Você é um especialista em revisão de textos acadêmicos e profissionais para planos de estágio.
        Aprimore o texto abaixo, que descreve as atividades de um estagiário.
        
        Objetivos:
        1. Corrigir erros gramaticais e ortográficos.
        2. Melhorar a clareza e coesão.
        3. Tornar a linguagem mais formal e adequada para um documento acadêmico/profissional.
        4. Manter o sentido original das atividades descritas.
        5. Retorne APENAS o texto aprimorado, sem comentários adicionais ou aspas.

        Texto original:
        "${text}"
        `

        const result = await model.generateContent(prompt)
        const response = await result.response
        const enhancedText = response.text()

        return { success: true, text: enhancedText.trim() }
    } catch (error: any) {
        console.error("Erro ao chamar Gemini AI:", error)

        const errorMessage = error.toString().toLowerCase()
        if (errorMessage.includes("429") || errorMessage.includes("too many requests") || errorMessage.includes("503") || errorMessage.includes("service unavailable")) {
            return { success: false, error: "O serviço de IA está indisponível no momento devido à alta demanda. Por favor, tente novamente mais tarde." }
        }

        return { success: false, error: "Erro ao processar o texto com a IA. Tente novamente." }
    }
}
