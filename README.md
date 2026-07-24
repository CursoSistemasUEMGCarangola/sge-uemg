# SGE - Sistema de Gestão de Estágios (UEMG Carangola)

O **SGE (Sistema de Gestão de Estágios)** é uma plataforma web desenvolvida como um Projeto de Extensão para a UEMG (Unidade Carangola), sob coordenação do Prof. Nilton Freitas Junior (Registro SIGA 26407). Seu objetivo é centralizar e automatizar o fluxo de aprovação das etapas de estágios curriculares do curso de Sistemas de Informação, substituindo o uso fragmentado de planilhas e formulários por um sistema unificado.

## Principais Funcionalidades

- **Controle de Fluxo (8 Etapas):** Acompanhamento desde a submissão do Termo de Compromisso até a entrega do Relatório Final.
- **Perfis de Acesso (RBAC):** Interfaces dedicadas para Alunos, Professores (Orientadores) e Administradores.
- **Geração Client-Side de Documentos:** Geração de relatórios e PDFs diretamente no navegador, poupando recursos do servidor (Zero Cost).
- **Notificações Inteligentes:** Alertas automatizados para estagiários sobre prazos de relatórios.
- **Privacidade By Design:** O sistema foca em metadados. Não há armazenamento direto de arquivos físicos (pdf, docx) no banco de dados, protegendo informações sensíveis.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS & shadcn/ui
- **Banco de Dados:** PostgreSQL (via Supabase)
- **ORM:** Prisma
- **Autenticação:** Supabase Auth
- **Geração de PDF:** `@react-pdf/renderer`
- **Deploy:** Vercel

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
