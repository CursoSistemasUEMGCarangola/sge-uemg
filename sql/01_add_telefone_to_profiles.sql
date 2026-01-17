-- Adiciona a coluna telefone à tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telefone TEXT;
