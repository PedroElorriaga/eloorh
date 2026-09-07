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
