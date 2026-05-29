-- Habilitar RLS em todas as tabelas públicas do SGE-UEMG
-- Como não estamos criando políticas explícitas, isso atua como um Default Deny
-- para as chamadas via API REST do Supabase (roles anon e authenticated),
-- enquanto o Prisma (rodando como postgres/superusuário) continuará funcionando normalmente.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aluno ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curso_estagio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unidade_academica ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curso ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campo_estagio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oferta_estagio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etapa_definicao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contrato_estagio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acompanhamento_etapa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diario_atividade ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feriado_recesso ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documento_modelo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.informacoes_gerais_estagio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
