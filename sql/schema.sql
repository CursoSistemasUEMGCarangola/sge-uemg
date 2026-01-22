-- Fixed and Runnable Schema Script
-- Run this in Supabase SQL Editor to restore the database
-- Added DROP commands to ensure a clean slate even if types/tables exist

-- 0. Cleanup (Drop existing objects)
DROP TABLE IF EXISTS public.diario_atividade CASCADE;
DROP TABLE IF EXISTS public.acompanhamento_etapa CASCADE;
DROP TABLE IF EXISTS public.contrato_estagio CASCADE;
DROP TABLE IF EXISTS public.oferta_estagio CASCADE;
DROP TABLE IF EXISTS public.professor CASCADE;
DROP TABLE IF EXISTS public.aluno CASCADE;
DROP TABLE IF EXISTS public.curso_estagio CASCADE;
DROP TABLE IF EXISTS public.etapa_definicao CASCADE;
DROP TABLE IF EXISTS public.campo_estagio CASCADE;
DROP TABLE IF EXISTS public.feriado_recesso CASCADE;
DROP TABLE IF EXISTS public.documento_modelo CASCADE;
DROP TABLE IF EXISTS public.informacoes_gerais_estagio CASCADE;
DROP TABLE IF EXISTS public.system_config CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TYPE IF EXISTS status_etapa CASCADE;
DROP TYPE IF EXISTS status_aprovacao CASCADE;
DROP TYPE IF EXISTS tipo_perfil CASCADE;
DROP TYPE IF EXISTS "TipoFeriado" CASCADE;

-- 1. Create Enum Types
CREATE TYPE status_etapa AS ENUM ('PENDENTE', 'EM_ANALISE', 'ATIVO', 'REJEITADO');
CREATE TYPE status_aprovacao AS ENUM ('PENDENTE', 'ATIVO', 'REJEITADO');
CREATE TYPE tipo_perfil AS ENUM ('ALUNO', 'PROFESSOR', 'ADMIN');
CREATE TYPE "TipoFeriado" AS ENUM ('FERIADO', 'RECESSO');

-- 2. Create Tables (in dependency order)

-- Profiles (Users)
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email character varying NOT NULL,
  nome_completo character varying NOT NULL,
  role tipo_perfil NOT NULL DEFAULT 'ALUNO'::tipo_perfil,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  telefone text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

-- System Config
CREATE TABLE public.system_config (
  key text NOT NULL,
  value text NOT NULL,
  CONSTRAINT system_config_pkey PRIMARY KEY (key)
);

-- Informacoes Gerais
CREATE TABLE public.informacoes_gerais_estagio (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  categoria character varying NOT NULL,
  descricao character varying NOT NULL,
  ativo boolean DEFAULT true,
  CONSTRAINT informacoes_gerais_estagio_pkey PRIMARY KEY (id)
);

-- Documento Modelo
CREATE TABLE public.documento_modelo (
  id_documento integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  nome_arquivo character varying NOT NULL,
  url_link text NOT NULL,
  CONSTRAINT documento_modelo_pkey PRIMARY KEY (id_documento)
);

-- Feriado Recesso
CREATE TABLE public.feriado_recesso (
  id_feriado integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  data_evento date NOT NULL UNIQUE,
  descricao character varying NOT NULL,
  tipo "TipoFeriado" NOT NULL,
  CONSTRAINT feriado_recesso_pkey PRIMARY KEY (id_feriado)
);

-- Campo Estagio
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

-- Etapa Definicao
CREATE TABLE public.etapa_definicao (
  id_etapa_def integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  numero_etapa integer NOT NULL,
  descricao character varying NOT NULL,
  orientacao_textual text NOT NULL,
  prazo_dias integer DEFAULT 7 NOT NULL,
  system_action character varying,
  CONSTRAINT etapa_definicao_pkey PRIMARY KEY (id_etapa_def)
);

-- Curso Estagio
CREATE TABLE public.curso_estagio (
  id_curso_estagio integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  nome character varying NOT NULL,
  periodo_vinculado integer NOT NULL,
  carga_horaria_total integer NOT NULL,
  CONSTRAINT curso_estagio_pkey PRIMARY KEY (id_curso_estagio)
);

