## Why

Candidates can submit applications and resumes through the site, but nobody at eloorh can read them without opening the Supabase dashboard: the `job_applications` table and the `curriculos` Storage bucket are reachable only with the service-role key, which is a server secret and must never be handed to a recruiter. The team needs a page of their own where they can see who applied and download the resume, and — unlike the public forms — that page must be behind a login, because the data it exposes is personal data belonging to candidates.

## What Changes

- Add a recruiter-only panel as a **separate page in the build** (`painel.html`), not a route inside the public single-page app, so the public landing bundle carries none of the panel's code and Hostinger needs no rewrite rule.
- Add sign-in with email and password backed by Supabase Auth. There is **no public sign-up**: recruiter accounts are created by hand in the Supabase dashboard, and the panel offers only sign-in, sign-out, and password recovery.
- Add three authenticated endpoints to the existing Express API, each requiring a valid Supabase access token:
  - `GET /api/applications` — paginated list of applications, newest first.
  - `GET /api/applications/:id` — one application with all its submitted fields.
  - `GET /api/applications/:id/resume` — a short-lived signed URL for the stored resume.
- **BREAKING** for the API surface: `/api/applications` now answers both an unauthenticated `POST` (a candidate applying) and an authenticated `GET` (a recruiter reading). The public `POST` is unchanged — candidates still apply without an account.
- Keep the `curriculos` bucket private. Resumes are never made public; each download is a signed URL minted per request for the recruiter who asked, and it expires.
- Add the Supabase **anon** key to the frontend environment (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) so the panel can sign in. The service-role key stays server-side, as today.

## Capabilities

### New Capabilities
- `recruiter-auth`: Signing a recruiter in, keeping the session, and gating every recruiter-facing endpoint behind a valid token — including the rule that accounts are provisioned out-of-band rather than self-registered.
- `application-review`: Letting an authenticated recruiter list submitted applications, open one in detail, and download the attached resume.

### Modified Capabilities
(none — the public contact and job-application behaviors are untouched; this change only adds a second, authenticated way to read what `job-application` already stores)

## Impact

- **Affected code**: `server/index.js` (auth middleware + three endpoints), new `painel.html` and panel source under `src/`, `vite.config.js` (second build entry), `.env.example`, `backend-setup.md`.
- **New external dependencies**: none. Supabase Auth is already part of the Supabase project in use and is included at no cost at this scale (the Free plan covers 50,000 monthly active users; the panel will have a handful).
- **Deployment**: the Hostinger build must publish `painel.html` alongside `index.html`, and the GitHub Actions workflow must pass `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` at build time. The Railway API needs no new variables — it already holds `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- **Data protection**: this is the first time candidate personal data leaves the Supabase dashboard and travels to a browser. Access control on the API is the only thing standing between a resume and the open internet, so the endpoints must reject a missing or invalid token before reading anything.
