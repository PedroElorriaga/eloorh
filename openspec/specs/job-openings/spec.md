## Purpose

Lets visitors of the Eloo RH site browse the job openings the team is currently recruiting for, read the full details of each one, and start an application tied to a specific opening.

## Requirements

### Requirement: Published openings are listed on the site
The home page SHALL include a "Vagas" section, reachable from the header navigation, that lists every job opening currently in the published state as a card, most recently published first. Each card SHALL show the opening's title, location (city and UF), contract type, salary (or "A combinar" when no salary is set), number of positions, the hiring company (or "Empresa confidencial" when none is set), and how long ago it was published (e.g. "Publicada há 1 dia").

#### Scenario: Visitor sees published openings
- **WHEN** a visitor opens the home page and there are published openings
- **THEN** the "Vagas" section shows one card per published opening, ordered from most to least recently published

#### Scenario: Drafts and closed openings are not listed
- **WHEN** an opening is in the draft or closed state
- **THEN** it does not appear in the "Vagas" section

#### Scenario: Opening without company
- **WHEN** a published opening has no hiring company set
- **THEN** its card and details show "Empresa confidencial" in place of the company name

#### Scenario: Opening without salary
- **WHEN** a published opening has no salary set
- **THEN** its card and details show "A combinar" in place of the salary

#### Scenario: Salary formatting
- **WHEN** a published opening has a salary of 5000
- **THEN** the salary is shown as "R$ 5.000,00"

### Requirement: Opening details
Selecting an opening card SHALL open a dialog with all public details of that opening: title, job code (when set), company or "Empresa confidencial", location, publication age, number of positions, contract type, professional area, workload, salary, benefits, responsibilities and requirements. Multi-line text SHALL keep the line breaks the recruiter entered, and benefits SHALL be shown as a list with one item per line. The dialog SHALL be closable by a close button, by pressing Escape, and by clicking outside it.

#### Scenario: Visitor opens an opening
- **WHEN** a visitor clicks the card of a published opening
- **THEN** a dialog opens showing every public field of that opening, with optional fields that are empty omitted (except company and salary, which show their fallback texts)

#### Scenario: Visitor closes the dialog
- **WHEN** the dialog is open and the visitor presses Escape, clicks the close button, or clicks outside the dialog
- **THEN** the dialog closes and the page stays at the "Vagas" section

#### Scenario: Recruiter-entered text is shown as plain text
- **WHEN** an opening's text fields contain HTML or script markup
- **THEN** the site displays that markup literally as text and never interprets or executes it

### Requirement: Empty and unavailable states
The "Vagas" section SHALL remain usable when there is nothing to show or the openings cannot be loaded, and SHALL NOT affect the rest of the page.

#### Scenario: No openings published
- **WHEN** a visitor opens the home page and no opening is published
- **THEN** the "Vagas" section shows a message that there are no open positions at the moment and invites the visitor to register their resume, linking to the resume form

#### Scenario: Openings cannot be loaded
- **WHEN** the openings request fails (API unreachable or error response)
- **THEN** the "Vagas" section shows a short error message with the same invitation to register a resume, and every other section of the page works normally

### Requirement: Public openings API exposes only published openings
The system SHALL offer unauthenticated read access to published openings only, returning only their public fields.

#### Scenario: Listing published openings
- **WHEN** anyone requests the public openings list
- **THEN** the system responds with HTTP 200 and only the openings in the published state, most recently published first, each with its public fields and no internal-only data (such as application counts)

#### Scenario: Requesting an opening that is not published
- **WHEN** anyone requests a single opening by id through the public API and that opening does not exist, is a draft, or is closed
- **THEN** the system responds with HTTP 404

### Requirement: Start an application from an opening
Each opening's dialog SHALL offer a "Candidatar-se" action that takes the visitor to the resume form linked to that opening. While linked, the form SHALL clearly show which opening the application is for (title and job code when set), SHALL NOT ask for the desired role or area of interest, and SHALL let the candidate remove the link to send a generic application instead.

#### Scenario: Candidate clicks "Candidatar-se"
- **WHEN** a visitor clicks "Candidatar-se" in an opening's dialog
- **THEN** the dialog closes, the page scrolls to the resume form, and the form indicates it is an application for that opening

#### Scenario: Linked form hides role and area
- **WHEN** the resume form is linked to an opening
- **THEN** the "Cargo desejado" and "Área de interesse" fields are not shown and are not required

#### Scenario: Candidate removes the link
- **WHEN** the candidate removes the opening link from the form
- **THEN** the form returns to the generic application, showing and requiring "Cargo desejado" and "Área de interesse" again

#### Scenario: Opening closed while the candidate fills the form
- **WHEN** a candidate submits a form linked to an opening that was closed after the page loaded
- **THEN** the form shows a message that the opening is no longer available and offers to send the application as a generic one, keeping the fields already filled in
