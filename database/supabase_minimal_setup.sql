-- Minimal PostgreSQL setup for resume form submissions (Supabase)
-- Safe to run multiple times.

CREATE TABLE IF NOT EXISTS public.job_applications (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL,
    telefone VARCHAR(25) NOT NULL,
    cargo VARCHAR(120) NOT NULL,
    area VARCHAR(80) NOT NULL,
    sobre TEXT NULL,
    arquivo_nome_original VARCHAR(255) NULL,
    arquivo_mime VARCHAR(100) NULL,
    arquivo_tamanho_bytes INTEGER NULL,
    arquivo_caminho VARCHAR(500) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_applications_email ON public.job_applications (email);
CREATE INDEX IF NOT EXISTS idx_job_applications_area ON public.job_applications (area);
CREATE INDEX IF NOT EXISTS idx_job_applications_created_at ON public.job_applications (created_at);

-- Keep updated_at in sync on updates.
CREATE OR REPLACE FUNCTION public.set_job_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_job_applications_updated_at ON public.job_applications;

CREATE TRIGGER trg_job_applications_updated_at
BEFORE UPDATE ON public.job_applications
FOR EACH ROW
EXECUTE FUNCTION public.set_job_applications_updated_at();

-- Job openings ("vagas") managed by recruiters in the panel and listed on the site.
CREATE TABLE IF NOT EXISTS public.job_openings (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    codigo VARCHAR(30) NULL,
    empresa VARCHAR(150) NULL,
    cidade VARCHAR(100) NOT NULL,
    uf CHAR(2) NOT NULL CHECK (uf ~ '^[A-Z]{2}$'),
    tipo_contratacao VARCHAR(30) NOT NULL CHECK (
        tipo_contratacao IN ('CLT (Efetivo)', 'PJ', 'Estágio', 'Temporário', 'Jovem Aprendiz', 'Freelancer')
    ),
    area_profissional VARCHAR(100) NOT NULL,
    carga_horaria VARCHAR(50) NULL,
    salario NUMERIC(10, 2) NULL CHECK (salario >= 0),
    posicoes INTEGER NOT NULL DEFAULT 1 CHECK (posicoes >= 1),
    beneficios TEXT NULL,
    responsabilidades TEXT NOT NULL,
    requisitos TEXT NULL,
    status VARCHAR(12) NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'publicada', 'encerrada')),
    publicada_em TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_openings_status_publicada_em ON public.job_openings (status, publicada_em DESC);

CREATE OR REPLACE FUNCTION public.set_job_openings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_job_openings_updated_at ON public.job_openings;

CREATE TRIGGER trg_job_openings_updated_at
BEFORE UPDATE ON public.job_openings
FOR EACH ROW
EXECUTE FUNCTION public.set_job_openings_updated_at();

-- Applications may point at the opening they were sent for; NULL means a generic
-- ("banco de talentos") application.
ALTER TABLE public.job_applications
    ADD COLUMN IF NOT EXISTS vaga_id BIGINT NULL REFERENCES public.job_openings (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_job_applications_vaga_id ON public.job_applications (vaga_id);
