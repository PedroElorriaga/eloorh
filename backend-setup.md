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

### Supabase example

Use the connection string from Supabase:

Path: Project Settings -> Database -> Connection string -> URI

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
DB_POOL_SIZE=10
DB_SSL=true
```

If you need to use separate fields instead of `DATABASE_URL`, keep `DATABASE_URL` empty and fill `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME`.

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

`POST /api/applications` expects `multipart/form-data` with:

- `nome` (required)
- `email` (required)
- `telefone` (required)
- `cargo` (required)
- `area` (required)
- `sobre` (optional)
- `arquivo` (optional, PDF/DOC/DOCX, max 5MB)

The contact form does not use the API: it validates in the browser and opens a pre-filled `https://wa.me/5535984174730` link so the visitor sends the message from their own WhatsApp.

## 5) Production deployment (Railway)

The API is deployed to Railway at `https://eloorh-production.up.railway.app`, connected to this GitHub repo:

- **Start Command**: `npm run server`
- **Environment variables**: same as `.env.example`, except:
  - `PORT`: not set (Railway assigns it)
  - `CORS_ORIGIN`: `https://eloorh.com` (the production frontend origin, not `localhost:5173`)

The frontend build (`.github/workflows/deploy.yml`) sets `VITE_API_URL=https://eloorh-production.up.railway.app` at build time so the deployed static site calls the Railway-hosted API instead of `localhost:4000`.
