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

### [2026-01-22] - [PRISMA/REFACTOR] Renomeação de Enums (APROVADO -> ATIVO)

**Contexto:** Decisão de mudar a terminologia de `APROVADO` para `ATIVO` nos status de estágio.
**Solução:**

1. Alteração no `schema.prisma`.
2. Busca global e substituição de string literals no código TypeScript.
3. Tratamento de erro `EPERM` no Windows ao rodar `prisma generate`: é obrigatório parar o servidor Next.js antes.
**Prevenção:** Ao renomear Enums, lembre-se que o TypeScript não "pega" literais usados em comparações de string ou queries raw/filtros manuais. É necessário grep global.

### [2026-01-22] - [UI/CALENDAR] Visualização de Feriados e Timezones

**Contexto:** O componente `Calendar` (DayPicker) e o objeto `Date` do JS convertem datas para o fuso local, fazendo feriados (yyyy-mm-dd) aparecerem no dia anterior.
**Solução:**

1. Tratar as datas de feriados puramente como strings `YYYY-MM-DD` (UTC text) para comparação.
2. Usar `modifiers` do `react-day-picker` para injetar classes CSS condicionais (bg-red-100 para feriados).
**Prevenção:** Em calendários visuais, evite comparar objetos `Date` completos; normalize para string de data.

### [2026-01-22] - [DB/SEED] System Actions no Seed

**Contexto:** O botão "Preencher Capa" não aparecia no Dashboard do Aluno para a Etapa 1, mesmo com o código Frontend correto.
**Solução:** Identificado que o `seed.ts` criava a Etapa 1 sem preencher o campo `systemAction` (que o código espera ser `'GENERATE_DOC_CAPA'`). O seed foi atualizado e o Admin Panel foi usado para corrigir os dados existentes.
**Prevenção:** Ao criar features que dependem de configurações de banco (flags, enums, actions), atualizar imediatamente o `seed.ts` para que novos ambientes de dev já nasçam funcionais.

### [2026-01-22] - [REACT-PDF] Geração de PDF com Dados Dinâmicos

**Contexto:** Necessidade de gerar um PDF "Capa de Estágio" que reflete dados editáveis pelo aluno (Supervisor, Atribuições).
**Solução:** Implementação de um fluxo híbrido:

1. Formulário de Edição (`/editar`) que salva no banco via Server Action.
2. Rota de PDF (`/pdf/route.tsx`) que lê do banco atualizado e renderiza o template `@react-pdf`.
**Prevenção:** Não passar dados complexos via URL params para o gerador de PDF. Sempre persistir primeiro, depois gerar o documento a partir do ID do registro.

### [2026-01-22] - [UX] Badge Color Standardization

**Contexto:** O status "ATIVO" aparecia em múltiplas cores (azul, default, verde) dependendo da tela.
**Solução:** Criação de uma variante `success` explícita no componente `Badge` (`bg-green-600`) e padronização global.
**Prevenção:** Evitar classes de cores hardcoded (`bg-green-500`) nos componentes de negócio. Usar sempre variantes do Design System (`variant="success"`) para garantir consistência.

### [2026-01-23] - [REACT-PDF] Erro `Component is not a constructor` no Next.js App Router

**Contexto:** Ao tentar gerar PDF no server side (`route.tsx`), ocorria o erro `TypeError: a.Component is not a constructor`. Isso acontece por incompatibilidade da versão 4.x do `@react-pdf/renderer` com a forma como o Next.js empacota componentes de servidor.
**Solução:**

1. Downgrade para `@react-pdf/renderer@3.4.4`.
2. Adição de configuração no `next.config.mjs`:

   ```js
   webpack: (config) => {
       config.resolve.alias.canvas = false;
       config.resolve.alias.encoding = false;
       return config;
   },
   experimental: {
       serverComponentsExternalPackages: ['@react-pdf/renderer'],
   },
   ```

**Prevenção:** Ao usar bibliotecas que dependem de Node.js streams ou binários (como PDF generation) no App Router, sempre configure `serverComponentsExternalPackages` e verifique issues de compatibilidade de versão.

### [2026-01-23] - [REACT-PDF] Layout e Quebra de Linha

**Contexto:** Labels longos ("MODALIDADE DO ESTÁGIO") quebravam linha em colunas estreitas (25%), desformatando o PDF.
**Solução:** Ajuste fino de layout: aumentar largura da label para 30% e, crucialmente, reduzir a fonte apenas desses labels para 9pt.
**Prevenção:** Em geração de PDF, não confie no "auto layout". Teste com os maiores valores possíveis e defina larguras fixas ou reduções de fonte preventivas.

