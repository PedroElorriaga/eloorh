## 1. Supabase setup

- [x] 1.1 Run `database/supabase_minimal_setup.sql` in the Supabase SQL Editor and verify `job_applications` exists with the expected columns and indexes
- [x] 1.2 Create the `curriculos` Storage bucket in Supabase and verify a manual test upload through the Supabase dashboard succeeds
- [x] 1.3 Copy `.env.example` to `.env`, fill in `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and SMTP values, and verify `npm run dev:server` logs "API pronta em http://localhost:4000" without connection errors

## 2. Verify contact-message behavior against spec

- [x] 2.1 Submit `POST /api/contact` with each required field missing in turn and verify each returns HTTP 400 with the validation message (spec: Contact submission validation)
- [x] 2.2 Submit with an invalid email format and verify HTTP 400 with the email-format message (spec: Contact submission validation)
- [ ] 2.3 Submit a fully valid message and verify HTTP 201, that the configured `CONTACT_TO_EMAIL` inbox receives the email, and that replying to it goes to the submitter's address (spec: Contact submission delivered by email)
- [x] 2.4 Temporarily unset an SMTP env var and verify the endpoint returns HTTP 500 indicating the email service is not configured (spec: Email delivery is a hard dependency)

## 3. Verify job-application behavior against spec

- [x] 3.1 Submit `POST /api/applications` with each required field missing in turn and verify each returns HTTP 400 (spec: Job application validation)
- [x] 3.2 Submit with an attached `.txt` (or other disallowed) file and verify HTTP 400 for invalid file format, with no row written to `job_applications` (spec: Resume attachment constraints)
- [x] 3.3 Submit with a file larger than `MAX_UPLOAD_MB` and verify HTTP 400 for file-too-large, with no row written (spec: Resume attachment constraints)
- [x] 3.4 Submit a valid application with a valid PDF/DOC/DOCX attached and verify: the file appears in the `curriculos` bucket under a generated unique name, and the resulting `job_applications` row has matching `arquivo_caminho`, `arquivo_nome_original`, `arquivo_mime`, and `arquivo_tamanho_bytes` (spec: Resume storage, Application record persistence)
- [x] 3.5 Submit a valid application with no file attached and verify HTTP 201 with a row whose resume fields are null (spec: Application record persistence)

## 4. Frontend integration check

- [x] 4.1 With the backend running locally and `VITE_API_URL=http://localhost:4000`, submit the Contact form in the browser and verify the success state only appears after the API responds 201, and that an induced API error surfaces the inline error message instead of a silent success (`src/components/Contact.jsx`)
- [x] 4.2 Submit the Resume form (with and without a file) in the browser under the same conditions and verify the same success/error behavior (`src/components/ResumeForm.jsx`)

## 5. Commit

- [ ] 5.1 Review `git status`/`git diff` for the backend files and confirm no secrets (`.env`, real credentials) are staged, then commit `server/`, `database/`, `.env.example`, `backend-setup.md`, `package.json`/`package-lock.json`, and the `Contact.jsx`/`ResumeForm.jsx` changes
