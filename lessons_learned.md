# KNOWLEDGE BASE & LESSONS LEARNED
>
> Este arquivo é a memória evolutiva do projeto. Sempre que um erro complexo for resolvido ou uma decisão de configuração não óbvia for tomada, registre aqui.

## FORMATO DE REGISTRO

### [DATA] - [CATEGORIA] Título Curto do Problema

**Contexto:** Breve descrição do erro ou do requisito obscuro.
**Solução:** O que foi feito para resolver (snippets de código, comandos, mudança de lógica).
**Prevenção:** O que verificar no futuro para evitar reincidência.

---

## REGISTROS

### [2026-01-16] - [INFRA] Cold Starts do Supabase

**Contexto:** O banco entra em pausa após inatividade. A primeira requisição falhava por timeout.
**Solução:** Implementada lógica de retry no cliente Prisma e aviso de "Carregando sistema..." na UI.
**Prevenção:** Testar sempre a aplicação após 1h de inatividade.

### [2026-01-16] - [DB] Conexão Prisma vs Supabase (IPv4/IPv6)

**Contexto:** Erro `P1001` e `P4002` ao rodar `prisma db push`. O Supabase usa IPv6 para conexão direta, e algumas redes/ISPs não suportam.
**Solução:**

1. Uso do Session Pooler (porta 5432) no `DIRECT_URL` para contornar restrição de IPv6.
2. Fallback para execução manual de SQL (`sql/` scripts) quando a migração via CLI falha.
**Prevenção:** Manter scripts SQL atualizados para alterações de schema manuais.

### [2026-01-16] - [NEXTJS] Middleware e Rotas Públicas

**Contexto:** Loop de redirecionamento ou bloqueio indevido na Landing Page (`/`).
**Solução:** Explicitar exceção para `req.nextUrl.pathname !== '/'` no middleware.
**Prevenção:** Ao criar páginas públicas, adicionar imediatamente à whitelist do middleware.

### [2026-01-16] - [UX] Skeletons e Feedback Visual

**Contexto:** "Piscada" de conteúdo ou tela branca enquanto dados carregam.
**Solução:** Criação de `loading.tsx` com Skeletons (Shadcn UI) replicando o layout final.
**Prevenção:** Sempre criar `loading.tsx` para rotas que fazem fetch de dados no servidor (`await`).
