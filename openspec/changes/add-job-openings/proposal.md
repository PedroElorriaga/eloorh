## Why

Eloo RH recruits for client companies, but the site only offers a generic resume form ("banco de talentos"): candidates cannot see which positions are open today, and recruiters cannot tell which opening a candidate is interested in. The client wants to publish the openings they currently have (e.g. "Analista de PCP — Jarinu, SP, CLT, R$ 5.000,00, Cód. 6623") and receive applications tied to each one.

## What Changes

- New **job openings** ("vagas") stored in the database, each with: title, optional job code, optional hiring company, location (city/UF), contract type, professional area, weekly/monthly workload, optional salary, number of positions, benefits, responsibilities, requirements, and a lifecycle status (draft → published → closed, closed can be reopened).
- **Recruiter panel**: a new "Vagas" area where authenticated recruiters list all openings (any status), create, edit, publish, close and reopen them, and see how many applications each opening received.
- **Public site**: a new "Vagas" section on the home page (and header nav link) listing published openings as cards; clicking a card opens a modal with the full details. Openings without a company show "Empresa confidencial". When nothing is published, the section shows an empty state pointing to the resume form.
- **Apply to an opening**: the modal's "Candidatar-se" button takes the candidate to the existing resume form already linked to that opening; the form no longer asks for "Cargo desejado" / "Área de interesse" in that case, since they come from the opening. Generic applications (no opening) keep working exactly as today.
- **Application review**: the panel's application list and detail show which opening each application was for (if any), and the list can be filtered by opening.
- New public read-only API for published openings and recruiter-only API for managing them; `POST /api/applications` accepts an optional opening reference.

## Capabilities

### New Capabilities
- `job-openings`: Public listing and detail view of published job openings on the site, including how candidates start an application for a specific opening.
- `job-opening-management`: Authenticated recruiters create, edit, publish, close and reopen job openings in the panel.

### Modified Capabilities
- `job-application`: Submissions may reference a published opening; when they do, role and area are taken from the opening instead of being required from the candidate, and submissions for openings that are not open are rejected.
- `application-review`: Application list and detail include the linked opening, and the list can be filtered by opening.

## Impact

- **Database**: new `job_openings` table; new nullable `vaga_id` column on `job_applications` (existing rows unaffected). Both SQL setup scripts (`database/supabase_minimal_setup.sql`, `database/minimal_setup.sql`) updated idempotently.
- **API** (`server/index.js`): new public `GET /api/jobs`, `GET /api/jobs/:id`; new recruiter `GET/POST /api/recruiter/jobs`, `GET/PUT /api/recruiter/jobs/:id`, `PATCH /api/recruiter/jobs/:id/status`; changes to `POST /api/applications`, `GET /api/applications` and `GET /api/applications/:id`.
- **Front-end**: new `Jobs` section + modal (`src/components/`), `App.jsx`, `Header.jsx` nav, `ResumeForm.jsx` (linked-opening mode); panel gets tabs and new job list/form screens (`src/painel/`), `api.js` gains write requests.
- No new dependencies.
