## Context

- **API** (`server/index.js`): a single Express app talking to Supabase Postgres through `pg` (`server/db.js`) and to Supabase Storage/Auth with the service-role key. `requireRecruiter` validates the bearer token with `supabase.auth.getUser`. Recruiter list endpoints page with `limit`/`offset` and a "fetch one extra row" `hasMore` trick.
- **Schema**: only `job_applications` exists, created by `database/supabase_minimal_setup.sql` (Postgres, the one actually used) with a MySQL twin `database/minimal_setup.sql`. Scripts are run by hand in the Supabase SQL editor and are written to be re-runnable.
- **Front-end**: two Vite entries. The public site (`index.html` → `App.jsx`) is a single scrolling page with anchor navigation (`Header.jsx` `NAV_LINKS`), no router. The panel (`painel.html` → `Panel.jsx`) swaps between `ApplicationsList` and `ApplicationDetail` with local state; `src/painel/api.js` only supports authenticated GETs.
- **Resume form** (`ResumeForm.jsx`, section `#curriculos`) posts `multipart/form-data` to `POST /api/applications`; its "Área de interesse" options are Eloo RH service categories, which don't make sense for a specific opening — hence taking role/area from the opening instead.

## Goals / Non-Goals

**Goals:**
- One source of truth for openings in Postgres, managed from the panel, read by the public site at runtime (no rebuild to publish a job).
- Link applications to openings without breaking generic applications or existing rows.
- Reuse existing patterns (auth middleware, pagination shape, form styles, scroll animation) — no new dependencies.

**Non-Goals:**
- A dedicated `/vagas` page or per-opening shareable URLs (chosen: home section + modal). The data/API shape keeps this possible later.
- Search, filters or pagination on the public list (expected volume: a handful of openings).
- Deleting openings, rich text/Markdown, images per opening, work mode (presencial/remoto) field, application status/pipeline, e-mail notifications.
- Importing openings from external job boards.

## Decisions

### Data model: `job_openings` table + nullable `vaga_id` on applications

```
job_openings
  id                 BIGINT identity PK
  titulo             VARCHAR(150) NOT NULL
  codigo             VARCHAR(30)  NULL          -- "6623"
  empresa            VARCHAR(150) NULL          -- NULL → "Empresa confidencial"
  cidade             VARCHAR(100) NOT NULL
  uf                 CHAR(2)      NOT NULL
  tipo_contratacao   VARCHAR(30)  NOT NULL      -- CHECK in fixed list
  area_profissional  VARCHAR(100) NOT NULL
  carga_horaria      VARCHAR(50)  NULL          -- free text: "220", "44h semanais"
  salario            NUMERIC(10,2) NULL         -- NULL → "A combinar"; CHECK >= 0
  posicoes           INTEGER NOT NULL DEFAULT 1 -- CHECK >= 1
  beneficios         TEXT NULL                  -- one benefit per line
  responsabilidades  TEXT NOT NULL
  requisitos         TEXT NULL
  status             VARCHAR(12) NOT NULL DEFAULT 'rascunho'  -- CHECK in (rascunho, publicada, encerrada)
  publicada_em       TIMESTAMPTZ NULL
  created_at / updated_at TIMESTAMPTZ + updated_at trigger (same pattern as job_applications)

INDEX (status, publicada_em DESC)

job_applications
  + vaga_id BIGINT NULL REFERENCES job_openings(id) ON DELETE SET NULL
  + INDEX (vaga_id)
```

- Portuguese column names match the existing table.
- `salario` numeric (not text) so the front-end formats consistently with `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`; "A combinar" is the null rendering. Alternative (free text) rejected: inconsistent display and no validation.
- `carga_horaria` stays free text — the example "220" (monthly hours) and other common forms ("44h semanais", "12x36") don't fit a number.
- Multi-line fields are plain text; the site renders them with `whitespace-pre-line`, and `beneficios` is split on newlines into a `<ul>`. Alternative (Markdown/HTML) rejected: needs a sanitizer/dependency and is an XSS surface; React's default escaping gives us the "plain text" guarantee for free.
- Denormalize role/area into the application (`cargo = titulo`, `area = area_profissional`) at submission: the existing panel UI and `NOT NULL` columns keep working, and edits to the opening don't rewrite history.
- `ON DELETE SET NULL` is a safety net only; the API offers no delete.
- Migration is additive and idempotent (`CREATE TABLE IF NOT EXISTS`, `ALTER TABLE … ADD COLUMN IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`), appended to both SQL scripts.

### API

Public (no auth):

| Method | Path | Notes |
|---|---|---|
| GET | `/api/jobs` | `status = 'publicada'`, `ORDER BY publicada_em DESC, id DESC`; public columns only |
| GET | `/api/jobs/:id` | 404 unless published |

Recruiter (`requireRecruiter`):

| Method | Path | Notes |
|---|---|---|
| GET | `/api/recruiter/jobs` | all statuses, `ORDER BY updated_at DESC`, with `candidaturas` count via `LEFT JOIN … GROUP BY` |
| POST | `/api/recruiter/jobs` | validates, inserts as `rascunho`, 201 `{ id }` |
| GET | `/api/recruiter/jobs/:id` | full row, for the edit form |
| PUT | `/api/recruiter/jobs/:id` | full replace of editable fields (not `status`), same validation |
| PATCH | `/api/recruiter/jobs/:id/status` | body `{ status: 'publicada' \| 'encerrada' }`; setting `publicada` sets `publicada_em = NOW()` |

