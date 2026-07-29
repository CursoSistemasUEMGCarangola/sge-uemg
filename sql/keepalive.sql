-- 1. Cria a tabela keepalive
CREATE TABLE IF NOT EXISTS public.keepalive (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  pinged_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilita o RLS (Row Level Security) para segurança
ALTER TABLE public.keepalive ENABLE ROW LEVEL SECURITY;

-- 3. Cria uma política permitindo que qualquer pessoa (anon) leia a tabela
CREATE POLICY "Permitir leitura pública" ON public.keepalive
  FOR SELECT USING (true);

-- 4. Insere um registro inicial (garante que a leitura nunca venha vazia)
INSERT INTO public.keepalive (pinged_at) VALUES (now());
