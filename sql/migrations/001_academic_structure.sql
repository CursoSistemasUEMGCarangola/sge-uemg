-- Migration: 001_academic_structure
-- Description: Adds UnidadeAcademica and Curso tables, and links existing entities.

-- 1. Create Unidade Academica
CREATE TABLE public.unidade_academica (
    id_unidade integer GENERATED ALWAYS AS IDENTITY NOT NULL,
    nome character varying NOT NULL,
    CONSTRAINT unidade_academica_pkey PRIMARY KEY (id_unidade)
);

-- 2. Create Curso
CREATE TABLE public.curso (
    id_curso integer GENERATED ALWAYS AS IDENTITY NOT NULL,
    nome character varying NOT NULL,
    id_unidade integer NOT NULL,
    CONSTRAINT curso_pkey PRIMARY KEY (id_curso),
    CONSTRAINT curso_id_unidade_fkey FOREIGN KEY (id_unidade) REFERENCES public.unidade_academica(id_unidade)
);

-- 3. Update CursoEstagio (The Internship Subject) to link to a Degree Course
-- Adding nullable first to avoid blocking content, but ideally should be enforceable.
ALTER TABLE public.curso_estagio ADD COLUMN id_curso integer;
ALTER TABLE public.curso_estagio ADD CONSTRAINT curso_estagio_id_curso_fkey FOREIGN KEY (id_curso) REFERENCES public.curso(id_curso);

-- 4. Update Aluno
ALTER TABLE public.aluno ADD COLUMN id_curso integer;
ALTER TABLE public.aluno ADD CONSTRAINT aluno_id_curso_fkey FOREIGN KEY (id_curso) REFERENCES public.curso(id_curso);

-- 5. Update Professor
ALTER TABLE public.professor ADD COLUMN id_curso integer;
ALTER TABLE public.professor ADD CONSTRAINT professor_id_curso_fkey FOREIGN KEY (id_curso) REFERENCES public.curso(id_curso);

-- 6. Seed Initial Data (Optional - useful for dev)
-- Uncomment if you want to seed immediately, otherwise handle via Admin UI or seed script
/*
INSERT INTO public.unidade_academica (nome) VALUES ('Unidade Carangola');
INSERT INTO public.curso (nome, id_unidade) VALUES ('Sistemas de Informação', 1), ('Administração', 1), ('Pedagogia', 1);
*/
