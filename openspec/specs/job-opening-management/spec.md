## Purpose

Lets authenticated Eloo RH recruiters maintain the job openings shown on the site — creating them as drafts, editing their details, publishing, closing and reopening them — from the recruiter panel.

## Requirements

### Requirement: Opening management requires recruiter authentication
Every endpoint that lists openings in any state other than published, or that creates or changes an opening, SHALL require a valid, unexpired recruiter access token and SHALL reject the request before reading or changing any opening when the token is absent or invalid.

#### Scenario: Management request without a valid token
- **WHEN** a request to list, create, edit or change the status of openings through the management API arrives without a valid recruiter token
- **THEN** the system responds with HTTP 401 and neither returns nor changes any opening

### Requirement: Recruiters list all openings
The panel SHALL offer a "Vagas" area, alongside the existing applications list, showing every opening in any state, most recently updated first, each with its title, job code, company (or "Empresa confidencial"), location, status (Rascunho, Publicada or Encerrada) and the number of applications linked to it.

#### Scenario: Listing openings in the panel
- **WHEN** an authenticated recruiter opens the "Vagas" area
- **THEN** the panel shows all openings, including drafts and closed ones, with their status and application count

#### Scenario: No openings yet
- **WHEN** an authenticated recruiter opens the "Vagas" area and no opening exists
- **THEN** the panel shows an empty state with an action to create the first opening

#### Scenario: Viewing applications for an opening
- **WHEN** a recruiter selects the application count of an opening
- **THEN** the panel shows the applications list filtered to that opening

### Requirement: Recruiters create openings
An authenticated recruiter SHALL be able to create an opening. `titulo`, `cidade`, `uf`, `tipo_contratacao`, `area_profissional` and `responsabilidades` SHALL be required; `codigo`, `empresa`, `carga_horaria`, `salario`, `beneficios` and `requisitos` SHALL be optional; `posicoes` SHALL default to 1. `uf` SHALL be a valid Brazilian state abbreviation, `tipo_contratacao` SHALL be one of CLT (Efetivo), PJ, Estágio, Temporário, Jovem Aprendiz or Freelancer, `salario` when present SHALL be a non-negative amount in reais, and `posicoes` SHALL be an integer of at least 1. A new opening SHALL start as a draft.

#### Scenario: Valid opening created
- **WHEN** a recruiter submits a new opening with all required fields valid
- **THEN** the system stores it in the draft state, responds with HTTP 201 and its id, and it does not yet appear on the public site

#### Scenario: Missing or invalid field
- **WHEN** a recruiter submits an opening with a required field missing or any field failing its constraint
- **THEN** the system responds with HTTP 400 identifying the offending fields, stores nothing, and the panel shows the errors next to those fields while keeping what the recruiter typed

#### Scenario: Example opening
- **WHEN** a recruiter creates the opening "Analista de PCP", código 6623, Jarinu/SP, CLT (Efetivo), área Produção/Fabricação, carga horária 220, salário 5000, 1 posição, with its benefits, responsibilities and requirements, and publishes it
- **THEN** the site shows it with all those details exactly as entered

### Requirement: Recruiters edit openings
An authenticated recruiter SHALL be able to edit any field of an opening in any state, subject to the same validation as creation. Edits to a published opening SHALL be visible on the site on the next load. Editing an opening SHALL NOT change the role and area recorded on applications already submitted for it.

#### Scenario: Editing a published opening
- **WHEN** a recruiter changes the salary of a published opening and saves
- **THEN** the system stores the change and visitors loading the site afterwards see the new salary

#### Scenario: Editing an opening that does not exist
- **WHEN** a recruiter tries to edit an opening id that is not in the records
- **THEN** the system responds with HTTP 404

#### Scenario: Past applications keep their recorded role
- **WHEN** a recruiter renames an opening that already has applications
- **THEN** those applications still show the role recorded when they were submitted, and remain linked to the opening

### Requirement: Opening lifecycle
An opening SHALL be in exactly one of three states: draft (Rascunho), published (Publicada) or closed (Encerrada). Recruiters SHALL be able to publish a draft or closed opening, close a draft or published opening, and SHALL NOT be able to return an opening to draft. Publishing SHALL record the publication date used for "Publicada há …", including when reopening a closed opening. Only published openings SHALL be shown publicly and accept applications. Openings SHALL NOT be deleted; closing is how an opening is taken down.

#### Scenario: Publishing a draft
- **WHEN** a recruiter publishes a draft opening
- **THEN** it becomes published, its publication date is set to now, and it appears on the public site

#### Scenario: Closing a published opening
- **WHEN** a recruiter closes a published opening
- **THEN** it becomes closed, disappears from the public site, and new applications for it are rejected, while applications already received stay linked to it

#### Scenario: Reopening a closed opening
- **WHEN** a recruiter publishes a closed opening
- **THEN** it becomes published again with its publication date reset to now

#### Scenario: Invalid transition
- **WHEN** a recruiter requests an unknown status or tries to move an opening back to draft
- **THEN** the system responds with HTTP 400 and the opening's state is unchanged
