## Why

The eloorh site (eloorh.com) is currently a static frontend with no backend: the contact form and the resume/job-application form only simulated success locally, with no delivery, no persistence, and no way for the eloorh team to actually receive leads or candidate resumes. A backend implementation already exists in the working tree (`server/`, `database/`) but has never been documented as a spec, committed, or deployed — this change captures the intended behavior of that already-built API as the source of truth going forward.

Contact messages were originally delivered by email over SMTP. That path was dropped in favor of WhatsApp: it is the channel the eloorh team already answers on (the number is published in the site header, contact block, and footer), it removes the SMTP credentials and the delivery-failure surface from the server entirely, and a message sent from the visitor's own WhatsApp gives the team a reply channel at no cost.

## What Changes

- Add a Node/Express API (`server/index.js`, `server/db.js`) exposing:
  - `GET /api/health` — liveness check.
  - `POST /api/applications` — validates a job application, optionally uploads an attached resume (PDF/DOC/DOCX, max 5MB) to Supabase Storage, and persists the application record in a Postgres `job_applications` table (Supabase-hosted).
- Add SQL schema for `job_applications` (`database/supabase_minimal_setup.sql` for Postgres/Supabase, `database/minimal_setup.sql` as a MySQL variant) with indexes on `email`, `area`, `created_at`, and an `updated_at` trigger.
- Update `Contact.jsx` to build a pre-filled `https://wa.me/<numero>` link from the validated form fields and open it in a new tab, instead of only simulating a successful submission. No API call, no loading state tied to the network.
- Update `ResumeForm.jsx` to call the real API (`VITE_API_URL`) instead of only simulating a successful submission, with loading and error states.
- Add `.env.example` and `backend-setup.md` documenting required environment variables and local setup.

## Capabilities

### New Capabilities
- `contact-message`: Accepting a contact-form submission and handing it off to the eloorh team's WhatsApp as a pre-filled message, entirely client-side.
- `job-application`: Accepting a job-application submission, storing the optional resume file, and persisting the candidate record for later review.

### Modified Capabilities
(none — this is the first backend capability set for the project)

## Impact

- **Affected code**: `server/index.js`, `server/db.js`, `database/*.sql`, `src/components/Contact.jsx`, `src/components/ResumeForm.jsx`, `package.json` (new deps: express, cors, helmet, morgan, multer, pg, @supabase/supabase-js, dotenv), `.env.example`.
- **New external dependencies**: Supabase Postgres database, Supabase Storage bucket (`curriculos`). Contact delivery adds none — `wa.me` is a plain link, requires no account, key, or quota.
- **Deployment**: two targets. The GitHub Actions workflow (`.github/workflows/deploy.yml`) builds the static frontend and publishes it to Hostinger on every push to `main`, injecting `VITE_API_URL=https://eloorh-production.up.railway.app` at build time; the API in `server/` is hosted on Railway from the same repo (`npm run server`), with `CORS_ORIGIN` set to `https://eloorh.com`.
- **Frontend behavior**: the resume form now depends on `VITE_API_URL` being reachable; failures surface as an inline error message instead of a silent local "success". The contact form works with the API down, since it makes no request.
