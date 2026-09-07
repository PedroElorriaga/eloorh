## Why

The eloorh site (eloorh.com) is currently a static frontend with no backend: the contact form and the resume/job-application form only simulated success locally, with no email delivery, no persistence, and no way for the eloorh team to actually receive leads or candidate resumes. A backend implementation already exists in the working tree (`server/`, `database/`) but has never been documented as a spec, committed, or deployed — this change captures the intended behavior of that already-built API as the source of truth going forward.

## What Changes

- Add a Node/Express API (`server/index.js`, `server/db.js`) exposing:
  - `GET /api/health` — liveness check.
  - `POST /api/contact` — validates a contact message and sends it by email via SMTP (nodemailer) to the eloorh inbox, with the sender's address set as `replyTo`.
  - `POST /api/applications` — validates a job application, optionally uploads an attached resume (PDF/DOC/DOCX, max 5MB) to Supabase Storage, and persists the application record in a Postgres `job_applications` table (Supabase-hosted).
- Add SQL schema for `job_applications` (`database/supabase_minimal_setup.sql` for Postgres/Supabase, `database/minimal_setup.sql` as a MySQL variant) with indexes on `email`, `area`, `created_at`, and an `updated_at` trigger.
- Update `Contact.jsx` and `ResumeForm.jsx` to call the real API (`VITE_API_URL`) instead of only simulating a successful submission, with loading and error states.
- Add `.env.example` and `backend-setup.md` documenting required environment variables and local setup.

## Capabilities

### New Capabilities
- `contact-message`: Accepting a contact-form submission and delivering it by email to the eloorh team.
- `job-application`: Accepting a job-application submission, storing the optional resume file, and persisting the candidate record for later review.

### Modified Capabilities
(none — this is the first backend capability set for the project)

## Impact

- **Affected code**: `server/index.js`, `server/db.js`, `database/*.sql`, `src/components/Contact.jsx`, `src/components/ResumeForm.jsx`, `package.json` (new deps: express, cors, helmet, morgan, multer, nodemailer, pg, @supabase/supabase-js, dotenv), `.env.example`.
- **New external dependencies**: SMTP provider (Gmail App Password in the documented example), Supabase Postgres database, Supabase Storage bucket (`curriculos`).
- **Deployment**: none yet — the GitHub Actions workflow (`.github/workflows/deploy.yml`) only builds and publishes the static frontend to Hostinger; the API in `server/` has no hosting or CI/CD target configured yet (a follow-up change will cover deploying it, e.g. to Fly.io).
- **Frontend behavior**: the contact and resume forms now depend on `VITE_API_URL` being reachable; failures surface as an inline error message instead of a silent local "success".