-- Aluno (depends on profiles)
CREATE TABLE public.aluno (
  id_aluno integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  profile_id uuid NOT NULL,
  matricula character varying NOT NULL UNIQUE,
  periodo_atual integer NOT NULL,
  CONSTRAINT aluno_pkey PRIMARY KEY (id_aluno),
  CONSTRAINT aluno_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);

-- Professor (depends on profiles)
CREATE TABLE public.professor (
  id_professor integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  profile_id uuid NOT NULL,
  masp character varying NOT NULL UNIQUE,
  CONSTRAINT professor_pkey PRIMARY KEY (id_professor),
  CONSTRAINT professor_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);

-- Oferta Estagio (depends on curso, professor)
CREATE TABLE public.oferta_estagio (
  id_oferta integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_curso_estagio integer NOT NULL,
  id_professor_orientador integer NOT NULL,
  semestre_letivo character varying NOT NULL,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  data_inicio date NOT NULL DEFAULT CURRENT_DATE,
  data_fim date NOT NULL DEFAULT CURRENT_DATE,
  CONSTRAINT oferta_estagio_pkey PRIMARY KEY (id_oferta),
  CONSTRAINT oferta_estagio_id_curso_estagio_fkey FOREIGN KEY (id_curso_estagio) REFERENCES public.curso_estagio(id_curso_estagio),
  CONSTRAINT oferta_estagio_id_professor_orientador_fkey FOREIGN KEY (id_professor_orientador) REFERENCES public.professor(id_professor)
);

-- Contrato Estagio (depends on aluno, oferta, campo)
CREATE TABLE public.contrato_estagio (
  id_contrato integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_aluno integer NOT NULL,
  id_oferta integer NOT NULL,
  id_campo integer NOT NULL,
  modalidade character varying NOT NULL,
  tipo_documentacao character varying NOT NULL,
  atribuicoes text NOT NULL,
  data_inicio_prevista date NOT NULL,
  carga_horaria_diaria integer NOT NULL CHECK (carga_horaria_diaria >= 1 AND carga_horaria_diaria <= 6),
  status_aprovacao status_aprovacao DEFAULT 'PENDENTE'::status_aprovacao,
  observacoes_professor text,
  texto_relatorio_avaliacao text,
  data_conclusao_estagio date,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT contrato_estagio_pkey PRIMARY KEY (id_contrato),
  CONSTRAINT contrato_estagio_id_aluno_fkey FOREIGN KEY (id_aluno) REFERENCES public.aluno(id_aluno),
  CONSTRAINT contrato_estagio_id_oferta_fkey FOREIGN KEY (id_oferta) REFERENCES public.oferta_estagio(id_oferta),
  CONSTRAINT contrato_estagio_id_campo_fkey FOREIGN KEY (id_campo) REFERENCES public.campo_estagio(id_campo)
);

-- Acompanhamento Etapa (depends on contrato, etapa_def)
CREATE TABLE public.acompanhamento_etapa (
  id_acompanhamento integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_contrato integer NOT NULL,
  id_etapa_def integer NOT NULL,
  status status_etapa NOT NULL DEFAULT 'PENDENTE'::status_etapa,
  data_limite date,
  data_conclusao date,
  observacoes text,
  link_documento text,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT acompanhamento_etapa_pkey PRIMARY KEY (id_acompanhamento),
  CONSTRAINT acompanhamento_etapa_id_contrato_fkey FOREIGN KEY (id_contrato) REFERENCES public.contrato_estagio(id_contrato),
  CONSTRAINT acompanhamento_etapa_id_etapa_def_fkey FOREIGN KEY (id_etapa_def) REFERENCES public.etapa_definicao(id_etapa_def)
);

-- Diario Atividade (depends on contrato)
CREATE TABLE public.diario_atividade (
  id_diario integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_contrato integer NOT NULL,
  data_atividade date NOT NULL,
  descricao_atividades text NOT NULL,
  horas_realizadas integer NOT NULL,
  CONSTRAINT diario_atividade_pkey PRIMARY KEY (id_diario),
  CONSTRAINT diario_atividade_id_contrato_fkey FOREIGN KEY (id_contrato) REFERENCES public.contrato_estagio(id_contrato)
);