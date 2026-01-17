# Regras de negócio #

Um sistema deve gerir os processos de estágios obrigatórios do curso de Sistemas de Informação, da Universidade do Estado de Minas Gerais – Unidade Carangola.

Existem vários estágios, como “Estágio Obrigatório 1”, “Estágio Obrigatório 2”, por exemplo, com possibilidade para outras denominações. Cada estágio está vinculado a uma turma específica do curso. Essas turmas são chamadas de “períodos”, que vão do “1º Período” até o “8º Período”. Uma turma só pode estar vinculada a um estágio.

Os estágios são ofertados em semestre letivos, como por exemplo 2026-1 (primeiro semestre de 2026), 2026-2 (segundo semestre de 2026) e assim por diante. É possível que em um período letivo sejam ofertados mais de um estágio.

Para cada estágio há uma carga horária total a ser cumprida pelos estagiários. Estágios podem ter cargas horárias diferentes.

Estagiários são discentes regularmente matriculados. O sistema precisa manter o nome completo dos estudantes, seu número de matrícula e o período que estão cursando. Com essa informação, será possível associar os discentes ao referido estágio, através do relacionamento entre o período letivo e o estágio correspondente. Também será possível identificar o semestre letivo a partir da identificação do estágio.

Estagiários devem cumprir seus estágios obrigatoriamente em um campo de estágio, que deve ser devidamente identificado. Campos de estágio são empresas, organizações ou instituições, públicas ou privadas, onde os estagiários desempenharão suas atividades. A identificação do campo de estágio requer os seguintes dados: razão social, nome de fantasia, telefone de contato, endereço de e-mail, nome completo do supervisor de campo, telefone do supervisor de campo, e-mail do supervisor de campo, cargo do supervisor de campo, área de formação do supervisor de campo, maior titulação do supervisor de campo (graduação, pós-graduação, mestrado, doutorado, pós-doutorado, outra (especificar)).

Estagiários podem cumprir seus estágios em modalidades diferentes. Um estágio pode ser cumprido na modalidade presencial, remoto, híbrido (parte remoto, parte presencial). Outras modalidades podem ser criadas no futuro. Um estagiário não pode cumprir duas modalidades diferentes em um mesmo estágio estabelecido.

Atualmente, um estagiário pode estabelecer seu estágio através de um Termo de Compromisso de Estágio (TCE) ou através de um Pedido de Dispensa do TCE. Outras formas de documentação para estabelecimento do estágio podem ser utilizadas futuramente. A relação entre um estagiário e seu campo de estágio só pode ser relacionada a um tipo de documentação.

Ao estabelecer seu estágio, um estagiário deve informar quais serão suas atribuições, quais atividades ele desenvolverá em seu estágio. Também é necessário informar uma data prevista para o início do estágio e qual será a carga horária diária a ser cumprida. Essa carga horária diária pode ser exatamente 1h, 2h, 3h, 4h, 5h ou 6h diárias.

Existe um professor que é o orientador de estágio. Um professor pode orientar vários estágios, mas um estágio só é orientado por um professor. É necessário ter o nome completo do professor e o número de registro do seu MASP. É possível que dois ou mais professores orientem estágios diferentes durante o mesmo semestre letivo.

O professor orientador administra os estágios abertos no semestre letivo. Somente após o professor orientador criar um estágio no sistema será possível aos alunos realizarem seus cadastros nos estágios que irão cumprir.

O professor orientador aprova ou não a participação dos alunos em um estágio. Somente após o professor realizar a conferência dos cadastros dos alunos e aprovar a participação destes no estágio será possível realizar processos futuros. Isso se deve ao fato de que alunos não matriculados venham a fazer seu cadastro inadvertidamente no sistema ou alunos que tenham informado de forma equivocada qual estágio devem cumprir.

Depois de receber a aprovação de sua participação em um estágio, um estagiário terá acesso ao download dos diversos documentos que precisa para estabelecer seu estágio. Esses documentos serão disponibilizados pelo professor, podendo estar disponíveis para download no próprio sistema ou através de um link para acesso a algum repositório externo ao sistema.

A partir desse momento, o professor orientador validará 8 (oito) etapas até o final do estágio, para as ações de cada estagiário:

Etapa 1: O estagiário protocolou a entrega dos documentos físicos necessários para o estabelecimento do seu estágio, junto ao setor de protocolos da Instituição.

Etapa 2: O estagiário aguarda a conferência dos dados informados nos documentos entregues.

Etapa 3: O estagiário aguarda a validação e assinaturas necessárias para os documentos entregues.

Etapa 4: O plano de atividades de estágio é liberado para o estagiário preencher, imprimir e protocolar a entrega deste plano de atividades junto ao setor de protocolos da Instituição.

