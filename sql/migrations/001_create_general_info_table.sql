CREATE TABLE public.informacoes_gerais_estagio (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  categoria character varying NOT NULL,
  descricao character varying NOT NULL,
  ativo boolean DEFAULT true,
  CONSTRAINT informacoes_gerais_estagio_pkey PRIMARY KEY (id)
);

-- Insert initial values for Modalidade
INSERT INTO public.informacoes_gerais_estagio (categoria, descricao) VALUES
('MODALIDADE', 'Presencial'),
('MODALIDADE', 'Remoto'),
('MODALIDADE', 'Híbrido');

-- Insert initial values for Tipo Documentacao
INSERT INTO public.informacoes_gerais_estagio (categoria, descricao) VALUES
('TIPO_DOCUMENTACAO', 'Termo de Compromisso'),
('TIPO_DOCUMENTACAO', 'Pedido de Dispensa');

-- Insert initial values for Titulacao Supervisor
INSERT INTO public.informacoes_gerais_estagio (categoria, descricao) VALUES
('TITULACAO_SUPERVISOR', 'Graduação'),
('TITULACAO_SUPERVISOR', 'Especialização'),
('TITULACAO_SUPERVISOR', 'Mestrado'),
('TITULACAO_SUPERVISOR', 'Doutorado'),
('TITULACAO_SUPERVISOR', 'Pós-Doutorado');