### [2026-01-23] - [UX] Prazos e Datas Nulas

**Contexto:** O prazo de uma etapa não aparecia quando `dataLimite` era null no banco (estágios ativados em lote ou sem trigger específico).
**Solução:** Implementação de "Fallback de Cálculo": se `dataLimite` for null, calcular em tempo de execução (`updatedAt` + `prazoDias`). Se ainda assim falhar, exibir "A definir" em vez de esconder o campo.
**Prevenção:** Nunca confie que cronogramas futuros estarão populados no banco. Sempre tenha lógica de UI para lidar com datas indefinidas ou calculá-las on-the-fly.

### [2026-01-23] - [UI] Consistência de Botões de Ação

**Contexto:** Botões de ações críticas ("Preencher Plano") tinham estilo secundário (`outline`), passando despercebidos comparados a outros ("Emitir Capa").
**Solução:** Padronização visual para usar sempre o estilo "Call to Action" (Primary, Large, Shadow) para a *próxima ação imediata* do aluno, independente de qual seja.
**Prevenção:** A hierarquia visual deve seguir a prioridade da tarefa do usuário, não o tipo de documento. Se é a única coisa que ele pode fazer agora, deve ser o botão mais chamativo.

### [2026-01-24] - [UX/LOGIC] Lógica de Stepper e Status "Concluído"

**Contexto:** O componente Stepper usava um valor hardcoded (8) para determinar se todas as etapas estavam concluídas. Isso causava falha visual (último step não ficava verde) quando o número real de etapas diferia.
**Solução:** Implementação de lógica dinâmica: `Current Step = First Pending Step ID` OU `Total Steps + 1` se tudo aprovado.
**Prevenção:** Em componentes de progresso sequencial, nunca assuma um número fixo de passos. Calcule sempre `Total + 1` como o estado de "Checkmate/Vitória".

### [2026-01-24] - [CSS/MATH] Overflow em Barra de Progresso

**Contexto:** Ao definir o passo atual como `Total + 1`, o cálculo de largura da barra de progresso `(Current / Total) * 100` resultava em >100%, quebrando o layout visual.
**Solução:** Uso de `Math.min(100, ...)` e `clamp` para garantir que a barra nunca exceda 100%.
**Prevenção:** Qualquer cálculo de porcentagem para UI deve ter limites superiores e inferiores explícitos (clamp).

### [2026-01-24] - [LOGIC] Reversão de Status (Undo)

**Contexto:** Professores precisavam reverter uma etapa concluída ("ATIVO") para correções ("EM_ANALISE"). Apenas mudar o status não era suficiente, pois campos como `dataConclusao` e `observacoes` antigos persistiam.
**Solução:** Criação de Action específica `revertStage` que limpa os metadados (`dataConclusao: null`) ao voltar o status, garantindo um estado limpo para nova avaliação.
**Prevenção:** "Desfazer" uma ação de negócio geralmente exige mais do que apenas reverter uma flag; é preciso limpar os efeitos colaterais daquela ação (datas, assinaturas).

### [2026-01-24] - [DB/OPS] Limpeza Real de Produção (TRUNCATE vs DELETE)

**Contexto:** Para testes finais, foi necessário limpar o banco. O uso de `DELETE` ou scripts parciais deixava IDs inflacionados (ex: Aluno ID 50), o que é feio para uma entrega final.
**Solução:** Uso de `TRUNCATE TABLE ... RESTART IDENTITY CASCADE`. O `RESTART IDENTITY` é crucial para resetar as sequences auto-incrementais para 1.
**Prevenção:** Em scripts de "Clean Slate" para produção/homologação, sempre use `RESTART IDENTITY` para dar a sensação de sistema novo em folha.

### [2026-01-24] - [SECURITY] Cadastro de Professores

**Contexto:** O formulário de cadastro de novos professores não deve ser público. O cadastro indiscriminado poderia permitir que alunos se passassem por professores.
**Solução:** Remoção/Omissão da rota pública de cadastro de professores (`/auth/cadastro/professor`). A criação de contas de orientadores deve ser feita exclusivamente via Admin ou scripts de seed, garantindo controle institucional.
**Prevenção:** Em sistemas acadêmicos, a role "Professor" é de alta confiança. Nunca exponha self-service registration para roles administrativas ou de supervisão sem validação manual.

### [2026-02-02] - [UI/CALENDAR] Timezone Shift em Componentes de Data

