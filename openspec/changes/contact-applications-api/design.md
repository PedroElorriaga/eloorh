## Context

See proposal.md - Why. The frontend (Vite/React) and the API are separate deployables: the frontend builds to static assets served by Hostinger, while `server/index.js` is a long-running Node/Express process hosted on Railway. The database is a Supabase-hosted Postgres instance, accessed with plain `pg` (not the Supabase client) via `DATABASE_URL`; the Supabase JS client is used only for Storage (resume uploads to the `curriculos` bucket), authenticated with the service-role key. The contact form does not touch either — it resolves entirely in the browser.

## Goals / Non-Goals

**Goals:**
- Define the request/response contract and data model for the application endpoint as already implemented in `server/`.
- Define how a contact submission reaches the eloorh team without any server involvement.
- Make explicit which failure modes are user-facing errors (400) vs. server/infra errors (500).

**Non-Goals:**
- Revisiting the API's hosting choice — Railway is already in place and this change does not reopen it.
- Authentication/authorization for the application endpoint — it is a public, unauthenticated endpoint by design (public apply form).
- Admin-facing views of submitted applications/messages (no read endpoints exist yet).
- Any record of contact messages on eloorh's side beyond the WhatsApp conversation itself.

## Decisions

- **Direct `pg` Pool over Supabase client for the database**: the app already speaks plain SQL (`INSERT ... RETURNING id`) and needs a connection pool; using `pg` directly with `DATABASE_URL` avoids coupling the query layer to Supabase's client library, which is only needed for Storage. Alternative considered: use `@supabase/supabase-js` for both DB and Storage — rejected to keep raw SQL control over the `job_applications` table.
- **Resume files go to Supabase Storage, not local disk or the DB**: `multer` uses `memoryStorage()` (no temp files on the API host) and the buffer is uploaded straight to the `curriculos` bucket; only the storage path and file metadata are persisted in Postgres. This keeps the API host stateless/disposable, which is what lets Railway restart or replace the container freely.
- **Contact messages use a client-side `wa.me` deep link, not the WhatsApp Cloud API**: the form validates locally, builds the message text, percent-encodes it, and opens `https://wa.me/5535984174730?text=...` in a new tab. This needs no Meta Business account, no dedicated API number, no approved message template, and no per-conversation cost, and it starts the thread from the visitor's own number — so the team can simply reply in the chat. Alternatives considered: WhatsApp Cloud API and Twilio WhatsApp, both rejected as disproportionate to the volume of a small consultancy's contact form, and both of which would have required a second WhatsApp number separate from the one already published across the site.
- **No contact endpoint on the API at all**: since delivery happens in the browser, `POST /api/contact` and the whole nodemailer/SMTP path are removed rather than kept as a dormant fallback. Keeping them would mean maintaining credentials for a code path nothing calls.
- **The company number is hard-coded alongside the other published contact details**: `Contact.jsx` and `Footer.jsx` already embed `5535984174730` as a visible `wa.me` link, so the form reads from the same constant rather than introducing a `VITE_` variable for a value that is public and rarely changes.
- **File type allowlist enforced by MIME type, not extension**: `multer`'s `fileFilter` checks `file.mimetype` against a fixed set (`application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`). Simpler than content sniffing; accepted risk that a client can spoof the declared MIME type (see Risks).

## Risks / Trade-offs

- **Delivery depends on the visitor finishing the send in WhatsApp** → the site opens the chat pre-filled, but the visitor still has to press send, and the site has no way to confirm they did; the success state shown in the form is a hand-off confirmation, not a delivery receipt. A visitor without WhatsApp has no path through the form at all. Mitigation: the email address and phone number stay visible in the contact block next to the form, so the other channels remain available.
- **No stored copy of contact messages** → the only record is the WhatsApp thread on the team's phone; there is no database row and no searchable archive. Accepted as the same trade-off the email path had, with the advantage that WhatsApp keeps the conversation history.
- **Spoofable file MIME type on `/api/applications`** → a malicious client could label a non-document file with an allowed MIME type. Mitigation: the file is never executed server-side (stored as an opaque blob in Supabase Storage), so the main residual risk is a mislabeled file being downloaded later by a human reviewer.
- **Service-role Supabase key on the API host** → `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security and must never reach the frontend bundle; it is only read server-side via `process.env`. Mitigation: keep it out of any `VITE_`-prefixed variable and out of version control (already excluded via `.gitignore`).
- **The frontend and the API deploy independently** → the Hostinger build pins `VITE_API_URL` at build time, so moving or renaming the Railway service requires a frontend rebuild, not just an API redeploy. The contact form is immune to this, since it makes no request.

## Migration Plan

The contact form needs no migration: it stops calling the API and starts opening WhatsApp. The `SMTP_*`, `CONTACT_TO_EMAIL`, and `CONTACT_FROM_EMAIL` variables must be deleted from the Railway service, since nothing reads them any more. For the application endpoint the rollout is already done: (1) the SQL setup script has been run against the Supabase project, (2) the documented environment variables are configured on Railway, (3) the frontend build points `VITE_API_URL` at that deployment. Each step is covered as a task in tasks.md.
