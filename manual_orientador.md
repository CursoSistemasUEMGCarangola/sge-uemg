# Manual do Professor Orientador

## Sistema de Gestão de Estágios do Curso de Sistemas de Informação

## UEMG - Unidade Carangola

Bem-vindo ao **SGE - Sistema de Gestão de Estágios do Curso de Sistemas de Informação da UEMG - Unidade Carangola**! Este manual foi desenvolvido para guiar você, professor orientador, em todas as suas atribuições de auditoria, acompanhamento e homologação dos estágios obrigatórios sob sua responsabilidade.

---

## 1. Fluxo de Acesso e Perfil

### 1.1. Cadastro e Login

* **Criação de Contas:** Para garantir a segurança institucional do sistema, o cadastro de novos orientadores é de uso restrito. **Apenas o Administrador do sistema pode cadastrar contas de professores.** Se você ainda não possui acesso, solicite a criação ao administrador da unidade.
* **E-mail Alternativo Obrigatório:** O administrador exigirá um **E-mail Alternativo** pessoal (como Gmail, Outlook, etc.) durante a criação do seu cadastro. Esse e-mail alternativo é fundamental e obrigatório para viabilizar as comunicações da plataforma (como a recuperação de senha).
* **Fazer Login:** Acesse a página de login, insira seu e-mail institucional e a senha provisória enviada. Defina uma nova senha imediatamente após o primeiro acesso para garantir a segurança.

> [!IMPORTANT]
> **Por que o E-mail Alternativo é obrigatório e crucial?**
> Os servidores de e-mail institucional da UEMG possuem políticas rígidas de segurança que costumam bloquear o recebimento de mensagens automáticas vindas de sistemas externos. 
> Para garantir que você consiga receber os links de **recuperação de senha** e as notificações da plataforma, o sistema exige um e-mail alternativo pessoal. Todas as comunicações automáticas da plataforma voltadas para você serão enviadas para esse endereço.

### 1.2. Gerenciamento da Conta

Na aba **"Minha Conta"**, você pode atualizar seu **e-mail alternativo pessoal** (obrigatório para recebimento de notificações), seu telefone de contato, alterar sua senha de acesso e revisar suas informações básicas de cadastro.

---

## 2. Painel de Controle (Dashboard do Orientador)

Ao fazer login com o perfil de **Professor**, o sistema redirecionará você automaticamente para o Painel de Controle administrativo (`/admin`), exibindo uma interface otimizada para a gestão de turmas e auditoria de contratos.

### 2.1. Minhas Orientações (Gestão de Vínculos)

No topo do painel, você verá o card **"Minhas Orientações"**. Ele lista todos os seus vínculos de orientação ativos para o semestre letivo (ex: Estágio Supervisionado I - 7º Período).

* Cada cartão exibe: Nome do estágio, curso, unidade acadêmica, semestre letivo correspondente e período vinculado.
* **Filtragem Rápida:** Clique em um dos cartões de orientação para filtrar a tabela de alunos e os indicadores de estatísticas. Apenas os alunos daquela turma/semestre serão exibidos. Clique novamente para desmarcar e ver todos.

### 2.2. Indicadores Métricos (Stats)

Os indicadores são atualizados dinamicamente de acordo com o filtro aplicado:

* **Pendentes de Aprovação:** Contratos novos cadastrados por alunos que aguardam seu deferimento para iniciarem as etapas oficiais de estágio.
* **Estágios Ativos:** Alunos que já tiveram o contrato aprovado e estão progredindo entre as Etapas 1 e 8.
* **Alertas/Rejeitados:** Quantidade de etapas que foram sinalizadas com correções necessárias e estão no momento sob ação do aluno.

### 2.3. Tabela Geral de Acompanhamento

Lista todos os estagiários sob sua orientação, exibindo:

* **Aluno:** Nome completo.
* **Matrícula:** Registro acadêmico oficial do estudante.
* **Estágio / Curso:** Detalhes da disciplina e do Campo de Estágio (Empresa).
* **Etapa Atual:** Indica em qual das 8 etapas o aluno está parado e o status específico da etapa (`PENDENTE`, `EM_ANALISE` ou `REJEITADO`).
* **Status do Contrato:** Status geral do estágio (`ATIVO`, `PENDENTE` ou `REJEITADO`).
* **Alerta de Atraso:** Caso o aluno ultrapasse o prazo de conclusão dinâmica da sua etapa atual, o badge **"ATRASADO"** em vermelho se acenderá automaticamente nesta tabela, chamando sua atenção para auditoria.

---

## 3. Gestão e Auditoria de um Estágio (Tela de Detalhes)

Ao clicar no botão **"Acessar"** em qualquer linha da tabela de acompanhamento, você entra na página de detalhes do estágio do aluno. Esta tela está dividida em duas colunas funcionais:

### 3.1. Dados Consolidados do Estágio (Coluna da Esquerda)

Exibe todas as informações declaradas pelo aluno no início do processo:

* Nome e CNPJ da Empresa (Campo de Estágio).
* Nome, cargo, e-mail, telefone, formação e titulação acadêmica do Supervisor da Empresa.
* Detalhes do Contrato: Modalidade (Presencial/Híbrido/Remoto), carga horária diária (em horas), data de início e previsão de término.
* **Atribuições:** Descrição das atividades que o estagiário desenvolverá na empresa.

### 3.2. Acompanhamento Lógico e Progresso (Coluna da Direita)

Aqui você gerencia o fluxo cronológico das 8 etapas sequenciais:

