CREATE TABLE IF NOT EXISTS "public"."system_config" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "system_config_pkey" PRIMARY KEY ("key")
);

ALTER TABLE "public"."system_config" OWNER TO "postgres";

COMMENT ON TABLE "public"."system_config" IS 'Configuration table for system flags e.g. janela_cadastro_aberta';
