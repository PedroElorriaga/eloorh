# Backend setup (Supabase PostgreSQL + upload)

## 1) Prepare environment variables

Create a `.env` file at the project root using `.env.example` as reference.

Required values:

- `PORT` (example: `4000`)
- `CORS_ORIGIN` (example: `http://localhost:5173`)
- `MAX_UPLOAD_MB` (example: `5`)
- `DATABASE_URL` (preferred)
- `DB_HOST` (optional fallback)
- `DB_PORT` (optional fallback)
- `DB_USER` (optional fallback)
- `DB_PASSWORD` (optional fallback)
- `DB_NAME` (optional fallback)
- `DB_POOL_SIZE`
- `DB_SSL` (`true` for Supabase)
- `VITE_API_URL` (example: `http://localhost:4000`)
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `CONTACT_TO_EMAIL` (default: `consultoria.eloorh@gmail.com`)
- `CONTACT_FROM_EMAIL`

### Supabase example

Use the connection string from Supabase:

Path: Project Settings -> Database -> Connection string -> URI

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
DB_POOL_SIZE=10
DB_SSL=true
```

If you need to use separate fields instead of `DATABASE_URL`, keep `DATABASE_URL` empty and fill `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME`.

### SMTP example (contact form)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=consultoria.eloorh@gmail.com
SMTP_PASS=YOUR_GMAIL_APP_PASSWORD
CONTACT_TO_EMAIL=consultoria.eloorh@gmail.com
CONTACT_FROM_EMAIL=consultoria.eloorh@gmail.com
```

For Gmail, use an App Password (2-step verification enabled) instead of your normal account password.

## 2) Create database table

Run this script in Supabase SQL Editor:

- `database/supabase_minimal_setup.sql`

## 3) Start frontend + backend

In two terminals:

1. Frontend

```bash
npm run dev
```

2. Backend

```bash
npm run dev:server
```

## 4) Endpoints

- Health check: `GET /api/health`
- Create application: `POST /api/applications`
- Send contact email: `POST /api/contact`

`POST /api/applications` expects `multipart/form-data` with:

- `nome` (required)
- `email` (required)
- `telefone` (required)
- `cargo` (required)
- `area` (required)
- `sobre` (optional)
- `arquivo` (optional, PDF/DOC/DOCX, max 5MB)

`POST /api/contact` expects `application/json` with:

- `nome` (required)
- `email` (required)
- `assunto` (required)
- `mensagem` (required)