- Separate `/api/recruiter/...` prefix instead of reusing `/api/jobs` with optional auth: keeps "public = published only" trivially true and makes auth impossible to forget per route. The existing `/api/applications` recruiter routes are left as-is (not renamed) to avoid breaking the panel.
- Status change as its own endpoint (not part of PUT) so an edit can never accidentally publish/close, and the transition rules live in one place.
- Validation in one `validateJobOpening(body)` helper returning `{ errors: { field: message } }`; 400 responses include `errors` so the panel form can mark fields. Allowed `tipo_contratacao` and UF lists are constants shared by validation (server) and selects (panel) — duplicated in both bundles since they are separate apps; small and stable.
- `GET /api/applications` gains optional `?vaga_id=` and joins `job_openings` to return `vaga_titulo`, `vaga_codigo`; `GET /api/applications/:id` also returns `vaga_id`, `vaga_status`.

### `POST /api/applications` with `vaga_id`

- Order: validate fields → if `vaga_id` present, parse (400 if not a positive integer) and `SELECT titulo, area_profissional FROM job_openings WHERE id = $1 AND status = 'publicada'` (409 if none) → upload resume → insert. Checking the opening **before** the storage upload satisfies "stores no resume file" on rejection.
- Small race (opening closed between the check and the insert) is accepted: the application still lands linked to the opening, which is harmless.
- multer runs before the handler, so the file is already in memory (not in storage) when we reject — nothing to clean up.

### Public site

- New `src/components/Jobs.jsx` section `id="vagas"` placed between `Team` and `ResumeForm` (openings → "or send your resume" flows naturally); `Header` gets `{ label: 'Vagas', href: '#vagas' }`.
- Fetches `GET /api/jobs` on mount (`VITE_API_URL`, same as `ResumeForm`); loading skeleton, empty state and error state all include a link to `#curriculos`.
- `JobModal` built in-house (no library): portal to `document.body`, `role="dialog"` + `aria-modal`, closes on Escape/backdrop/button, locks body scroll, returns focus to the card. Card data is enough to render the modal (list endpoint returns full public fields), so no second request; `GET /api/jobs/:id` exists for future deep links.
- "Publicada há …" computed client-side from `publicada_em` with `Intl.RelativeTimeFormat('pt-BR')` ("hoje", "há 1 dia", "há 3 semanas").
- **Linking to the form**: `App.jsx` holds `selectedJob` state and passes `onApply(job)` to `Jobs` and `{ job, onClearJob }` to `ResumeForm` (lifting state is enough; no context/store needed). `onApply` sets the job and scrolls to `#curriculos` (same smooth scroll as the header).
- `ResumeForm` in linked mode: banner "Candidatura para: **Analista de PCP** (Cód. 6623)" with "Remover" button; hides and skips validation for `cargo`/`area`; appends `vaga_id` to the `FormData`. On 409 it shows the "vaga não está mais disponível" message with a button that clears the link (fields preserved) so the candidate can resend generically.

### Panel

- `Panel.jsx` gets two tabs in the header area: **Candidaturas** (existing list/detail) and **Vagas** (new). Header title becomes "Painel Eloo RH".
- New `src/painel/JobsList.jsx` (table/cards with status badge, count, actions Editar / Publicar / Encerrar / Reabrir) and `src/painel/JobForm.jsx` (create/edit; fields grouped as in the example: Dados da vaga, Benefícios, Responsabilidades, Requisitos; textareas with "uma por linha" hint for benefits). Closing asks for confirmation.
- Clicking an opening's count switches to Candidaturas with `vagaFilter = { id, titulo }`; `ApplicationsList` passes `vaga_id` and shows a removable filter chip. List rows show the opening title/code or "Banco de talentos"; `ApplicationDetail` shows the linked opening and its status.
- `api.js`: generalize `request(path, token, { method, body })` (JSON body + `Content-Type`), keep existing exports, add `listJobs`, `getJob`, `createJob`, `updateJob`, `setJobStatus`, and `vagaId` option on `listApplications`. 400 errors carry `data.errors` on the thrown `Error` for the form.

## Risks / Trade-offs

- [Home page now depends on the API for a section] → Section degrades to an error/empty state; the rest of the page is static and unaffected. API downtime already breaks the resume form, so no new class of failure.
- [Recruiters may leave the client's name inside the description text (the example mentions "Magna") while leaving `empresa` empty] → Out of scope to detect; form hint under "Empresa": "Deixe vazio para exibir como Empresa confidencial — revise também a descrição."
- [CORS] → `cors()` defaults already allow PUT/PATCH with JSON; verify preflight from the panel origin in production (`CORS_ORIGIN`).
- [Race between opening check and insert] → Accepted (see above).
- [Duplicated constants (contract types, UFs) in server and panel] → Small, stable lists; server is authoritative.

## Migration Plan

1. Run the updated `database/supabase_minimal_setup.sql` in the Supabase SQL editor (additive; existing applications get `vaga_id = NULL`).
2. Deploy the API (new routes are additive; `POST /api/applications` without `vaga_id` behaves as before).
3. Build and upload the front-end to Hostinger.
4. Recruiters create and publish the current openings (starting with "Analista de PCP").

Rollback: redeploy the previous front-end and API; the new table/column can stay in place unused.

## Open Questions

- Should closed openings eventually show on the site as "Encerrada" for a while (social proof) instead of disappearing? Doesn't change this design; can be a follow-up.