Etapa 5: O estagiário aguarda a conferência do Plano de Atividades entregue.

Etapa 6: O Relatório de Avaliação do estágio é liberado para o estagiário preencher, imprimir e protocolar a entrega deste relatório junto ao setor de protocolos da Instituição:

Etapa 7: O estagiário aguarda a conferência do Relatório de Avaliação do Estágio entregue.

Etapa 8: O estagiário aguarda a verificação final de pendências na documentação:

Cada etapa possui dois status: “Em andamento” ou “Concluída”. O estagiário acompanha o status das etapas dentro do sistema. Cada etapa possui orientações textuais específicas para o estagiário e também uma data limite para sua conclusão por parte do estagiário.

O Plano de Atividades do Estágio será gerado pelo sistema. Esse plano será um documento que permitirá ao estagiário informar as atividades realizadas a cada dia em que o seu estágio acontecer. Algumas datas não podem ser utilizadas para as atividades de estágio, como sábados e domingos, mas é necessário cadastrar datas como feriados e recessos que não poderão ser utilizadas no Plano de Atividades.

O Relatório de Avaliação do Estágio também será gerado pelo sistema e será composto, em sua maior parte, por dados que já existirão no sistema, sendo necessário acrescentar uma informação textual para descrever a avaliação sobre conformidade das atividades desenvolvidas e resultados alcançados no estágio. O estagiário digitará este texto para gerar o relatório de avaliação do estágio.

O sistema deve apresentar algumas informações gerenciais em um dashboard para o professor orientador, sendo estas:

Total de alunos que estão estagiando
Total de alunos que estão em cada etapa do estágio
Total de estágios por modalidade
Total de estágios por tipo de documentação

O sistema também deve exibir alertas para o professor sobre alunos que estão atrasados em suas etapas.

O sistema deve prezar pelas melhores práticas de segurança, com acessos às áreas específicas dos seus usuários através de login e senha, com possibilidade de recuperação do acesso em caso de esquecimento. O sistema será utilizado em ambiente online, o que requer também atenção com relação à segurança. Sempre devem ser considerados os pilares de confidencialidade, integridade e disponibilidade.

O sistema deve ser construído com custo zero.

As interfaces do sistema devem ser minimalistas, porém mantendo destaques para todas as ações solicitadas. As interfaces devem respeitar as cores institucionais, que são as seguintes:

Cores institucionais, representadas pelo azul e vermelho:
Sistema RGB
R48 - G91 - B125
R227 - G24 - B55
Cores secundárias, que apoiam as cores institucionais, conferem mais dinamismo e ampliam as possibilidades nas composições gráficas:
Sistema RGB
R0 - G43 - B92
R130 - G0 - B36
R163 - G153 - B0
R206 - G208 - B210

Serão necessários dados iniciais de amostra (seeds) de professores e discentes para fazer testes no sistema.

