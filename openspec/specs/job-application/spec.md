## Purpose

Lets candidates submit a job application through the public resume form, optionally attaching a resume file, so the eloorh team can review a persisted record of every candidate later.

## Requirements

### Requirement: Job application validation
The system SHALL require `nome`, `email`, `telefone`, `cargo`, and `area` on `POST /api/applications`. The `sobre` field and the resume attachment SHALL be optional.

#### Scenario: Missing required field
- **WHEN** a job application submission omits `nome`, `email`, `telefone`, `cargo`, or `area`
- **THEN** the system responds with HTTP 400 and a message asking to fill in all required fields, and persists no record

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
