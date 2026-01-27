# Skill: Implementação Robusta de Recuperação de Senha (Next.js + Supabase)

Este documento descreve o padrão definitivo para implementar recuperação de senha em aplicações Next.js com Supabase Auth, contornando problemas comuns de **PKCE**, **Redirecionamentos Localhost** e **Race Conditions** de sessão.

---

## 📋 Contexto e Problema

O fluxo padrão do Supabase (PKCE) muitas vezes falha em cenários cross-device ou quando iniciado pelo servidor (Server Actions) devido à falta de cookies de verificação. A solução mais robusta utiliza:

1. **Envio via Admin**: Usa a `service_role` para enviar o e-mail, gerando um link com tokens na URL (Implicit Flow).
2. **Tratamento Client-Side**: O link aponta direto para o Front-end, que restaura a sessão manualmente.

---

## 🚀 Passo a Passo da Implementação

### 1. Configuração do Supabase (Dashboard)

1. Acesse o Dashboard do Supabase > Authentication > URL Configuration.
2. Em **Redirect URLs**, adicione a URL exata da página de reset do seu site (e a localhost para testes):
    * `http://localhost:3000/reset`
    * `https://seu-projeto.vercel.app/reset`
    * **Nota**: Evite usar wildcards (`**`) se possível, ou certifique-se de que a URL exata esteja listada.

---

### 2. Utilitário de URL (Server-Side)

Crie um utilitário para garantir que o link de redirecionamento esteja correto (produção vs desenvolvimento).

**Arquivo**: `src/server/url.ts`

```typescript
import { headers } from 'next/headers'

export async function getServerBaseUrl() {
    const headersList = await headers()
    const host = headersList.get('host')
    const proto = headersList.get('x-forwarded-proto') || 'https'

    if (host && !host.includes('localhost')) {
        return `${proto}://${host}/`
    }
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}/`
    return 'http://localhost:3000/' // Fallback
}
```

---

### 3. Server Action: Enviar E-mail (Back-end)

Use o cliente Admin (Service Role) para enviar o e-mail. Isso evita a necessidade de um contexto de sessão do usuário no servidor.

**Requisito**: Tenha uma função `createAdminClient()` que use a `SUPABASE_SERVICE_ROLE_KEY`.

**Arquivo**: `src/server/auth.ts`

```typescript
import { createAdminClient } from '@/lib/supabase/admin'
import { getServerBaseUrl } from '@/server/url'

export async function recoverPassword(formData: FormData) {
    const email = formData.get('email') as string
    const adminDb = createAdminClient()

    // O link apontará diretamente para a página /reset, sem passar por callbacks de API
    const baseUrl = await getServerBaseUrl()
    const callbackUrl = `${baseUrl}reset` 

    const { error } = await adminDb.auth.resetPasswordForEmail(email, {
        redirectTo: callbackUrl
    })

    if (error) return { error: error.message }
    return { success: true }
}
```

---

### 4. Página de Nova Senha (Front-end)

Esta é a parte crítica. A página deve:

1. Detectar os tokens no Hash da URL (`#access_token=...`).
2. Forçar a restauração da sessão (`setSession`).
3. Esperar a sessão estar ativa antes de permitir a troca da senha.

**Arquivo**: `src/app/(auth)/reset/page.tsx`

```tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
// Importe seus componentes de UI (Button, Input, Toast)...

export default function ResetPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isRestoringSession, setIsRestoringSession] = useState(true)
    const router = useRouter()
    
    // Instância única do cliente Supabase para o componente
    const [supabase] = useState(() => createClient())

    // 1. Lógica de Restauração de Sessão
    useEffect(() => {
        const restoreSession = async () => {
            // Verifica se é um fluxo implícito (tokens no hash)
            const hasHash = window.location.hash && window.location.hash.includes('access_token')

            if (hasHash) {
                setIsRestoringSession(true) // Bloqueia UI
                
                try {
                    // Parse manual para garantir captura
                    const params = new URLSearchParams(window.location.hash.substring(1))
                    const access_token = params.get('access_token')
                    const refresh_token = params.get('refresh_token')

                    if (access_token && refresh_token) {
                        // Força a sessão manualmente
                        await supabase.auth.setSession({ access_token, refresh_token })
                    }
                } catch (e) {
                    console.error('Erro ao processar hash:', e)
                }
            }

            // Verifica estado atual
            const { data: { session } } = await supabase.auth.getSession()

            if (session) {
                setIsRestoringSession(false)
            } else {
                // Se ainda não tem sessão, aguarda evento do Supabase
                const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                    if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY' || session) {
                        setIsRestoringSession(false)
                    }
                })

                // Timeout de segurança (5s) para não travar a tela
                if (hasHash) {
                    setTimeout(() => setIsRestoringSession(false), 5000)
                } else {
                    setIsRestoringSession(false)
                }

                return () => subscription.unsubscribe()
            }
        }
        restoreSession()
    }, [supabase])

    // 2. Handler do Formulário
    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        const password = formData.get('password') as string

        // Verificação de Segurança Extra
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            alert('Sessão expirada. Solicite o link novamente.')
            setIsLoading(false)
            return
        }

        // Update direto no cliente
        const { error } = await supabase.auth.updateUser({ password })

        if (error) {
            alert(error.message)
        } else {
            router.push('/login')
        }
        setIsLoading(false)
    }

    if (isRestoringSession) {
        return <div>Carregando sessão...</div> // Use seu componente de Loading/Skeleton
    }

    return (
        <form action={handleSubmit}>
            <input name="password" type="password" required />
            <button type="submit">Redefinir Senha</button>
        </form>
    )
}
```

---

## 💡 Resumo dos Benefícios

1. **Zero Dependência de Cookies de Servidor**: Funciona perfeitamente cross-browser/cross-device (ex: abre email no celular, clica no link).
2. **Sem Callback Hell**: Elimina a necessidade de rotas de API complexas para troca de código (`exchangeCodeForSession`).
3. **Feedback Imediato**: O usuário vê se o link funcionou (sessão carregada) antes de digitar a senha.
