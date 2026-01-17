# ROADMAP: SGE - SISTEMA DE GESTÃO DE ESTÁGIOS

> **Status:** Planejamento
> **Baseado em:** `PROJECT_DNA.md` v1.0

Este documento define a estratégia de entrega incremental do SGE. Cada fase desbloqueia valor tangível e valida riscos técnicos antecipadamente.

---

## FASE 0: FOUNDATION (Bootstrap & Infra)

**Objetivo:** Estabelecer a infraestrutura "Zero Cost" na Vercel + Supabase e garantir um DX (Developer Experience) sólido.

- [ ] **Scaffold do Projeto:** Next.js 14, TypeScript 5, TailwindCSS.
- [ ] **Component Library:** Instalar `shadcn/ui` base (Button, Card, Input, Label, Toast).
- [ ] **Database Setup:** Inicializar projeto no Supabase e conectar via conexão pooling.
- [ ] **ORM Setup:** Configurar Prisma e criar primeira migration (`User` table).
- [ ] **CI/CD:** Pipeline básico conectada ao GitHub -> Vercel Deployment.
- [ ] **Infra Check:** Validar conexão Supabase -> Vercel para evitar "Cold Start" (Lição Aprendida: Implementar Ping/Retry se necessário).

**DoD (Definition of Done):** "Hello World" rodando na Vercel com banco conectado e componentes de UI básicos renderizando sem erros de hidratação.

---

## FASE 1: MODELAGEM & SEGURANÇA (The Backbone)

**Objetivo:** Definir a estrutura de dados relacional e o sistema de controle de acesso (RBAC).

- [ ] **Schema Design:** Modelar tabelas: `StudentProfile`, `ProfessorProfile`, `Internship`, `Step` (1-8).
- [ ] **Supabase Auth:** Configurar Provider (Google ou Magic Link).
- [ ] **Role Management:** Middleware para proteger rotas `/admin` vs `/student`.
- [ ] **Janela Temporal:** Implementar tabela de configuração `SystemConfig` para permitir/bloquear novos cadastros.
- [ ] **RLS Policies:** Configurar Row Level Security básica (Aluno vê seus dados, Prof vê tudo).

**DoD:** Usuário consegue logar e, dependendo do role, acessar apenas sua dashboard correspondente. Tentativas de cadastro fora da janela temporal são rejeitadas.

---

## FASE 2: FLUXO DO ALUNO (Input de Dados)

**Objetivo:** Permitir que o aluno inicie um processo de estágio e preencha dados.

- [ ] **Dashboard do Aluno:** Visualização do status atual e progresso geral.
- [ ] **Stepper UI:** Componente visual indicando as 8 etapas.
- [ ] **Forms Base:** Criar formulários para Etapa 1 (Cadastro/Termo). Use `react-hook-form` + `zod`.
- [ ] **Server Actions:** Implementar mutations para salvar rascunhos e enviar para aprovação.
- [ ] **Feedback UI:** Toasts de sucesso/erro e Empty States.

**DoD:** Aluno consegue iniciar um estágio, preencher a Etapa 1 e ver o status mudar para "Pendente de Aprovação".

---

## FASE 3: FLUXO DO PROFESSOR (Auditoria)

**Objetivo:** Ferramenta para o orientador validar documentos e destravar etapas.

- [ ] **Dashboard do Professor:** Lista de estagiários com filtros (Pendente, Aprovado).
- [ ] **Review Interface:** Tela de detalhe mostrando dados submetidos vs requisitos.
- [ ] **Actions:** Botões de Aprovar (avança etapa) ou Rejeitar (retorna com feedback).
- [ ] **Histórico:** Log simples de quem aprovou e quando.

**DoD:** Professor visualiza submissão da Fase 2, rejeita (com motivo) e depois aprova. Sistema avança aluno para Etapa 2.

---

## FASE 4: O "CORE" DAS 8 ETAPAS (Expansão)

**Objetivo:** Implementar a lógica específica das etapas restantes (Planos de Estágio, Relatórios).

- [ ] **Etapas Intermediárias:** Relatórios de atividades e avaliação.
- [ ] **Upload de Metadados:** Campos para registrar que documentos físicos foram entregues (Protocolo).
- [ ] **Validações de Negócio:** Regras de datas (ex: Data final > Data inicial).

**DoD:** Ciclo completo de 8 etapas funcional no banco de dados, do início ao fim do estágio.

---

## FASE 5: DOCUMENT ENGINE (Constraint: Client-Side)

**Objetivo:** Gerar PDFs oficiais no navegador para poupar computação serverless.

- [ ] **React-PDF Setup:** Configurar renderizador web (`@react-pdf/renderer`).
- [ ] **Templates:** Criar layouts para: Termo de Compromisso, Plano de Atividades, Ficha de Avaliação.
- [ ] **Data Mapping:** Preencher templates com dados do banco (Prisma -> Client Component).
- [ ] **Download Action:** Botão "Gerar PDF" na dashboard do aluno.

**DoD:** Aluno clica em "Gerar Termo", PDF é gerado no browser com dados reais e formatação correta, sem call pesado ao backend.

---

## FASE 6: POLISH & LAUNCH

**Objetivo:** Refinamentos finais, UX e preparação para produção.

- [ ] **UX Review:** Loading skeletons, transições suaves.
- [ ] **Error Handling:** Página 404/500 customizada.
- [ ] **Final RLS Audit:** Garantir que nenhum aluno acesse dados de outro.
- [ ] **Documentation:** README atualizado e guia de uso básico.

**DoD:** Projeto pronto para deploy final e entrega à UEMG.

---

## FASE 7: ADVANCED FEATURES & STABILITY

**Objetivo:** Ferramentas administrativas, refinamento de UX e robustez técnica.

- [ ] **Profile Management:** Adicionar campo telefone e página "Minha Conta".
- [ ] **Admin Tools:** Exportação de dados de contratos para CSV.
- [ ] **Interface Polish:** Implementar Empty States ricos e Loading Skeletons.
- [ ] **Database Resilience:** Mitigar falhas de conexão IPv6 (Prisma/Supabase) e garantir fallbacks.

**DoD:** Admin exporta relatórios, usuários gerenciam perfis e sistema recupera-se de erros de conexão.

---

## FASE 8: PUBLIC LANDING & ACCESS

**Objetivo:** Porta de entrada profissional e controle de acesso segmentado.

- [x] **Landing Page:** Home page pública com "Hero Section", "Diferenciais" e Call to Action.
- [x] **Blog/News:** Seção de artigos ou avisos na página inicial.
- [x] **Access Control:** Fluxos de login claros e distintos para Alunos e Professores.
- [x] **Student Registration:** Fluxo completo de cadastro do aluno com validações (Zod) e UI (Shadcn).

**DoD:** Visitante não-autenticado acessa Landing Page informativa; Aluno consegue se cadastrar e logar; Login redireciona para dashboard correta.
