## 1. Provision recruiter accounts in Supabase

- [x] 1.1 In the Supabase dashboard, disable public sign-up for the project (Authentication > Sign In / Providers) and verify that calling `signUp` with the anon key is rejected (spec: Recruiter accounts are provisioned, not self-registered)
- [x] 1.2 Create one recruiter account with email and password in Authentication > Users and verify it appears in the user list as confirmed (spec: Recruiter accounts are provisioned, not self-registered)
- [x] 1.3 Copy `SUPABASE_ANON_KEY` from Project Settings > API into `.env` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, document both in `.env.example` and `backend-setup.md` with an explicit warning that the service-role key must never take a `VITE_` prefix, and verify `.env` is still ignored by git

## 2. Authentication middleware on the API

- [x] 2.1 Add a `requireRecruiter` middleware to `server/index.js` that reads the `Authorization: Bearer` header, resolves the token through Supabase Auth, attaches the recruiter to the request, and responds 401 otherwise; verify with `curl` that a request with no header, a garbage token, and an expired token each return 401 (spec: Recruiter endpoints require a valid token)
- [x] 2.2 Verify with `curl` that `POST /api/applications` with no authorization still returns 201, confirming the middleware was not applied to the public submission path (spec: Public submission endpoints stay unauthenticated)

## 3. Recruiter endpoints

- [x] 3.1 Add `GET /api/applications` behind `requireRecruiter`, returning a page of applications ordered by `created_at` descending with a bounded page size and a way to request the next page; verify with a valid token that the newest application comes first and that the page size is respected (spec: Authenticated recruiters can list applications)
- [x] 3.2 Verify `GET /api/applications` returns an empty list rather than an error when the table has no rows (spec: Authenticated recruiters can list applications)
- [x] 3.3 Add `GET /api/applications/:id` behind `requireRecruiter`, returning every submitted field plus the resume's original filename and size; verify a known id returns the full record and an unknown id returns 404 (spec: Authenticated recruiters can open one application)
- [x] 3.4 Add `GET /api/applications/:id/resume` behind `requireRecruiter`, minting a short-lived Supabase Storage signed URL for `arquivo_caminho`; verify the returned link downloads the original file, that an application with no attachment returns 404, and that the link stops working once its expiry passes (spec: Authenticated recruiters can download a resume, Stored resumes are never publicly readable)
- [x] 3.5 Verify that the `curriculos` bucket is still private by requesting a stored object's plain storage URL without a signature and confirming Storage refuses it (spec: Stored resumes are never publicly readable)

## 4. Panel page in the build

- [x] 4.1 Add `painel.html` at the project root and register it alongside `index.html` in `build.rollupOptions.input` in `vite.config.js`; verify `npm run build` emits both `dist/index.html` and `dist/painel.html` (design: second Vite entry)
- [x] 4.2 Build the sign-in view with email, password, and a password-recovery link, wired to Supabase Auth with the anon key; verify valid credentials establish a session, invalid credentials show an error without revealing whether the email exists, and a reload keeps the recruiter signed in (spec: Recruiter sign-in establishes a session)
- [x] 4.3 Add sign-out to the panel and verify the session is cleared and a reload returns to the sign-in form (spec: Sign-out ends the session)
- [x] 4.4 Build the applications list view calling `GET /api/applications` with the access token, showing name, area, role, submission date, and whether a resume is attached, with paging and an empty state; verify against real rows and against an empty table (spec: Authenticated recruiters can list applications)
- [x] 4.5 Build the application detail view with every submitted field and a resume download button that calls `GET /api/applications/:id/resume`; verify the download returns the candidate's original file and that an application with no attachment shows no download button (spec: Authenticated recruiters can open one application, Authenticated recruiters can download a resume)
- [x] 4.6 Verify the public landing page is unaffected: `npm run build` output for `index.html` loads no panel or auth chunk, and the site's existing sections still work (design: public site does not download panel code)

## 5. Deployment

- [x] 5.1 Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the build step in `.github/workflows/deploy.yml` as repository secrets, and verify a build run produces a `dist/` containing `painel.html`
- [x] 5.2 Grep the built `dist/` for the service-role key and confirm zero matches before publishing (design: the anon key and the service-role key look alike)
- [x] 5.3 Deploy the API to Railway first, verify `GET /api/applications` answers 401 without a token in production, then publish the frontend and verify a recruiter can sign in at `https://eloorh.com/painel.html` and download a resume end to end