**Contexto:** Ao passar datas do banco (UTC) para o componente de calendário (React DayPicker + date-fns), o locale do navegador aplicava offset (-3h), fazendo com que feriados aparecessem no dia anterior (ex: 25/12 virava 24/12).
**Solução:**

1. Tratamento da data como string ISO fixa (`date.toISOString().split('T')[0]`) para comparação, ignorando o objeto Date local do JS.
2. Adição de `locale={ptBR}` explícito no componente Calendar.
**Prevenção:** Em calendários, nunca use `date.toString()` ou `format()` do date-fns diretamente em objetos Date vindos do banco sem antes normalizar ou forçar UTC, especialmente em checks de igualdade de dia.

### [2026-02-02] - [UX/AUTH] Feedback de Erro de Login Persistente

**Contexto:** A mensagem de erro "Invalid login credentials" retornada pelo Supabase era exibida estaticamente. Se o usuário errasse novamente, ele não recebia feedback visual de nova tentativa, pois a mensagem já estava lá.
**Solução:**

1. Substituição do div de erro por `useToast`.
2. Adição de timestamp ao state do form action para forçar re-render do `useEffect` mesmo se a mensagem de erro for idêntica.
3. Tradução das mensagens de erro do backend no frontend antes de exibir.
**Prevenção:** Para feedback de ações repetitivas (como login), use notificações efêmeras (Toasts) ou garanta que o estado de erro seja "limpo" ou "atualizado" visualmente a cada tentativa.

---

### [2026-03-07] - [LOGIC] Reset de Etapa Inicial (Stage 1)

**Contexto:** O sistema permitia retroceder apenas etapas concluídas. Para a Etapa 1, se o aluno cometia um erro, o professor não conseguia "resetar" o status para Pendente pois não havia etapa anterior.
**Solução:** Ajuste na `revertStage` para identificar se não há etapas ATIVAS e, nesse caso, permitir o "reset" da primeira etapa encontrada (que esteja em análise ou rejeitada), limpando seus metadados.
**Prevenção:** Em fluxos sequenciais, o estado "Zero" (primeira etapa) deve ser tratável como um caso especial de reversão/reset.

### [2026-03-07] - [PRISMA] Atualização Multi-Entidade em Correções

**Contexto:** A correção da Capa do Estágio envolvia campos de tabelas diferentes (`CampoEstagio` e `ContratoEstagio`). A primeira implementação atualizava apenas dados do supervisor.
**Solução:** Expansão da Server Action `updateEstagioAction` para aceitar todos os campos editáveis e executar um `prisma.$transaction` atualizando as duas tabelas simultaneamente, garantindo a integridade dos dados da empresa e do contrato (modalidade, carga horária).
**Prevenção:** Sempre verificar se um formulário de "Edição de Dados" abrange todas as entidades relacionadas que o usuário espera alterar.

### [2026-03-07] - [UX] Contraste em Botões com Bordas Coloridas (Amber)

**Contexto:** Botões `variant="outline"` com cores customizadas (texto âmbar) perdiam contraste no hover, pois o texto permanecia âmbar e o fundo ficava uma cor muito clara, ou o usuário perdia a percepção de clique.
**Solução:** Forçar `hover:bg-amber-600 hover:text-white` em botões de alerta/notificação para garantir contraste máximo e feedback visual claro de que o botão está selecionado.
**Prevenção:** Testar acessibilidade e contraste de hover em todos os botões que não seguem as variantes padrão do Shadcn.

### [2026-03-11] - [LOGIC/DOMAIN] Cálculo de Prazos em Fluxos Sequenciais

**Contexto:** O cálculo de prazo das etapas (ex. "Plano de Atividades") estava incoerente. O sistema somava o `prazoDias` à data `updatedAt` do próprio registro da etapa pendente. Como o `updatedAt` muda a cada alteração ou geração do placeholder, o prazo "deslizava" e não correspondia à realidade.
**Solução:** Refatoração do motor de cálculo de datas limite no frontend (Dashboard, Relatórios) para ancorar o início do prazo na `dataConclusao` da etapa imediatamente anterior (ou `dataInicioPrevista` do contrato, se for a Etapa 1).
**Prevenção:** Em sistemas de *workflow* baseados em pré-requisitos, nunca utilize campos transientes como `updatedAt` do próprio alvo para calcular SLAs ou prazos bloqueantes. Sempre adote eventos imutáveis consolidados (data finalização da trava anterior) como fita de largada do cronômetro.

### [2026-03-22] - [AI/INTEGRATION] OpenRouter Model Routing e Erros 400

