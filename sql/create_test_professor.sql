-- ATENÇÃO: Execute este script no SQL Editor do Supabase dashboard.
-- Isso criará um usuário 'admin' válido para login.

-- 1. Habilitar a extensão pgcrypto para gerar o hash da senha
create extension if not exists "pgcrypto";

-- 2. Definir variáveis para o usuário
DO $$
DECLARE
  new_user_id uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'; -- ID fixo para facilitar
  user_email text := 'professor@uemg.br';
  user_password text := '123456';
  user_name text := 'Professor Teste Admin';
BEGIN
  -- 3. Inserir na tabela de Autenticação (auth.users)
  -- Se o usuário já existir, não faz nada (evita erro)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
    INSERT INTO auth.users (
      id,
      instance_id,
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
      new_user_id,
      '00000000-0000-0000-0000-000000000000', -- Default instance_id
      -- Nota: ajustando colunas para o padrão mais comum do Supabase Auth
      'authenticated',
      'authenticated',
      user_email,
      crypt(user_password, gen_salt('bf')), -- Hash da senha
      now(), -- Email confirmado automaticamente
      NULL,
      now(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('full_name', user_name, 'role', 'PROFESSOR'),
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
  END IF;

  -- 4. Inserir na tabela de Perfil (public.profiles)
  INSERT INTO public.profiles (id, email, nome_completo, role, created_at)
  VALUES (new_user_id, user_email, user_name, 'PROFESSOR', now())
  ON CONFLICT (id) DO UPDATE
  SET role = 'PROFESSOR'; -- Garante que vira professor se já existir

  -- 5. Inserir na tabela de Professor (public.professor)
  IF NOT EXISTS (SELECT 1 FROM public.professor WHERE profile_id = new_user_id) THEN
    INSERT INTO public.professor (profile_id, masp)
    VALUES (new_user_id, '888888-8');
  END IF;

END $$;
