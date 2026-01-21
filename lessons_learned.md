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

### [2026-01-18] - [AUTH] Confirmação de Email vs Supabase Admin

**Contexto:** Novos cadastros de alunos falhavam no login com erro "Email not confirmed". O projeto requer que o cadastro já nasça ativado, sem necessidade de clicar em link de email.
**Solução:** Substituir `supabase.auth.signUp` (que exige confirmação) por `supabaseAdmin.auth.admin.createUser` com `email_confirm: true`. Para isso, foi necessário configurar `SUPABASE_SERVICE_ROLE_KEY` no `.env` e criar um cliente admin (`src/lib/supabase/admin.ts`).
**Prevenção:** Se precisar criar usuários "pré-aprovados", sempre use a API Admin do Supabase, pois a API pública sempre dispara o fluxo de email confirm (a menos que desligado no painel, o que pode ser inseguro globalmente).

### [2026-01-18] - [PRISMA] Multi-Schema e Supabase

**Contexto:** Erro `P4002` (Inconsistent Schema) ao dar `db push`. O Supabase possui schemas internos (`auth`, `storage`) que conflitam se o Prisma não estiver ciente.
**Solução:** Habilitar `previewFeatures = ["multiSchema"]`, definir `schemas = ["public", "auth"]` no datasource e adicionar anotação `@@schema("public")` em todos os modelos.
**Prevenção:** Em projetos Supabase com Prisma, inicie já com configuração Multi-Schema para evitar refatoração massiva de annotations depois.

### [2026-01-18] - [DEV] Prisma Generate com Server Rodando (Windows)

**Contexto:** Erro `EPERM: operation not permitted` ao rodar `npx prisma generate` enquanto `npm run dev` está ativo no Windows. O binário do cliente fica travado pelo processo do Node.
**Solução:** Parar o servidor de desenvolvimento antes de regenerar o cliente Prisma.
**Prevenção:** No Windows, sempre derrubar o servidor antes de comandos que alteram `node_modules/.prisma`.

### [2026-01-18] - [UX] Terminologia (Oferta vs Atribuição)

**Contexto:** O termo "Oferta de Estágio" causava confusão, parecendo algo para alunos se candidatarem, quando na verdade era uma alocação de carga horária de professor ("Atribuição de Orientação").
**Solução:** Refatoração de textos na UI para "Atribuição" e "Orientação", mantendo o nome técnico da tabela `OfertaEstagio` para evitar quebra de contratos de banco.
**Prevenção:** Validar glossário com o cliente antes de modelar o banco, ou aceitar que a UI pode divergir do Schema.

### [2026-01-19] - [DB] Enum vs String em Inputs Dinâmicos

**Contexto:** O formulário envia valores dinâmicos ("Presencial", "Remoto") vindos da tabela `informacoes_gerais_estagio`. O banco tinha colunas `modalidade` e `tipo_documentacao` tipadas como ENUM fixo (`USER-DEFINED`). Isso causou erro de validação do banco ao tentar salvar valores que tecnicamente eram strings válidas mas não correspondiam ao tipo ENUM estrito do Postgres.
**Solução:** Conversão das colunas para `TEXT` (`ALTER COLUMN ... TYPE text`), permitindo flexibilidade total para opções cadastradas dinamicamente no painel administrativo.
**Prevenção:** Se o conjunto de opções de um campo é gerenciado pelo usuário (CRUD), evite ENUM no banco. Use `TEXT` e valide na aplicação/schema.

### [2026-01-19] - [TYPESCRIPT] Tipagem Estrita em Server Actions com Prisma

**Contexto:** Mesmo após alterar o `schema.prisma` para `String`, o TypeScript no editor (`actions.ts`) continuava acusando erro de que `string` não era assignable para o tipo antigo (que ele cacheou ou inferiu incorretamente).
**Solução:** Casting explícito para `any` (`valor as any`) nos campos problemáticos dentro do Server Action para destravar o build, assumindo que a validação Zod e o banco (agora TEXT) garantem a integridade.
**Prevenção:** Em refatorações de tipo de banco, confiar mais no `prisma generate` e reiniciar o TS Server. Se persistir, o cast é uma solução pragmática para não bloquear o fluxo.

### [2026-01-19] - [NEXTJS] Webpack Cache e Prisma

