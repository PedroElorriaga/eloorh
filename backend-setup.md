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
- `VITE_SUPABASE_URL` (recruiter panel)
- `VITE_SUPABASE_ANON_KEY` (recruiter panel — the **anon public** key, never the service_role key)
- `RESUME_URL_TTL_SECONDS` (optional, default `300`)

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

Public (no authentication):

- Health check: `GET /api/health`
- Create application: `POST /api/applications`

Recruiter-only (require `Authorization: Bearer <supabase access token>`):

- List applications: `GET /api/applications?limit=20&offset=0`
- Application detail: `GET /api/applications/:id`
- Resume download link: `GET /api/applications/:id/resume`

`POST /api/applications` expects `multipart/form-data` with:

- `nome` (required)
- `email` (required)
- `telefone` (required)
- `cargo` (required)
- `area` (required)
- `sobre` (optional)
- `arquivo` (optional, PDF/DOC/DOCX, max 5MB)

The contact form does not use the API: it validates in the browser and opens a pre-filled `https://wa.me/5535984174730` link so the visitor sends the message from their own WhatsApp.

## 5) Recruiter panel (`/painel.html`)

The panel is a second page in the Vite build, served at `/painel.html`. It signs recruiters
in with Supabase Auth and reads the recruiter-only endpoints above.

Setup in the Supabase dashboard:

1. **Authentication > Sign In / Providers**: disable public sign-ups, so the project's anon
   key cannot create accounts.
2. **Authentication > Users**: create one user per recruiter (email + password) and share
   the credentials with them. There is no self-service registration by design.

The two keys are easy to confuse and the consequence is not symmetric:

- `SUPABASE_ANON_KEY` → goes in `VITE_SUPABASE_ANON_KEY`, ships in the browser bundle, and
  on its own only allows calling Auth. This is expected and safe.
- `SUPABASE_SERVICE_ROLE_KEY` → server-side only. It bypasses Row Level Security. It must
  never be given a `VITE_` prefix, or the static build would publish it.

Resume downloads never expose the `curriculos` bucket: the API mints a signed URL per
request, valid for `RESUME_URL_TTL_SECONDS` (default 5 minutes).

## 6) Production deployment (Railway)

The API is deployed to Railway at `https://eloorh-production.up.railway.app`, connected to this GitHub repo:

- **Start Command**: `npm run server`
- **Environment variables**: same as `.env.example`, except:
  - `PORT`: not set (Railway assigns it)
  - `CORS_ORIGIN`: `https://eloorh.com` (the production frontend origin, not `localhost:5173`)

The frontend build (`.github/workflows/deploy.yml`) sets `VITE_API_URL=https://eloorh-production.up.railway.app` at build time so the deployed static site calls the Railway-hosted API instead of `localhost:4000`.
