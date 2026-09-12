## Purpose

Gives an authenticated eloorh recruiter a place to read what candidates submitted — browsing the applications that arrived, opening one to see every field the candidate filled in, and downloading the attached resume — without ever exposing the stored files to the public internet.

## Requirements

### Requirement: Authenticated recruiters can list applications
The system SHALL return submitted applications to an authenticated recruiter, ordered by submission date with the most recent first, in pages of a bounded size.

#### Scenario: Listing applications
- **WHEN** an authenticated recruiter requests the application list
- **THEN** the system returns a page of applications, newest first, each carrying enough detail to identify the candidate (at least name, area, role applied for, submission date, and whether a resume is attached)

#### Scenario: Paging through a long list
- **WHEN** more applications exist than fit in a single page
- **THEN** the system returns only that page and enough information for the recruiter to request the next one

#### Scenario: No applications yet
- **WHEN** an authenticated recruiter requests the list and no applications have been submitted
- **THEN** the system returns an empty list and the panel shows an empty state rather than an error

### Requirement: Authenticated recruiters can open one application
The system SHALL return every field a candidate submitted for a single application, identified by its id.

#### Scenario: Opening an existing application
- **WHEN** an authenticated recruiter requests an application that exists
- **THEN** the system returns its name, email, phone, role, area, free-text description, submission date, and the attached resume's original filename and size when one exists

#### Scenario: Opening an application that does not exist
- **WHEN** an authenticated recruiter requests an application id that is not in the records
- **THEN** the system responds with HTTP 404

### Requirement: Authenticated recruiters can download a resume
The system SHALL give an authenticated recruiter access to the resume stored for an application, through a link that grants access for a limited time rather than a permanently readable address.

#### Scenario: Downloading an attached resume
- **WHEN** an authenticated recruiter requests the resume for an application that has one
- **THEN** the system returns a time-limited link to the stored file, and following it downloads the file the candidate uploaded

#### Scenario: Application with no resume
- **WHEN** an authenticated recruiter requests the resume for an application that was submitted without a file
- **THEN** the system responds with HTTP 404 and the panel offers no download for that application

#### Scenario: Link stops working after it expires
- **WHEN** the time limit on a previously issued download link elapses
- **THEN** following that link no longer returns the file, and a new request is required to download it again

### Requirement: Stored resumes are never publicly readable
The system SHALL keep resume files private: they SHALL NOT be reachable by guessing or sharing a permanent address, and every download SHALL be authorized per request.

#### Scenario: Direct access without authorization
- **WHEN** someone requests a stored resume's underlying storage address without a valid, unexpired authorization for it
- **THEN** the storage refuses the request

#### Scenario: Unauthenticated download attempt
- **WHEN** a request for an application's resume arrives without a valid recruiter token
- **THEN** the system responds with HTTP 401 and issues no download link
