# SGE - Sistema de Gestão de Estágios (UEMG Carangola)

O **SGE (Sistema de Gestão de Estágios)** é uma plataforma web desenvolvida como um Projeto de Extensão para a UEMG (Unidade Carangola), sob coordenação do Prof. Nilton Freitas Junior (Registro SIGA 26407). Seu objetivo é centralizar e automatizar o fluxo de aprovação das etapas de estágios curriculares do curso de Sistemas de Informação, substituindo o uso fragmentado de planilhas e formulários por um sistema unificado.

## Principais Funcionalidades

- **Controle de Fluxo (8 Etapas):** Acompanhamento rigoroso desde a submissão do Termo de Compromisso até a entrega e homologação do Relatório Final.
- **Perfis de Acesso (RBAC):** Interfaces dedicadas para Alunos, Professores (Orientadores) e Administradores.
- **Dashboard Interativo do Orientador:** 5 cards métricos que operam como filtros dinâmicos em $O(1)$ (Pendentes, Rejeitados, Ativos, Em Andamento e Concluídos), com navegação acessível por teclado (a11y).
- **Mensageria Contextual Segura:** Envio de comunicados oficiais e orientações pedagógicas sensíveis ao filtro ativo em tela, com dupla confirmação, sanitização anti-XSS e entrega no e-mail alternativo dos alunos.
- **Ranking de Empresas Parceiras:** Mapeamento histórico agregado de empresas conveniadas por polo/curso com saneamento textual de duplicidades (*Rename-in-place*).
- **Validação Documental Antifraude:** Assinatura digital criptográfica (Hash SHA-256) impressa em relatórios para verificação instantânea de autenticidade.
- **Geração Client-Side de Documentos:** Geração de relatórios e PDFs diretamente no navegador via `@react-pdf/renderer`, poupando recursos de infraestrutura (Zero Cost).
- **Privacidade By Design & LGPD:** O sistema armazena metadados de auditoria e links autenticados, evitando a guarda direta de arquivos desnecessários no banco de dados.

## Tech Stack

- **Framework:** Next.js 14 (App Router, Server Actions)
- **Linguagem & Tipagem:** TypeScript 5 (Strict Mode)
- **Validação de Schemas:** Zod
- **Estilização & UI:** Tailwind CSS, shadcn/ui & Radix UI Primitives
- **Banco de Dados:** PostgreSQL (via Supabase Pooling)
- **ORM:** Prisma
- **Autenticação & Sessão:** Supabase Auth (`@supabase/ssr`)
- **Geração de PDF:** `@react-pdf/renderer`
- **Serviço de Mensageria:** Brevo API HTTP (com fallback para Nodemailer SMTP)
- **Deploy & CI/CD:** Vercel

## Documentação do Projeto

- [Manual do Orientador](file:///manual_orientador.md)
- [Manual do Estagiário](file:///manual_estagiario.md)
- [Roadmap de Entregas](file:///ROADMAP.md)
- [Lições Aprendidas & Base de Conhecimento](file:///lessons_learned.md)

## Como Rodar Localmente

1. Clone o repositório:
   ```bash
   git clone <repo_url>
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente baseadas no `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Suba o banco de dados e gere o Prisma Client:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
5. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Licença

Este projeto é desenvolvido para a Universidade do Estado de Minas Gerais (UEMG).

