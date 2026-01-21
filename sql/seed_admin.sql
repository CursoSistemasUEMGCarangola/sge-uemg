-- Seed Script for SGE UEMG Database
-- Run this in Supabase SQL Editor

-- 1. Create Stage Definitions (Etapa Definicao)
INSERT INTO public.etapa_definicao (numero_etapa, descricao, orientacao_textual, prazo_dias, system_action) VALUES
(1, 'Entrega de Documentos Físicos', 'Protocole a entrega dos documentos físicos (TCE) no setor de protocolos da Instituição.', 7, NULL),
(2, 'Conferência de Dados', 'Aguarde a conferência dos dados informados nos documentos entregues.', 5, NULL),
(3, 'Assinaturas Institucionais', 'Aguarde a validação e assinaturas necessárias da instituição.', 7, NULL),
(4, 'Entrega do Plano de Atividades', 'Preencha, imprima e protocole o Plano de Atividades no setor de protocolos.', 10, 'FILL_ACTIVITY_PLAN'),
(5, 'Conferência do Plano', 'Aguarde a conferência e aprovação do seu Plano de Atividades.', 5, NULL),
(6, 'Entrega do Relatório Final', 'Ao fim do estágio, preencha, imprima e protocole o Relatório de Avaliação.', 15, NULL),
(7, 'Conferência do Relatório', 'Aguarde a conferência do seu Relatório de Avaliação.', 5, NULL),
(8, 'Verificação Final', 'Aguarde a verificação final de pendências para conclusão do estágio.', 3, NULL);

-- 2. Create System Config
INSERT INTO public.system_config (key, value) VALUES
('janela_cadastro_aberta', 'true');

-- 3. Create General Info (Informacoes Gerais)
INSERT INTO public.informacoes_gerais_estagio (categoria, descricao, ativo) VALUES
('Modalidade', 'PRESENCIAL', true),
('Modalidade', 'REMOTO', true),
('Modalidade', 'HIBRIDO', true),
('TipoDocumentacao', 'TCE', true),
('TipoDocumentacao', 'Aditivo', true);

-- 4. Create an ADMIN User
-- NOTE: In Supabase, users are managed in the `auth` schema.
-- This script relies on you creating the user first via the Auth UI or creating a dummy here.
-- METHOD A: Create a dummy user in auth.users (Requires privileges, might fail in some setups)
-- We will insert a user with email 'admin@sge.uemg.br' and password 'password123' (hash placeholder)
-- The UUID will be generated.

DO $$
DECLARE
  v_user_id uuid := gen_random_uuid();
BEGIN
  -- Attempt to insert into auth.users (This works in Supabase SQL Editor typically)
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
    'admin@sge.uemg.br',
    '$2a$10$w8.I8.c8.w8.I8.c8.w8.I8.c8.w8.I8.c8.w8.I8.c8.w8.I8.c8.', -- DUMMY HASH (Won't allow login, see below)
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  );
  
  -- Insert into public.profiles
  INSERT INTO public.profiles (id, email, nome_completo, role)
  VALUES (v_user_id, 'admin@sge.uemg.br', 'Administrador do Sistema', 'ADMIN');

  -- NOTE: You will need to Reset Password for this user in Supabase Dashboard to log in,
  -- OR replace the `encrypted_password` with a known bcrypt hash from another user.
END $$;