**Contexto:** Ao tentar usar IA gratuita via OpenRouter, a definição de um modelo preview específico (`gemini-2.0-flash-lite...`) retornava Erro 400 (Invalid Model ID), indicando indisponibilidade genérica para a chave/plano atual.
**Solução:** Configurar o parâmetro dinâmico `model: "openrouter/auto"` na payload da requisição. Isso permite que a infraestrutura selecione automaticamente o melhor modelo gratuito (como o Mistral 7B) garantidamente disponível para a conta. Inserida também uma trava no prompt ("DEVE estar em Português do Brasil") para inibir respostas em inglês que costumam ser padrão.
**Prevenção:** Em integrações com agregadores de IA cujo foco seja o "free tier", utilize configurações "auto" para evitar quebra silenciosa de modelos depreciados ou preview. Forçe o idioma local explicitamente no system prompt.

### [2026-03-22] - [NEXTJS/HMR] Erro de RPC Catch em Novas Server Actions

**Contexto:** Ao criar uma nova Server Action (`aprimorarAtividadesComIA`) com o servidor Next.js (`npm run dev`) ativamente rodando, o Client Component lançou um erro silencioso para o bloco `catch` ("Erro na conexão com a IA") logo na primeira tentativa.
**Solução:** O erro aconteceu porque o bundler gerou um novo ID para a RPC Server Action no backend, porém na árvore local daquele momento o cliente desconhecia esse ID. Bastou realizar um Hard Refresh (F5) para ressincronizar os índices Client-Server.
**Prevenção:** Ao invocar uma Server Action recém-escrita num botão React (Client), lembre-se de recarregar a visualização no seu navegador antes para mapear o bundle dinamicamente gerado.

### [2026-03-30] - [LOGIC/DOMAIN] Cálculo de Prazos Dinâmico e Descarte do `dataLimite` Estático

**Contexto:** Prazos de avaliação e preenchimento de relatórios estavam apresentando inconsistências (visuais e lógicas) caso atualizados via status ou triggers manuais, ancorando em propriedades temporais sujas. O metadado isolado `dataLimite` mascarava recomputos reais dependentes do fim da atividade extra.
**Solução:** Abandono arquitetônico resoluto da propriedade `dataLimite` estática na camada Desktop Web; passamos a inferir ativamente (on-the-fly) a data somando a última `dataAtividade` (diário) do sistema e suas próprias heurísticas de tolerância da `EtapaDefinicao` (o "prazoDias" nominal).
**Prevenção:** O padrão é claro. Prazos cuja nascente se referenciam ativamente no final da etapa alheia (desenvolvimento de relatórios via diário letivo) tornam sua estabilidade infinitamente mais barata de calcular em "Views"/"Componentes de React" via derivação matemática rápida, sem correr risco de desatualização de Estado Bancário em cascata.

### [2026-03-30] - [JS/DATE] Condicionais de Bloqueio Protegidos Hibridamente (Timezone Trap / Vercel Edge)

**Contexto:** A trava de relatórios operava `new Date() <= dataDaUltimaAtividade`, desengatando permissões pelo simples passar das horas em "UTC-0" dentro da infraestrutura Cloud. Logo, estudantes teriam preenchimentos autorizados antecipadamente à noite de Brasília.
**Solução:** Utilização irrestrita da variável protetora `.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"})` para qualquer rotina de Server Component dependente de "Hoje vs Amanhã" antes do re-cast puro do objeto Date em milissegundos localizados.
**Prevenção:** Não defina "Today" em Cloud Hosts se a condição de liberação temporal for imperativamente guiada aos residentes GMT-3 (Ex: dia oficial das atividades do Brasil vira 3 horas do outro em Edge Global). Declare sua âncora textual local explicitamente.

### [2026-03-30] - [UX/UI] Interceptação Visual Falsa pelo Paradigma "Disabled Buttons"

**Contexto:** Para transmitir proibições de formulários com base em datas ("Abre amanhã"), o botão principal de tela era envelopado na macro nativa `disabled={true}`, derrubando contrastes (Opacidade < 50%) para legibilidade catastrófica, mascarando um comunicado de valor informativo como falha de UI.
**Solução:** Refatoração sem remorso. Seletividade de div/badges exclusivas de status (`bg-amber-100` e alerta texturado), separando categoricamente "Call to Action impossível temporariamente" de "Painel Dinâmico Informativo".
**Prevenção:** Componentes Desabilitados do Core UI enviam um sinal subconsciente de inoperabilidade sem sentido prático. Se você deseja evidenciar o "Por que do bloqueio", afirme isso abertamente injetando Cores/Design que favoreçam o Contraste e a Informação.
