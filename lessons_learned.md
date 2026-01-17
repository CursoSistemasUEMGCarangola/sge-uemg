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

### [2026-01-17] - [PRISMA] Nomenclatura de Campos no Cliente

**Contexto:** Erro `Argument 'nomeCompleto' is missing` ao tentar criar registro. O Prisma exige o nome da propriedade definida no modelo (`nomeCompleto`), não o nome da coluna no banco (`nome_completo`).
**Solução:** Ajustar o objeto `data` para usar `nomeCompleto`.
**Prevenção:** Verificar sempre o `schema.prisma` para ver o nome da propriedade (antes do `@map`) ao escrever queries.

### [2026-01-17] - [NEXTJS] Importação de Zod em Server Actions

**Contexto:** Erro ao importar schema Zod de um arquivo `'use server'` para um Client Component.
**Solução:** Mover schemas de validação para arquivos "puros" (ex: `schemas/register-schema.ts`) sem diretiva `'use server'`.

### [2026-01-17] - [PRISMA] Tratamento de Erro P2002 (Unique Constraint)

**Contexto:** Ao cadastrar usuário com email ou matrícula já existentes, o Prisma retorna erro genérico ou falha silenciosa se não tratado especificamente.
**Solução:** Capturar `error.code === 'P2002'` no bloco catch e verificar `error.meta.target` para identificar qual campo (email/matricula) violou a unicidade, retornando mensagem amigável.
**Prevenção:** Sempre tratar P2002 em formulários de criação (cadastro, novo estágio).

### [2026-01-17] - [DB] Sincronização SQL vs Prisma

**Contexto:** O arquivo `sql/schema.sql` é a fonte da verdade, mas o Prisma não o lê automaticamente. Divergências causaram erros (ex: tabela `documento_modelo` faltando no Prisma).
**Solução:** Criada regra no RAG e script mental para sempre comparar os dois arquivos.
**Prevenção:** Sempre que alterar o SQL, atualizar manualmente o `schema.prisma` e rodar `npx prisma generate`.
