-- Seed Holidays and Recesses for 2026
-- Run this in Supabase SQL Editor

INSERT INTO public.feriado_recesso (data_evento, descricao, tipo) VALUES
('2026-01-01', 'Confraternização Universal', 'FERIADO'),
('2026-02-16', 'Recesso de Carnaval', 'RECESSO'),
('2026-02-17', 'Carnaval', 'FERIADO'),
('2026-02-18', 'Quarta-feira de Cinzas', 'RECESSO'),
('2026-04-03', 'Paixão de Cristo', 'FERIADO'),
('2026-04-21', 'Tiradentes', 'FERIADO'),
('2026-05-01', 'Dia do Trabalho', 'FERIADO'),
('2026-06-04', 'Corpus Christi', 'FERIADO'),
('2026-09-07', 'Independência do Brasil', 'FERIADO'),
('2026-10-12', 'Nossa Senhora Aparecida', 'FERIADO'),
('2026-10-28', 'Dia do Servidor Público', 'RECESSO'),
('2026-11-02', 'Finados', 'FERIADO'),
('2026-11-15', 'Proclamação da República', 'FERIADO'),
('2026-12-24', 'Véspera de Natal', 'RECESSO'),
('2026-12-25', 'Natal', 'FERIADO'),
('2026-12-31', 'Véspera de Ano Novo', 'RECESSO')
ON CONFLICT (data_evento) DO NOTHING;
