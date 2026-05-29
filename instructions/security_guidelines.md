# Diretrizes de Segurança e Anti-Padrões (RAG Knowledge Base)

Este documento atua como base de conhecimento de segurança para processos de desenvolvimento (RAG). Ele contém padrões arquiteturais de segurança e lista as principais vulnerabilidades identificadas em projetos anteriores (como no SGE-UEMG), focando no ecossistema Next.js (App Router), Server Actions e Supabase/Prisma. 

**Ao iniciar o desenvolvimento de qualquer funcionalidade, as regras abaixo devem ser verificadas e estritamente aplicadas.**

---

## 1. Validação de Propriedade (Ownership) em Server Actions
**Vulnerabilidade:** IDOR (Insecure Direct Object Reference). Ocorria quando uma Server Action recebia um ID (ex: `contratoId`) e checava apenas se o usuário tinha o perfil (role) correto, mas falhava em checar se aquele registro específico *pertencia* ao usuário autenticado.
**Como Prevenir:**
- Toda Server Action ou Endpoint da API que opere sobre um recurso de usuário (leitura, escrita ou deleção) DEVE garantir que o ID do recurso cruzado com o ID da sessão autenticada.
- **Padrão Obrigatório:** Crie helpers de segurança genéricos no sistema (ex: `assertUserOwnsResource`) e chame-os no topo da action antes de processar os dados. Nunca confie em IDs passados via cliente sem validá-los no banco.

## 2. Autenticação e Autorização em Rotas de Exportação (PDFs, CSVs)
**Vulnerabilidade:** Exposição de PII (Personally Identifiable Information). Endpoints `GET` sob a pasta `app/api/documents/[id]/route.ts` renderizavam documentos confidenciais apenas recebendo um parâmetro na URL, permitindo que qualquer pessoa não autenticada raspasse dados sensíveis.
**Como Prevenir:**
- Rotas que geram ou exportam dados pessoais NÃO DEVEM ser públicas, a não ser que intencionalmente projetadas para tal (ex: validação de certificado via hash).
- **Padrão Obrigatório:** Todo `route.ts` (`GET`/`POST`) deve possuir extração de sessão (`supabase.auth.getUser()`) e validação de permissão.

## 3. RBAC de Borda (Edge Middleware) e Proteção de Layouts
**Vulnerabilidade:** Falha na aplicação de Role-Based Access Control (RBAC). A proteção de áreas inteiras do sistema (como `/admin`) ficava restrita ao React (Layouts/Pages), permitindo, por exemplo, que usuários desautorizados batessem nos componentes e consumissem recursos antes de serem barrados.
**Como Prevenir:**
- **Padrão Obrigatório:** Use a funcionalidade `user_metadata` do Supabase JWT para gravar a "Role" do usuário no momento do cadastro.
- No `middleware.ts`, valide a claim no token (ex: `user.user_metadata?.role`) e aplique o redirecionamento imediato no "Edge" (borda), impedindo rotas administrativas de serem sequer processadas pelo Next.js em perfis de usuários não autorizados.

## 4. Tratamento de Erros e Vazamento de Dados Internos
**Vulnerabilidade:** Exposição de stack traces ou erros de banco de dados (ex: códigos do Prisma como "P2002") repassados diretamente nas mensagens de erro das Server Actions para o frontend.
**Como Prevenir:**
- Jamais repasse o objeto `error.message` para o cliente na instrução `catch`.
- **Padrão Obrigatório:** Intercepte exceções, faça log do erro internamente com `console.error` (cuidando com PII) e retorne uma mensagem de erro genérica sanitizada para o usuário (ex: *"Erro interno no servidor. Tente novamente mais tarde."*). 
- Erros de banco de dados (duplicação de campos) devem ser tratados ativamente com base em seus códigos (ex: tratar Prisma `P2002` explicitamente sem repassar os metadados brutos).

## 5. Proteção de Custos e Terceiros (Rate Limiting e APIs)
**Vulnerabilidade:** Server Actions que disparam requisições a serviços de terceiros (ex: Google Gemini, AWS, APIs pagas) expostas a usuários anônimos ou sem limites, podendo esgotar o *Free Tier* do sistema ou estourar orçamentos.
**Como Prevenir:**
- **Padrão Obrigatório:** Nenhuma integração de terceiros deve poder ser invocada de forma desautenticada.
- Avalie se cabe a implementação de Rate Limiting por endereço IP/ID do usuário na action de consumo de IA ou envio de SMS/Emails em massa.

## 6. Logs Limpos e Sem PII
**Vulnerabilidade:** Quebra de privacidade/LGPD por impressão de dados pessoais. Ocorria ao fazer logs rotineiros no backend exibindo IDs pessoais de usuário ou e-mails de clientes nas plataformas de hosting (como a Vercel).
**Como Prevenir:**
- Logs em produção nunca devem conter chaves primárias UUID, CPFs, E-mails ou chaves de sessão. 
- Use logs genéricos de fluxo de controle, e reserve a correlação de IDs anonimizados a sistemas de tracking robustos (como Datadog/Sentry) caso seja essencial para o negócio.

## 7. Blindagem Básica HTTP e Políticas de Senha
**Vulnerabilidade:** Senhas com complexidade muito baixa e omissão de segurança de cabeçalhos de rede comuns em frameworks web modernos.
**Como Prevenir:**
- A camada de infraestrutura (`next.config.mjs`) deve sempre exportar os Headers HTTP de segurança recomendados (ex: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, etc.).
- A validação Zod (Schemas) deve sempre forçar o mínimo de 8 caracteres em senhas como conformidade básica à LGPD/NIST.

## 8. Segurança de Supply Chain e Gerenciamento de Dependências
**Vulnerabilidade:** Bibliotecas desatualizadas (como versões antigas do Next.js ou utilitários) permitindo vetores de ataque como DoS, SSRF e Cache Poisoning.
**Como Prevenir:**
- **Padrão Obrigatório:** Mantenha um cronograma rotineiro para executar `npm audit`. Para ecossistemas grandes como Next.js, fique sempre atento às releases `patch` que contêm Security Fixes essenciais, sem quebrar retrocompatibilidade.

## 9. Proteção com Row Level Security (RLS) no Banco de Dados (Supabase)
**Vulnerabilidade:** Dependência exclusiva da camada de aplicação (App Router) para controle de acesso, deixando as tabelas abertas na API pública REST do Supabase.
**Como Prevenir:**
- **Padrão Obrigatório:** Sempre habilite o Row Level Security (RLS) via SQL (`ALTER TABLE tabela ENABLE ROW LEVEL SECURITY;`) em todas as tabelas públicas, agindo como um *Default Deny* contra acessos não autenticados via cliente (roles `anon` ou `authenticated` sem política de acesso), mesmo que toda a lógica de negócio esteja rodando no lado do servidor com a chave `Service Role`.
