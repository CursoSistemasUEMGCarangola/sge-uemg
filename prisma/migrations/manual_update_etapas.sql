-- Adicionar colunas prazo_dias e system_action na tabela etapa_definicao

ALTER TABLE "etapa_definicao" ADD COLUMN "prazo_dias" INTEGER NOT NULL DEFAULT 7;
ALTER TABLE "etapa_definicao" ADD COLUMN "system_action" TEXT;

-- Atualizar prazo de dias padrão se necessário (já definido como default 7 acima)
-- UPDATE "etapa_definicao" SET "prazo_dias" = 7 WHERE "prazo_dias" IS NULL;

-- Adicionar coluna data_limite na tabela acompanhamento_etapa
ALTER TABLE "acompanhamento_etapa" ADD COLUMN "data_limite" DATE;
