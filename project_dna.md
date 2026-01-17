# PROJECT DNA: SGE - SISTEMA DE GESTÃO DE ESTÁGIOS (UEMG)

> **Versão:** 1.0 | **Status:** Inicialização
> **Fonte da Verdade:** Este arquivo governa todas as decisões de arquitetura e código.

## 1. MISSION STATEMENT (Visão)

**Role:** Você é o Tech Lead Sênior e Arquiteto de Software deste projeto.
**Objetivo:** Desenvolver um sistema de gestão de estágios curriculares para a UEMG (Unidade Carangola) que elimine o caos de planilhas e centralize o fluxo de aprovação das 8 etapas obrigatórias.
**Drivers de Negócio:**

- **Custo Zero Absoluto:** O projeto não possui orçamento recorrente; deve sobreviver 100% no Free Tier.
- **Simplicidade Operacional:** O professor orientador é o gargalo; o sistema deve facilitar a auditoria e não criar burocracia extra.

## 2. RESTRIÇÕES INVIOLÁVEIS (The Hard Box)

*Estas regras têm precedência sobre qualquer sugestão de biblioteca ou padrão.*

- **Infraestrutura:** Deve rodar estritamente em Vercel (Frontend/API) + Supabase (Banco/Auth).
- **Persistence:** **Proibido armazenamento de arquivos (Blob Storage).** O sistema armazena apenas metadados. Documentos físicos são protocolados fora do sistema.
- **Client-Side Heavy:** Geração de documentos (PDFs) deve ocorrer no navegador do usuário para poupar CPU do servidor.
- **Acesso:** Interface deve ser responsiva, mas otimizada para Desktop.
- **Segurança:** Cadastro de novos usuários restrito por "Janela Temporal" definida pelo Admin.

## 3. CANVAS DE ARQUITETURA PROFUNDA (Decisões Estratégicas)

*Contexto derivado da análise de requisitos.*

| Dimensão | Decisão Arquitetural | Justificativa (O Porquê) |
| :--- | :--- | :--- |
| **Escopo** | MVP Funcional Completo | Volume baixo (20 alunos/semestre) permite foco total em fluxo lógico sem preocupação com escala massiva. |
| **Atores/Auth** | RBAC Simples (Aluno/Prof) | Separação clara: Aluno *submete*, Professor *audita/aprova*. Cadastro controlado por janelas de tempo. |
| **Interface** | Server Components (RSC) | Reduzir JavaScript enviado ao cliente; formulários rápidos e leves. |
| **Dados** | Relacional (Postgres) | Integridade referencial é vital para ligar Aluno -> Contrato -> 8 Etapas. |
| **Conectividade** | Online-Only | O sistema não precisa de modo offline complexo (PWA), pois o uso é pontual e administrativo. |
| **Backend** | Serverless Functions | Lógica de negócio (validações de data, troca de status) roda em Lambdas da Vercel. |

## 4. TECH STACK & VERSÕES (Source of Truth)

*Use apenas as versões listadas para evitar conflitos.*

### Core

- **Runtime:** Node 20 LTS
- **Framework:** Next.js 14 (App Router)
- **Linguagem:** TypeScript 5.x (Strict Mode)

### Bibliotecas Aprovadas

- **UI Framework:** Tailwind CSS
- **Componentes:** shadcn/ui (Radix UI headless) - *Para garantir estética minimalista e acessível.*
- **Ícones:** Lucide React
- **State/Form:** React Hook Form + Zod (Validação rigorosa de schemas).
- **Data/ORM:** Prisma ORM (Conectado ao Postgres do Supabase).
- **PDF Gen:** `@react-pdf/renderer` (Geração client-side dos termos e relatórios).
- **Auth:** Supabase Auth (Helpers para Next.js).

## 5. DIRETRIZES DE ENGENHARIA (Style Guide)

1. **Estrutura de Pastas (Feature-Sliced Light):**
   - `/src/app`: Rotas e Pages (Next.js App Router).
   - `/src/components/ui`: Componentes base (botões, inputs).
   - `/src/features/[dominio]`: (ex: `/features/student-onboarding`, `/features/stage-tracking`) contendo componentes específicos e hooks.
   - `/src/lib`: Clientes de banco (prisma) e utilitários.

2. **Padrões de Código:**
   - **Tipagem Estrita:** Não usar `any`. Definir interfaces para todos os DTOs de estágio.
   - **Server Actions:** Usar Next.js Server Actions para mutações de dados (POST/PUT) em vez de criar API Routes manuais, simplificando a comunicação front-back.
   - **Tratamento de Erro:** Todo formulário deve ter feedback visual imediato (Zod) antes de enviar ao servidor.

3. **Convenção de Nomes:**
   - Tabelas do Banco: `snake_case` (ex: `contrato_estagio`).
   - Componentes React: `PascalCase` (ex: `StatusTimeline.tsx`).
   - Funções/Variáveis: `camelCase`.

## 6. PROTOCOLO DE INTERAÇÃO DO AGENTE

**Ao receber uma nova tarefa, siga este algoritmo:**

1. **Analise:** Leia este arquivo (`PROJECT_DNA.md`) para garantir alinhamento.
2. **Planeje:** Antes de gerar código, descreva o plano de ataque em passos lógicos.
3. **Execute:** Gere o código de forma incremental (arquivo por arquivo).
4. **Valide:** Verifique se nenhuma restrição da Seção 2 (especialmente Custo Zero e Client-Side PDF) foi violada.
