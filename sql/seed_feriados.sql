-- Seeding Feriados e Recessos (2024-2026)
-- Executar no Supabase SQL Editor

INSERT INTO public.feriado_recesso (data_evento, descricao, tipo) VALUES
-- 2024
('2024-01-01', 'Confraternização Universal', 'FERIADO'),
('2024-02-12', 'Carnaval', 'RECESSO'),
('2024-02-13', 'Carnaval', 'FERIADO'),
('2024-03-29', 'Sexta-feira Santa', 'FERIADO'),
('2024-04-21', 'Tiradentes', 'FERIADO'),
('2024-05-01', 'Dia do Trabalho', 'FERIADO'),
('2024-05-30', 'Corpus Christi', 'FERIADO'),
('2024-09-07', 'Independência do Brasil', 'FERIADO'),
('2024-10-12', 'Nossa Senhora Aparecida', 'FERIADO'),
('2024-11-02', 'Finados', 'FERIADO'),
('2024-11-15', 'Proclamação da República', 'FERIADO'),
('2024-12-25', 'Natal', 'FERIADO'),

-- 2025
('2025-01-01', 'Confraternização Universal', 'FERIADO'),
('2025-03-03', 'Carnaval', 'RECESSO'),
('2025-03-04', 'Carnaval', 'FERIADO'),
('2025-04-18', 'Sexta-feira Santa', 'FERIADO'),
('2025-04-21', 'Tiradentes', 'FERIADO'),
('2025-05-01', 'Dia do Trabalho', 'FERIADO'),
('2025-06-19', 'Corpus Christi', 'FERIADO'),
('2025-09-07', 'Independência do Brasil', 'FERIADO'),
('2025-10-12', 'Nossa Senhora Aparecida', 'FERIADO'),
('2025-11-02', 'Finados', 'FERIADO'),
('2025-11-15', 'Proclamação da República', 'FERIADO'),
('2025-12-25', 'Natal', 'FERIADO'),

-- 2026
('2026-01-01', 'Confraternização Universal', 'FERIADO'),
('2026-02-16', 'Carnaval', 'RECESSO'),
('2026-02-17', 'Carnaval', 'FERIADO'),
('2026-04-03', 'Sexta-feira Santa', 'FERIADO'),
('2026-04-21', 'Tiradentes', 'FERIADO'),
('2026-05-01', 'Dia do Trabalho', 'FERIADO'),
('2026-06-04', 'Corpus Christi', 'FERIADO'),
('2026-09-07', 'Independência do Brasil', 'FERIADO'),
('2026-10-12', 'Nossa Senhora Aparecida', 'FERIADO'),
('2026-11-02', 'Finados', 'FERIADO'),
('2026-11-15', 'Proclamação da República', 'FERIADO'),
('2026-12-25', 'Natal', 'FERIADO')
ON CONFLICT (data_evento) DO NOTHING;
