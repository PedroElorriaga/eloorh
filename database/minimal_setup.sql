-- Minimal MySQL setup for resume form submissions
-- Safe to run multiple times due to IF NOT EXISTS checks.

CREATE TABLE IF NOT EXISTS job_applications (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL,
    telefone VARCHAR(25) NOT NULL,
    cargo VARCHAR(120) NOT NULL,
    area VARCHAR(80) NOT NULL,
    sobre TEXT NULL,
    arquivo_nome_original VARCHAR(255) NULL,
    arquivo_mime VARCHAR(100) NULL,
    arquivo_tamanho_bytes INT UNSIGNED NULL,
    arquivo_caminho VARCHAR(500) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_job_applications_email (email),
    KEY idx_job_applications_area (area),
    KEY idx_job_applications_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Job openings ("vagas") managed by recruiters in the panel and listed on the site.
-- CHECK constraints are enforced from MySQL 8.0.16 on.
CREATE TABLE IF NOT EXISTS job_openings (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    titulo VARCHAR(150) NOT NULL,
    codigo VARCHAR(30) NULL,
    empresa VARCHAR(150) NULL,
    cidade VARCHAR(100) NOT NULL,
    uf CHAR(2) NOT NULL,
    tipo_contratacao VARCHAR(30) NOT NULL,
    area_profissional VARCHAR(100) NOT NULL,
    carga_horaria VARCHAR(50) NULL,
    salario DECIMAL(10, 2) NULL,
    posicoes INT UNSIGNED NOT NULL DEFAULT 1,
    beneficios TEXT NULL,
    responsabilidades TEXT NOT NULL,
    requisitos TEXT NULL,
    status VARCHAR(12) NOT NULL DEFAULT 'rascunho',
    publicada_em DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_job_openings_status_publicada_em (status, publicada_em),
    CONSTRAINT chk_job_openings_uf CHECK (REGEXP_LIKE(uf, '^[A-Z]{2}$', 'c')),
    CONSTRAINT chk_job_openings_tipo CHECK (
        tipo_contratacao IN ('CLT (Efetivo)', 'PJ', 'Estágio', 'Temporário', 'Jovem Aprendiz', 'Freelancer')
    ),
    CONSTRAINT chk_job_openings_salario CHECK (salario >= 0),
    CONSTRAINT chk_job_openings_posicoes CHECK (posicoes >= 1),
    CONSTRAINT chk_job_openings_status CHECK (status IN ('rascunho', 'publicada', 'encerrada'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Applications may point at the opening they were sent for; NULL means a generic
-- ("banco de talentos") application. MySQL has no ADD COLUMN IF NOT EXISTS, so the
-- ALTER only runs when the column is missing.
SET @has_vaga_id := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'job_applications' AND COLUMN_NAME = 'vaga_id'
);
SET @ddl := IF(
    @has_vaga_id = 0,
    'ALTER TABLE job_applications
        ADD COLUMN vaga_id BIGINT UNSIGNED NULL,
        ADD KEY idx_job_applications_vaga_id (vaga_id),
        ADD CONSTRAINT fk_job_applications_vaga FOREIGN KEY (vaga_id) REFERENCES job_openings (id) ON DELETE SET NULL',
    'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
