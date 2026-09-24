## MODIFIED Requirements

### Requirement: Authenticated recruiters can list applications
The system SHALL return submitted applications to an authenticated recruiter, ordered by submission date with the most recent first, in pages of a bounded size, optionally restricted to the applications linked to one job opening.

#### Scenario: Listing applications
- **WHEN** an authenticated recruiter requests the application list
- **THEN** the system returns a page of applications, newest first, each carrying enough detail to identify the candidate (at least name, area, role applied for, submission date, whether a resume is attached, and the linked job opening's title and code when there is one)

#### Scenario: Paging through a long list
- **WHEN** more applications exist than fit in a single page
- **THEN** the system returns only that page and enough information for the recruiter to request the next one

#### Scenario: No applications yet
- **WHEN** an authenticated recruiter requests the list and no applications have been submitted
- **THEN** the system returns an empty list and the panel shows an empty state rather than an error

#### Scenario: Filtering by job opening
- **WHEN** an authenticated recruiter requests the application list restricted to one job opening
- **THEN** the system returns only applications linked to that opening, newest first and paged as usual, and the panel shows which opening the list is filtered by with a way to clear the filter

#### Scenario: Generic applications are identified
- **WHEN** an application in the list has no linked job opening
- **THEN** the panel identifies it as a generic application ("Banco de talentos")

### Requirement: Authenticated recruiters can open one application
The system SHALL return every field a candidate submitted for a single application, identified by its id, together with the job opening it is linked to, if any.

#### Scenario: Opening an existing application
- **WHEN** an authenticated recruiter requests an application that exists
- **THEN** the system returns its name, email, phone, role, area, free-text description, submission date, the attached resume's original filename and size when one exists, and the linked job opening's id, title, code and current status when there is one

#### Scenario: Opening an application that does not exist
- **WHEN** an authenticated recruiter requests an application id that is not in the records
- **THEN** the system responds with HTTP 404
