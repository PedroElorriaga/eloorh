## 1. Supabase setup

- [x] 1.1 Run `database/supabase_minimal_setup.sql` in the Supabase SQL Editor and verify `job_applications` exists with the expected columns and indexes
- [x] 1.2 Create the `curriculos` Storage bucket in Supabase and verify a manual test upload through the Supabase dashboard succeeds
- [x] 1.3 Copy `.env.example` to `.env`, fill in `DATABASE_URL`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY`, and verify `npm run dev:server` logs "API pronta em http://localhost:4000" without connection errors

## 2. Switch contact delivery to WhatsApp

- [x] 2.1 Remove `POST /api/contact`, the nodemailer transporter, the `escapeHtml` helper, and the `contactToEmail`/`contactFromEmail`/`smtpSecure` constants from `server/index.js`, and drop `nodemailer` from `package.json` (spec: Contact delivery has no server dependency)
- [x] 2.2 Remove the SMTP block (`SMTP_*`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`) from `.env.example` and the corresponding setup instructions from `backend-setup.md` (spec: Contact delivery has no server dependency)
- [x] 2.3 Rewrite `handleSubmit` in `src/components/Contact.jsx` to build the pre-filled message text, percent-encode it, and open `https://wa.me/5535984174730?text=...` in a new tab, dropping the `fetch`, the `isSubmitting` state, and the `submitError` state (spec: Contact submission handed off to WhatsApp)
- [x] 2.4 Submit the contact form with each required field empty in turn, and with a malformed email, and verify each shows its inline error and that no WhatsApp tab opens (spec: Contact submission validation)
- [x] 2.5 Submit a fully valid message containing accents and line breaks, and verify WhatsApp opens in a new tab addressed to (35) 98417-4730 with the name, email, subject, and message rendered exactly as typed (spec: Contact submission handed off to WhatsApp)
- [x] 2.6 Verify the same valid submission on a mobile browser opens the WhatsApp app rather than WhatsApp Web, and that the form shows its success state with the "Nova mensagem" reset working (spec: Contact submission handed off to WhatsApp)

## 3. Verify job-application behavior against spec

- [x] 3.1 Submit `POST /api/applications` with each required field missing in turn and verify each returns HTTP 400 (spec: Job application validation)
- [x] 3.2 Submit with an attached `.txt` (or other disallowed) file and verify HTTP 400 for invalid file format, with no row written to `job_applications` (spec: Resume attachment constraints)
- [x] 3.3 Submit with a file larger than `MAX_UPLOAD_MB` and verify HTTP 400 for file-too-large, with no row written (spec: Resume attachment constraints)
- [x] 3.4 Submit a valid application with a valid PDF/DOC/DOCX attached and verify: the file appears in the `curriculos` bucket under a generated unique name, and the resulting `job_applications` row has matching `arquivo_caminho`, `arquivo_nome_original`, `arquivo_mime`, and `arquivo_tamanho_bytes` (spec: Resume storage, Application record persistence)
- [x] 3.5 Submit a valid application with no file attached and verify HTTP 201 with a row whose resume fields are null (spec: Application record persistence)

## 4. Frontend integration check

- [x] 4.1 Stop the backend entirely and verify the Contact form still validates and opens WhatsApp, confirming it issues no network request of its own (`src/components/Contact.jsx`, spec: Contact delivery has no server dependency)
- [x] 4.2 Submit the Resume form (with and without a file) in the browser with the backend running and `VITE_API_URL=http://localhost:4000`, and verify the success state only appears after the API responds 201, while an induced API error surfaces the inline error message instead of a silent success (`src/components/ResumeForm.jsx`)

## 5. Commit

- [x] 5.1 Review `git status`/`git diff` for the backend files and confirm no secrets (`.env`, real credentials) are staged, then commit `server/`, `database/`, `.env.example`, `backend-setup.md`, `package.json`/`package-lock.json`, and the `Contact.jsx`/`ResumeForm.jsx` changes

## 6. Commit the WhatsApp switch

- [x] 6.1 Review the diff for `server/index.js`, `src/components/Contact.jsx`, `.env.example`, `backend-setup.md`, and `package.json`/`package-lock.json`, confirm no SMTP credentials remain anywhere in the tree, and commit