A seguir, a estrutura inicial do banco de dados proposto para o sistema:

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.acompanhamento_etapa (
  id_acompanhamento integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_contrato integer NOT NULL,
  id_etapa_def integer NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'PENDENTE'::status_etapa,
  data_limite date,
  data_conclusao date,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT acompanhamento_etapa_pkey PRIMARY KEY (id_acompanhamento),
  CONSTRAINT acompanhamento_etapa_id_contrato_fkey FOREIGN KEY (id_contrato) REFERENCES public.contrato_estagio(id_contrato),
  CONSTRAINT acompanhamento_etapa_id_etapa_def_fkey FOREIGN KEY (id_etapa_def) REFERENCES public.etapa_definicao(id_etapa_def)
);
CREATE TABLE public.aluno (
  id_aluno integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  profile_id uuid NOT NULL,
  matricula character varying NOT NULL UNIQUE,
  periodo_atual integer NOT NULL,
  CONSTRAINT aluno_pkey PRIMARY KEY (id_aluno),
  CONSTRAINT aluno_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.campo_estagio (
  id_campo integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  razao_social character varying NOT NULL,
  nome_fantasia character varying NOT NULL,
  telefone_contato character varying,
  email_contato character varying,
  supervisor_nome character varying NOT NULL,
  supervisor_telefone character varying NOT NULL,
  supervisor_email character varying NOT NULL,
  supervisor_cargo character varying NOT NULL,
  supervisor_area_formacao character varying NOT NULL,
  supervisor_titulacao character varying NOT NULL,
  CONSTRAINT campo_estagio_pkey PRIMARY KEY (id_campo)
);
CREATE TABLE public.contrato_estagio (
  id_contrato integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_aluno integer NOT NULL,
  id_oferta integer NOT NULL,
  id_campo integer NOT NULL,
  modalidade USER-DEFINED NOT NULL,
  tipo_documentacao USER-DEFINED NOT NULL,
  atribuicoes text NOT NULL,
  data_inicio_prevista date NOT NULL,
  carga_horaria_diaria integer NOT NULL CHECK (carga_horaria_diaria >= 1 AND carga_horaria_diaria <= 6),
  status_aprovacao USER-DEFINED DEFAULT 'PENDENTE'::status_aprovacao,
  observacoes_professor text,
  texto_relatorio_avaliacao text,
  data_conclusao_estagio date,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT contrato_estagio_pkey PRIMARY KEY (id_contrato),
  CONSTRAINT contrato_estagio_id_aluno_fkey FOREIGN KEY (id_aluno) REFERENCES public.aluno(id_aluno),
  CONSTRAINT contrato_estagio_id_oferta_fkey FOREIGN KEY (id_oferta) REFERENCES public.oferta_estagio(id_oferta),
  CONSTRAINT contrato_estagio_id_campo_fkey FOREIGN KEY (id_campo) REFERENCES public.campo_estagio(id_campo)
);
CREATE TABLE public.curso_estagio (
  id_curso_estagio integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  nome character varying NOT NULL,
  periodo_vinculado integer NOT NULL,
  carga_horaria_total integer NOT NULL,
  CONSTRAINT curso_estagio_pkey PRIMARY KEY (id_curso_estagio)
);
CREATE TABLE public.diario_atividade (
  id_diario integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_contrato integer NOT NULL,
  data_atividade date NOT NULL,
  descricao_atividades text NOT NULL,
  horas_realizadas integer NOT NULL,
  CONSTRAINT diario_atividade_pkey PRIMARY KEY (id_diario),
  CONSTRAINT diario_atividade_id_contrato_fkey FOREIGN KEY (id_contrato) REFERENCES public.contrato_estagio(id_contrato)
);
CREATE TABLE public.documento_modelo (
  id_documento integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  nome_arquivo character varying NOT NULL,
  url_link text NOT NULL,
  CONSTRAINT documento_modelo_pkey PRIMARY KEY (id_documento)
);
CREATE TABLE public.etapa_definicao (
  id_etapa_def integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  numero_etapa integer NOT NULL,
  descricao character varying NOT NULL,
  orientacao_textual text NOT NULL,
  CONSTRAINT etapa_definicao_pkey PRIMARY KEY (id_etapa_def)
);
CREATE TABLE public.feriado_recesso (
  id_feriado integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  data_evento date NOT NULL UNIQUE,
  descricao character varying NOT NULL,
  tipo USER-DEFINED NOT NULL,
  CONSTRAINT feriado_recesso_pkey PRIMARY KEY (id_feriado)
);
CREATE TABLE public.oferta_estagio (
  id_oferta integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_curso_estagio integer NOT NULL,
  id_professor_orientador integer NOT NULL,
  semestre_letivo character varying NOT NULL,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT oferta_estagio_pkey PRIMARY KEY (id_oferta),
  CONSTRAINT oferta_estagio_id_curso_estagio_fkey FOREIGN KEY (id_curso_estagio) REFERENCES public.curso_estagio(id_curso_estagio),
  CONSTRAINT oferta_estagio_id_professor_orientador_fkey FOREIGN KEY (id_professor_orientador) REFERENCES public.professor(id_professor)
);
CREATE TABLE public.professor (
  id_professor integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  profile_id uuid NOT NULL,
  masp character varying NOT NULL UNIQUE,
  CONSTRAINT professor_pkey PRIMARY KEY (id_professor),
  CONSTRAINT professor_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email character varying NOT NULL,
  nome_completo character varying NOT NULL,
  role USER-DEFINED NOT NULL DEFAULT 'ALUNO'::tipo_perfil,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

Relacionamentos Estabelecidos
• Professor (1) -> (N) Oferta de Estágio: Um professor pode orientar vários estágios (turmas) em um semestre, mas uma oferta tem apenas um professor responsável.
• Curso Estágio (1) -> (N) Oferta de Estágio: O "tipo" de estágio (ex: Estágio I) pode ser ofertado em diversos semestres diferentes (ex: 2026-1, 2026-2).
• Oferta de Estágio (1) -> (N) Contrato de Estágio: Vários alunos se matriculam em uma oferta específica.
• Aluno (1) -> (N) Contrato de Estágio: O aluno pode fazer o Estágio I e, futuramente, o Estágio II (registros distintos).
• Campo de Estágio (1) -> (N) Contrato de Estágio: Uma empresa pode ter vários estagiários, mas o contrato liga o aluno a um único campo.
• Contrato de Estágio (1) -> (N) Acompanhamento Etapa: Cada contrato gera uma instância das 8 etapas para controle individual.
• Contrato de Estágio (1) -> (N) Diário de Atividade: O aluno registra N dias de trabalho para um contrato específico.
