-- SCRIPT DE RESET DO BANCO DE DADOS v2
-- ATENÇÃO: Este script apaga TODOS os dados gerados por usuários (alunos, professores, estágios).
-- Ele preserva E CRIA (se necessário) o usuário 'admin-estagio@uemg.br' com senha 'estagio123'.

-- Habilitar pgcrypto para hash de senha (necessário para criar usuário no auth.users)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

BEGIN;

-- 1. Limpar tabelas dependentes (Transaction Data)
DELETE FROM public.diario_atividade;
DELETE FROM public.acompanhamento_etapa;
DELETE FROM public.contrato_estagio;
DELETE FROM public.oferta_estagio;
DELETE FROM public.campo_estagio;

-- 2. Limpar usuários (User Data) - preservando o Admin
DELETE FROM public.aluno;
DELETE FROM public.professor;

DELETE FROM public.profiles 
WHERE email <> 'admin-estagio@uemg.br';

DELETE FROM auth.users 
WHERE email <> 'admin-estagio@uemg.br';

-- 3. Garantir existência do Admin no Auth
-- Insere apenas se não existir. Senha 'estagio123'.
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
)
SELECT 
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin-estagio@uemg.br',
    crypt('estagio123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Administrador Sistema"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin-estagio@uemg.br'
);

-- 4. Garantir existência/atualização do Admin no Public Profiles com Role ADMIN
-- Inserimos ou Atualizamos para garantir que seja ADMIN
INSERT INTO public.profiles (id, email, nome_completo, role)
SELECT 
    id, 
    email, 
    'Administrador Sistema', 
    'ADMIN' 
FROM auth.users 
WHERE email = 'admin-estagio@uemg.br'
ON CONFLICT (id) DO UPDATE 
SET role = 'ADMIN';

COMMIT;

-- Feedback
SELECT 'Banco de dados resetado. Admin (admin-estagio@uemg.br / estagio123) garantido como ADMIN.' as status;
