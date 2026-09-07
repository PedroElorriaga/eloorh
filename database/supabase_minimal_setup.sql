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
