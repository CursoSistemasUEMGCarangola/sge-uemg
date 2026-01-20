-- Arquivo para corrigir a falta de colunas na tabela acompanhamento_etapa
-- Execute isso no Editor SQL do Supabase se o npx prisma db push falhar.

ALTER TABLE public.acompanhamento_etapa
ADD COLUMN IF NOT EXISTS observacoes text,
ADD COLUMN IF NOT EXISTS link_documento text;
