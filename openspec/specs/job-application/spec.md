## Purpose

Lets candidates submit a job application through the public resume form, optionally attaching a resume file, so the eloorh team can review a persisted record of every candidate later.

## Requirements

### Requirement: Job application validation
The system SHALL require `nome`, `email`, and `telefone` on every `POST /api/applications`. When the submission does not reference a job opening, the system SHALL also require `cargo` and `area`; when it references a job opening, `cargo` and `area` SHALL be optional and ignored. The `sobre` field and the resume attachment SHALL be optional.

#### Scenario: Missing required field
- **WHEN** a job application submission without a job opening reference omits `nome`, `email`, `telefone`, `cargo`, or `area`
- **THEN** the system responds with HTTP 400 and a message asking to fill in all required fields, and persists no record

#### Scenario: Missing contact field on a linked application
- **WHEN** a job application submission that references a job opening omits `nome`, `email`, or `telefone`
- **THEN** the system responds with HTTP 400 and a message asking to fill in all required fields, and persists no record

#### Scenario: Linked application without role and area
- **WHEN** a job application submission references a published job opening and omits `cargo` and `area`
- **THEN** the system accepts the submission (subject to the other rules)

### Requirement: Resume attachment constraints
When a resume file is attached, the system SHALL accept only PDF, DOC, or DOCX files up to a configured maximum size (5 MB by default), and SHALL reject anything else without persisting a record.

#### Scenario: Unsupported file type
- **WHEN** a job application is submitted with an attached file whose type is not PDF, DOC, or DOCX
- **THEN** the system responds with HTTP 400 indicating an invalid file format, and persists no record

#### Scenario: File exceeds size limit
- **WHEN** a job application is submitted with an attached file larger than the configured maximum size
- **THEN** the system responds with HTTP 400 indicating the file is too large, and persists no record

### Requirement: Resume storage
When a valid resume file is attached, the system SHALL store it in a dedicated cloud storage location under a generated unique name that preserves the original file extension, before persisting the application record.

#### Scenario: Resume uploaded successfully
- **WHEN** a job application passes validation with a valid resume attached
- **THEN** the system stores the file in cloud storage under a unique generated name and records the storage path, original filename, MIME type, and file size alongside the application

#### Scenario: Storage upload fails
- **WHEN** a job application passes validation with a valid resume attached but the storage upload fails
- **THEN** the system responds with HTTP 500 indicating a storage error, and persists no application record

### Requirement: Application record persistence
The system SHALL persist every validated job application (with or without a resume) as a record that includes the candidate's contact details, desired role, area of interest, optional description, and any resume metadata.

#### Scenario: Application without resume
- **WHEN** a job application passes validation with no resume attached
- **THEN** the system persists the application record with null resume fields and responds with HTTP 201 including the new record's identifier

#### Scenario: Application with resume
- **WHEN** a job application passes validation with a resume successfully stored
- **THEN** the system persists the application record including the resume's storage path and metadata, and responds with HTTP 201 including the new record's identifier

#### Scenario: Persistence failure
- **WHEN** a job application passes validation (and any resume upload succeeds) but saving the record fails
- **THEN** the system responds with HTTP 500 indicating an internal error saving the application

### Requirement: Application linked to a job opening
A job application MAY reference a job opening. When it does, the system SHALL accept it only if the opening exists and is currently published, and SHALL record the link together with the opening's title as the role and its professional area as the area, as they were at submission time. Submissions without a reference SHALL behave exactly as generic applications.

#### Scenario: Application for a published opening
- **WHEN** a valid job application references a published opening
- **THEN** the system persists the application linked to that opening, with the opening's current title as role and its professional area as area, and responds with HTTP 201 including the new record's identifier

#### Scenario: Application for an opening that is not open
- **WHEN** a job application references an opening that does not exist, is a draft, or is closed
- **THEN** the system responds with HTTP 409 and a message that the opening is no longer available, persists no record, and stores no resume file

#### Scenario: Malformed opening reference
- **WHEN** a job application's opening reference is not a valid identifier
- **THEN** the system responds with HTTP 400, persists no record, and stores no resume file

#### Scenario: Generic application unaffected
- **WHEN** a valid job application carries no opening reference
- **THEN** the system persists it with no linked opening, using the submitted role and area, exactly as before this change
