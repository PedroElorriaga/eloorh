## Context

See proposal.md - Why. The frontend (Vite/React) and the new API are separate deployables: the frontend builds to static assets served by Hostinger, while `server/index.js` is a long-running Node/Express process. The database is a Supabase-hosted Postgres instance, accessed with plain `pg` (not the Supabase client) via `DATABASE_URL`; the Supabase JS client is used only for Storage (resume uploads to the `curriculos` bucket), authenticated with the service-role key.

## Goals / Non-Goals

**Goals:**
- Define the request/response contract and data model for the two endpoints as already implemented in `server/`.
- Make explicit which failure modes are user-facing errors (400) vs. server/infra errors (500).

**Non-Goals:**
- Choosing where to host `server/` in production (tracked separately; Fly.io was selected as the target but is not part of this change).
- Authentication/authorization for these endpoints — both are public, unauthenticated endpoints by design (public contact/apply forms).
- Admin-facing views of submitted applications/messages (no read endpoints exist yet).

## Decisions

- **Direct `pg` Pool over Supabase client for the database**: the app already speaks plain SQL (`INSERT ... RETURNING id`) and needs a connection pool; using `pg` directly with `DATABASE_URL` avoids coupling the query layer to Supabase's client library, which is only needed for Storage. Alternative considered: use `@supabase/supabase-js` for both DB and Storage — rejected to keep raw SQL control over the `job_applications` table.
- **Resume files go to Supabase Storage, not local disk or the DB**: `multer` uses `memoryStorage()` (no temp files on the API host) and the buffer is uploaded straight to the `curriculos` bucket; only the storage path and file metadata are persisted in Postgres. This keeps the API host stateless/disposable, which matters for the eventual move to Fly.io.
- **Email is synchronous and required for success on `/api/contact`**: there is no message queue or outbox; the request blocks on `transporter.sendMail` and only returns 201 once the email provider accepts it. Acceptable given expected low volume (contact form, not transactional bulk email); a queue would be premature complexity here.
- **Contact email failures are asymmetric with `/api/applications`**: `/api/contact` has no persistence layer, so a failed send has no fallback — this is accepted as an explicit trade-off (see Risks) rather than solved with retries in this change.
- **File type allowlist enforced by MIME type, not extension**: `multer`'s `fileFilter` checks `file.mimetype` against a fixed set (`application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`). Simpler than content sniffing; accepted risk that a client can spoof the declared MIME type (see Risks).

## Risks / Trade-offs

- **No delivery guarantee for contact messages** → if SMTP is briefly down, the visitor sees an error and must resubmit; there is no stored copy of the message. Mitigation: keep the error message actionable so the user knows to retry or use the phone/WhatsApp contact listed alongside the form.
- **Spoofable file MIME type on `/api/applications`** → a malicious client could label a non-document file with an allowed MIME type. Mitigation: the file is never executed server-side (stored as an opaque blob in Supabase Storage), so the main residual risk is a mislabeled file being downloaded later by a human reviewer.
- **Service-role Supabase key on the API host** → `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security and must never reach the frontend bundle; it is only read server-side via `process.env`. Mitigation: keep it out of any `VITE_`-prefixed variable and out of version control (already excluded via `.gitignore`).
- **No deployment target yet** → this change documents behavior that only runs locally today; production behavior does not change until the API is actually deployed (tracked as a follow-up change).

## Migration Plan

Not applicable to production yet — nothing currently deployed depends on this behavior. Rollout is: (1) run the SQL setup script against the Supabase project, (2) configure the documented environment variables wherever the API is deployed, (3) point the frontend's `VITE_API_URL` at that deployment. Each step is covered as a task in tasks.md.
