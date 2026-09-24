## 1. Database

- [x] 1.1 Append the `job_openings` table (columns, CHECK constraints, `(status, publicada_em DESC)` index, `updated_at` trigger) and the `job_applications.vaga_id` column + FK `ON DELETE SET NULL` + index to `database/supabase_minimal_setup.sql`, all idempotent; verify by running the whole script twice in the Supabase SQL editor without errors and checking the new table/column exist
- [x] 1.2 Mirror the same schema in the MySQL variant `database/minimal_setup.sql`; verify the file parses (e.g. review against MySQL syntax / run on a local MySQL if available)

## 2. API — openings

- [x] 2.1 Add shared constants (allowed `tipo_contratacao`, UF list, statuses) and a `validateJobOpening(body)` helper in `server/index.js` returning per-field errors; verify with manual requests that missing required fields, bad UF, bad contract type, negative salary and `posicoes < 1` each yield HTTP 400 with the field named in `errors`
- [x] 2.2 Implement public `GET /api/jobs` (published only, newest `publicada_em` first, public columns only) and `GET /api/jobs/:id` (404 unless published); verify with `curl` that drafts/closed never appear and return 404 by id
- [x] 2.3 Implement recruiter `GET /api/recruiter/jobs` (all statuses, `updated_at DESC`, with application count), `GET /api/recruiter/jobs/:id`, `POST /api/recruiter/jobs` (inserts as `rascunho`, 201 `{ id }`) and `PUT /api/recruiter/jobs/:id` (404 if missing), all behind `requireRecruiter`; verify with `curl` using a recruiter token, and that each returns 401 without a token
- [x] 2.4 Implement `PATCH /api/recruiter/jobs/:id/status` accepting only `publicada` / `encerrada`, setting `publicada_em = NOW()` on publish (including reopen) and rejecting unknown status or `rascunho` with 400; verify draft→published→closed→published transitions and that `publicada_em` resets on reopen

## 3. API — applications

- [x] 3.1 Update `POST /api/applications`: require `cargo`/`area` only when no `vaga_id`; when `vaga_id` is present, 400 if not a positive integer, 409 if the opening is not published (checked before the resume upload), otherwise store `vaga_id` with `cargo = titulo` and `area = area_profissional`; verify generic submission unchanged, linked submission stored correctly, and closed/draft/nonexistent opening returns 409 with no new row and no new file in the `curriculos` bucket
- [x] 3.2 Update `GET /api/applications` to accept optional `vaga_id` filter and return `vaga_id`, `vaga_titulo`, `vaga_codigo`; update `GET /api/applications/:id` to also return `vaga_status`; verify filtered and unfiltered lists and paging (`hasMore`) with `curl`

## 4. Panel

- [x] 4.1 Generalize `request()` in `src/painel/api.js` to support method + JSON body and attach `errors` from 400 responses to the thrown error; add `listJobs`, `getJob`, `createJob`, `updateJob`, `setJobStatus` and a `vagaId` option on `listApplications`; verify the existing applications list/detail/resume download still work
- [x] 4.2 Add "Candidaturas" / "Vagas" tabs to `Panel.jsx` (title "Painel Eloo RH"); verify switching tabs keeps the session and the applications flow unchanged
- [x] 4.3 Create `src/painel/JobsList.jsx`: all openings with title, code, company or "Empresa confidencial", location, status badge, application count and actions (Editar, Publicar, Encerrar with confirmation, Reabrir), plus empty state with "Criar vaga"; verify each action updates the row and the public site accordingly
- [x] 4.4 Create `src/painel/JobForm.jsx` for create/edit with the fields grouped as Dados da vaga / Benefícios / Responsabilidades / Requisitos, selects for UF and contract type, hints ("uma por linha" for benefits; empty company → "Empresa confidencial, revise também a descrição"), and server field errors shown inline without losing input; verify by creating the "Analista de PCP" example (Cód. 6623, Jarinu/SP, CLT, Produção/Fabricação, 220, R$ 5.000,00, benefits/responsibilities/requirements from the client) and editing it
- [x] 4.5 Make the application count in `JobsList` open the Candidaturas tab filtered by that opening; show the filter chip (clearable) in `ApplicationsList`, the opening title/code or "Banco de talentos" per row, and the linked opening + status in `ApplicationDetail`; verify with one linked and one generic application

## 5. Public site

- [x] 5.1 Create `src/components/Jobs.jsx` (section `id="vagas"`) fetching `GET /api/jobs`, with cards (title, company/"Empresa confidencial", city/UF, contract type, salary formatted BRL or "A combinar", positions, "Publicada há …"), loading, empty and error states linking to `#curriculos`; add it to `App.jsx` between `Team` and `ResumeForm` and add "Vagas" to `NAV_LINKS` in `Header.jsx`; verify all three states by publishing/closing openings and stopping the API
- [x] 5.2 Create the opening details modal (portal, `role="dialog"`, `aria-modal`, Escape/backdrop/button close, body scroll lock, focus return) showing all public fields, line breaks preserved and benefits as a list; verify on desktop and mobile width, and that an opening containing `<script>` text renders it literally
- [x] 5.3 Lift `selectedJob` state to `App.jsx`: "Candidatar-se" closes the modal, sets the job and smooth-scrolls to `#curriculos`; `ResumeForm` shows the "Candidatura para: … (Cód. …)" banner with "Remover", hides/skips `cargo` and `area`, sends `vaga_id`, and on 409 shows "vaga não está mais disponível" with an action to send as generic keeping the filled fields; verify linked submit, remove-link submit, and closing the opening mid-fill

## 6. End-to-end check

- [x] 6.1 Run `npm run build` successfully, then walk the full flow against the real API: create "Analista de PCP" as draft (not visible on site) → publish (visible, "Publicada hoje") → apply with resume from the modal → application appears in the panel linked to the opening and via the count filter → close the opening (disappears from site; a stale linked form gets the 409 message)