**Contexto:** Erro `TypeError: __webpack_modules__[moduleId] is not a function` após mudanças drásticas de schema e regeneração do cliente Prisma.
**Solução:** Limpeza agressiva do cache: `rm -rf .next` seguido de `npx prisma generate` e `npm run build`.
**Prevenção:** Ao encontrar erros crípticos de módulo no Next.js após mexer no banco, limpar a pasta `.next` é o primeiro passo.

### [2026-01-20] - [JS/DATE] Tratamento de Datas e Timezones (UTC vs Local)

**Contexto:** Datas salvas como `YYYY-MM-DD` no banco (via Prisma `DateTime`) eram interpretadas como UTC Midnight. Ao exibir no frontend usando `new Date()`, o navegador convertia para o fuso local (Brasília -3h), resultando no dia anterior.
**Solução:** Usar `toLocaleDateString('pt-BR', { timeZone: 'UTC' })` para garantir que a data seja exibida exatamente como salva, ignorando o deslocamento do navegador, ou usar bibliotecas como `date-fns-tz` para controle explícito.
**Prevenção:** Em sistemas de datas "burocráticas" (sem hora relevante), tratar sempre como UTC na renderização.

### [2026-01-20] - [NEXTJS] Interatividade em Páginas Server-Side (Server Actions + Client Components)

**Contexto:** Necessidade de adicionar botões com confirmação (Dialogs) e feedback (Toast) em uma página detalhe renderizada no servidor (`page.tsx`). Server Actions não podem ser invocados diretamente de event handlers em Server Components.
**Solução:** Criar um "Client Component wrapper" (ex: `contract-actions.tsx`) que contém a lógica de UI (`useState`, `useTransition`, `AlertDialog`) e invoca a Server Action. Esse componente é então importado na página Server-Side.
**Prevenção:** Segregar claramente: Página (Fetch dados) -> Componente Cliente (Interatividade) -> Server Action (Mutação).

### [2026-01-21] - [DB] Restauração de Schema e Seed Manual (Wipe Recovery)

**Contexto:** O banco de dados foi completamente apagado. A tentativa de usar `prisma db push` causou conflitos com tipos ENUM já existentes ou definições inconsistentes. Além disso, o seed script (`seed.ts`) falhava por depender de tipos do `@prisma/client` desatualizados em relação ao banco vazio.
**Solução:**

1. Criação de script SQL manual completo (`sql/schema.sql`) com `DROP TABLE/TYPE IF EXISTS CASCADE` para garantir limpeza total antes da recriação.
2. Criação de script SQL de seed (`sql/seed_admin.sql`) para inserir dados estáticos (etapas, configs) e usuários ADMIN via SQL direto, contornando a necessidade do cliente Prisma durante a restauração de emergência.
**Prevenção:** Manter sempre um `schema.sql` atualizado como fonte da verdade "fallback" para disaster recovery, sem depender exclusivamente das migrations do Prisma cli.

### [2026-01-21] - [REACT] Erro `TypeError: Cannot read properties of null (reading 'useContext')` após Wipe

**Contexto:** Após limpar o banco, usuários viam este erro ao tentar acessar páginas protegidas ou usar componentes de UI.
**Solução:**

1. O erro geralmente indica que um Hook (ex: `useToast` ou AuthContext) está sendo chamado fora de seu Provider, OU que o estado de autenticação (cookies) no navegador está tentando carregar sessões que não existem mais no banco (profile null).
2. Adição explícita do componente `<Toaster />` no `RootLayout` (`src/app/layout.tsx`).
3. Limpeza de cookies do navegador para forçar novo login.
**Prevenção:** Em casos de wipe de banco, sempre limpe os cookies do navegador e garanta que Providers globais (Toast, Auth) estejam no nível mais alto do Layout.

### [2026-01-21] - [NEXTJS] HTML Inválido: Button dentro de Link

**Contexto:** O padrão `<Link><Button>...</Button></Link>` gera HTML inválido (`<a><button>...</button></a>`) e causa problemas de hidratação ou comportamento errático de clique.
**Solução:** Usar a prop `asChild` do componente Button (do Shadcn/Radix) para que ele renderize o elemento filho (o Link) mantendo os estilos do botão: `<Button asChild><Link>...</Link></Button>`.
**Prevenção:** Nunca envolver componentes interativos (Button) com Link diretamente; usar composição com `asChild`.
