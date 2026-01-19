-- Script to update contrato_estagio table to support dynamic text values
-- Run this in your database query tool (Supabase SQL Editor or pgAdmin)

BEGIN;

-- 1. Alter 'modalidade' column to TEXT
ALTER TABLE public.contrato_estagio 
ALTER COLUMN modalidade TYPE text USING modalidade::text;

-- 2. Alter 'tipo_documentacao' column to TEXT
ALTER TABLE public.contrato_estagio 
ALTER COLUMN tipo_documentacao TYPE text USING tipo_documentacao::text;

COMMIT;