* **Stepper de Progresso:** Um indicador visual de 1 a 8 que mostra graficamente em qual etapa o aluno está.
* **Histórico de Notificações:** Linha do tempo exibindo todos os feedbacks corretivos e observações passadas enviados a este aluno, facilitando o acompanhamento de reincidências de erros.
* **Card de Ação Contextual (O Cérebro do Fluxo):** Modifica-se automaticamente dependendo do status atual do estágio do aluno.

---

## 4. Como Auditar as Etapas e Tomar Ações

Conforme o estagiário avança, o card de ação contextual solicitará sua análise ou exibirá o progresso. Existem três fluxos principais que você deve dominar:

### 4.1. Aprovação Inicial do Contrato (Status PENDENTE)

Quando o aluno inicia um novo processo de estágio no sistema, o contrato nasce com status **PENDENTE**.

* O card de ação informará: *"Este estágio aguarda sua aprovação para iniciar."*
* **Ação:** Analise as atribuições e dados cadastrais. Clique no botão de ações rápidas no topo e selecione **"Aprovar"** para ativar o contrato e liberar o aluno para a **Etapa 1**.

### 4.2. Fluxo de Análise da Etapa Atual (Status EM_ANALISE)

O aluno conclui sua parte digital no sistema (ex: preencher a capa, lançar o diário, digitar o relatório) e o status da etapa atual muda para **EM_ANALISE**.
O sistema disponibiliza os dados coletados na tela para sua auditoria:

* **Na Etapa 1:** Link e dados da capa gerados pelo aluno para você validar com base no TCE físico entregue.
* **Na Etapa 4 (Plano de Atividades):** Exibe uma tabela com o diário completo de atividades diárias lançadas pelo aluno (data, horas realizadas e a descrição das atividades), permitindo verificar se a carga horária (ex: 150h) foi cumprida sem infrações (como lançamentos em feriados ou finais de semana).
* **Na Etapa 6 (Relatório Final):** Exibe o texto descritivo de autoavaliação redigido pelo estagiário.

Após ler e conferir se o documento físico correspondente foi protocolado e assinado, você tomará uma das ações:

1. **Aprovar Etapa:** Registra que o documento físico/digital está em conformidade. O sistema grava a data de conclusão, avança o aluno para o próximo passo no Stepper e calcula automaticamente o prazo da próxima etapa.
2. **Rejeitar Etapa:** Caso haja erros (ex: falta de assinaturas físicas, descrição inadequada, rasuras). O sistema abre um diálogo onde você deve descrever o feedback de correção. O status da etapa muda para `REJEITADO` e o aluno recebe um alerta destacado em vermelho no painel dele para fazer o reajuste.

### 4.3. Lógica de Correção de Capa (Ajustes na Etapa 1)

Caso você identifique erros de digitação nos dados da empresa ou supervisor durante a Etapa 1, ao clicar em **"Rejeitar"** e justificar o motivo, o sistema desbloqueará automaticamente todos os campos do formulário para o aluno. Ele poderá ajustar as informações necessárias e submeter novamente sem que você precise cancelar o contrato.

### 4.4. Ações de Emergência e Correções Lógicas

Na parte inferior do card de ações da etapa, você conta com ferramentas para ajustar o fluxo em casos excepcionais:

* **Concluir Etapa Manualmente:** Permite forçar o avanço de uma etapa mesmo se o aluno não tiver realizado a ação digital correspondente (útil para destravar casos específicos autorizados pela coordenação).
* **Reverter Etapa (Desfazer Ação):** Se você aprovou uma etapa incorretamente, clique em **"Reverter Etapa"**. Esta ação limpa os metadados (como a data de conclusão da etapa anterior) e retorna o aluno para o estado pendente da etapa em questão, preservando a coerência dos dados e do histórico.

---

## 5. Sistema de Comunicação e Alertas por E-mail (Nodemailer)

Para evitar atrasos e garantir o fluxo contínuo das etapas de auditoria física, o sistema possui uma integração nativa para envio de e-mails em massa ou individuais.

### 5.1. Alertas Individuais

* Se o aluno estiver atrasado ou precisar de uma notificação rápida sobre pendências físicas, entre na página de detalhes do estágio dele e clique no botão **"Enviar Alerta de Atraso"** (ícone de sino com envelope).
* O sistema enviará um e-mail para o **e-mail alternativo pessoal** cadastrado pelo aluno (com fallback para o institucional caso não esteja preenchido), cobrando a regularização da etapa atual pendente.

### 5.2. Alertas em Massa (Cobrança por Turma)

* Se você deseja realizar uma cobrança coletiva, selecione uma de suas orientações no painel inicial.
* Ao lado de *"Minhas Orientações"*, clique no botão **"Enviar Alertas em Massa"**.
* O sistema buscará todos os estagiários daquela turma selecionada que estejam com o status de etapa atrasado (com base no prazo dinâmico expirado) e enviará notificações em lote em segundo plano, sem travar sua navegação.

---

## 6. Regras de Ouro para o Orientador

1. **Validação de Documento Físico:** Lembre-se que o sistema é um rastreador de metadados. A aprovação digital da etapa de análise (`EM_ANALISE`) deve ser realizada **apenas após o recebimento e conferência física do documento assinado no setor de protocolo**.
2. **Prazos Dinâmicos:** Os prazos são ancorados na data de conclusão da etapa anterior. Fique atento aos alunos com o selo **"ATRASADO"** na sua dashboard e use as ferramentas de notificação por e-mail para cobrar a regularização acadêmica.
3. **Reversões Seguras:** O botão de reversão de etapa limpa com segurança as datas limites e registros transientes, garantindo que o banco de dados não fique inconsistente caso precise voltar atrás em uma aprovação.
