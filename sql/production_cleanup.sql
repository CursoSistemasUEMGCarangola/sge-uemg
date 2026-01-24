-- PRODUCTION CLEANUP AND SEED SCRIPT
-- RUN THIS IN SUPABASE SQL EDITOR TO PREPARE FOR PRODUCTION TESTING
-- WARNING: THIS WILL DELETE ALL DATA AND USERS!

-- 1. Enable Cryptography for passwords
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Truncate Transactional Tables (Cascade to clean dependencies)
TRUNCATE TABLE public.diario_atividade RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.acompanhamento_etapa RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.contrato_estagio RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.oferta_estagio RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.campo_estagio RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.curso_estagio RESTART IDENTITY CASCADE;

-- 3. Truncate User Tables
TRUNCATE TABLE public.professor RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.aluno RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.profiles RESTART IDENTITY CASCADE;

-- 4. Clean Auth Users (Remove all registered users)
DELETE FROM auth.users;

-- 5. Helper Tables - Wiping to Re-Seed Clean Static Data
TRUNCATE TABLE public.etapa_definicao RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.feriado_recesso RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.informacoes_gerais_estagio RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.system_config RESTART IDENTITY CASCADE;
-- Table document_modelo is optional, assuming we want to clean it too or re-seed if we had seeds.
TRUNCATE TABLE public.documento_modelo RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.unidade_academica RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.curso RESTART IDENTITY CASCADE;


-- 6. RE-SEED STATIC DATA

-- 6.1 Unidades Academicas (Example - Adjust if needed, or import from real data)
INSERT INTO public.unidade_academica (nome) VALUES 
('CARANGOLA'), 
('UBÁ'), 
('MURIAÉ');

-- 6.2 Cursos (Example - adjusting to common courses)
INSERT INTO public.curso (nome, id_unidade) VALUES 
('Sistemas de Informação', (SELECT id_unidade FROM public.unidade_academica WHERE nome='CARANGOLA'));

-- 6.3 Stage Definitions (With Correct System Actions)
INSERT INTO public.etapa_definicao (numero_etapa, descricao, orientacao_textual, prazo_dias, system_action) VALUES
(1, 'Entrega de Documentos Físicos', 'Protocole a entrega dos documentos físicos (TCE) no setor de protocolos da Instituição.', 7, 'GENERATE_DOC_CAPA'),
(2, 'Conferência de Dados', 'Aguarde a conferência dos dados informados nos documentos entregues.', 5, NULL),
(3, 'Assinaturas Institucionais', 'Aguarde a validação e assinaturas necessárias da instituição.', 7, NULL),
(4, 'Entrega do Plano de Atividades', 'Preencha, imprima e protocole o Plano de Atividades no setor de protocolos.', 10, 'FILL_ACTIVITY_PLAN'),
(5, 'Conferência do Plano', 'Aguarde a conferência e aprovação do seu Plano de Atividades.', 5, NULL),
(6, 'Relatório Final de Avaliação do Estágio', 'Ao fim do estágio, preencha, imprima e protocole o Relatório de Avaliação.', 15, 'FILL_FINAL_REPORT'),
(7, 'Conferência do Relatório', 'Aguarde a conferência do seu Relatório de Avaliação.', 5, NULL),
(8, 'Verificação Final', 'Aguarde a verificação final de pendências para conclusão do estágio.', 3, NULL);

-- 6.4 System Config
INSERT INTO public.system_config (key, value) VALUES
('janela_cadastro_aberta', 'true');

-- 6.5 General Info
INSERT INTO public.informacoes_gerais_estagio (categoria, descricao, ativo) VALUES
('Modalidade', 'PRESENCIAL', true),
('Modalidade', 'REMOTO', true),
('Modalidade', 'HIBRIDO', true),
('TipoDocumentacao', 'TCE', true),
('TipoDocumentacao', 'Estágio Obrigatório', true),
('TipoDocumentacao', 'Estágio Não Obrigatório', true);

-- 6.6 Feriados (Example - 2026) - This can be expanded separately
INSERT INTO public.feriado_recesso (data_evento, descricao, tipo) VALUES
('2026-01-01', 'Confraternização Universal', 'FERIADO'),
('2026-04-21', 'Tiradentes', 'FERIADO'),
('2026-05-01', 'Dia do Trabalhador', 'FERIADO'),
('2026-09-07', 'Independência do Brasil', 'FERIADO'),
('2026-10-12', 'Nossa Senhora Aparecida', 'FERIADO'),
('2026-11-02', 'Finados', 'FERIADO'),
('2026-11-15', 'Proclamação da República', 'FERIADO'),
('2026-12-25', 'Natal', 'FERIADO');


-- 7. SEED ADMIN USER
-- Email: admin-estagios-si@uemg.br
-- Pass: ncc1701@AES

DO $$
DECLARE
  v_user_id uuid := gen_random_uuid();
BEGIN
  -- Insert into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated',
    'authenticated',
    'admin-estagios-si@uemg.br',
    crypt('ncc1701@AES', gen_salt('bf')), -- Secured Password
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Admin SGE"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  );
  
  -- Insert into public.profiles
  INSERT INTO public.profiles (id, email, nome_completo, role)
  VALUES (v_user_id, 'admin-estagios-si@uemg.br', 'Administrador SGE', 'ADMIN');

END $$;

-- 8. Verify
SELECT * FROM public.profiles;
