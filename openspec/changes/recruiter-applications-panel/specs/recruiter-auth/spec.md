## Purpose

Controls who may read candidate data on the eloorh site: recruiters sign in with an account created for them by the team, and every recruiter-facing endpoint refuses to answer without a valid session, while the public candidate-facing forms stay open to everyone.

## ADDED Requirements

### Requirement: Recruiter accounts are provisioned, not self-registered
The system SHALL NOT offer any public sign-up path for the recruiter panel. Recruiter accounts SHALL be created out-of-band by an eloorh administrator, and the panel SHALL expose only sign-in, sign-out, and password recovery.

#### Scenario: Panel offers no registration
- **WHEN** a visitor opens the recruiter panel without a session
- **THEN** the panel presents only a sign-in form and a password-recovery link, with no way to create an account

#### Scenario: Self-registration attempt is refused
- **WHEN** someone attempts to register a new account against the authentication provider using the panel's public client credentials
- **THEN** the provider rejects the attempt, because public sign-up is disabled for the project

#### Scenario: Provisioned account can sign in
- **WHEN** an administrator creates a recruiter account with an email and password and gives those credentials to the recruiter
- **THEN** that recruiter can sign in to the panel with them

### Requirement: Recruiter sign-in establishes a session
The system SHALL authenticate a recruiter by email and password and, on success, SHALL hold an access token that identifies the recruiter on subsequent requests.

#### Scenario: Valid credentials
- **WHEN** a recruiter submits an email and password that match a provisioned account
- **THEN** the panel establishes a session and shows the applications list

#### Scenario: Invalid credentials
- **WHEN** a recruiter submits an email or password that does not match a provisioned account
- **THEN** the panel shows an authentication error, establishes no session, and reveals nothing about whether the email exists

#### Scenario: Session survives a page reload
- **WHEN** a signed-in recruiter reloads the panel while the session is still valid
- **THEN** the panel restores the session without asking for the password again

### Requirement: Recruiter endpoints require a valid token
Every endpoint that exposes candidate data SHALL require a valid, unexpired access token, and SHALL reject the request before reading any application data when one is absent or invalid.

#### Scenario: Request without a token
- **WHEN** a request to a recruiter endpoint arrives with no authorization credentials
- **THEN** the system responds with HTTP 401 and returns no candidate data

#### Scenario: Request with an invalid or expired token
- **WHEN** a request to a recruiter endpoint carries a token that is malformed, tampered with, or past its expiry
- **THEN** the system responds with HTTP 401 and returns no candidate data

#### Scenario: Request with a valid token
- **WHEN** a request to a recruiter endpoint carries a valid, unexpired token for a provisioned account
- **THEN** the system proceeds with the request

### Requirement: Sign-out ends the session
The system SHALL let a recruiter end their session, after which the stored credentials SHALL no longer grant access from that browser.

#### Scenario: Recruiter signs out
- **WHEN** a signed-in recruiter chooses to sign out
- **THEN** the panel clears the session and returns to the sign-in form

#### Scenario: Reload after sign-out
- **WHEN** the recruiter reloads the panel after signing out
- **THEN** the panel shows the sign-in form rather than restoring the previous session

### Requirement: Public submission endpoints stay unauthenticated
The system SHALL keep the candidate-facing submission path open: applying for a job SHALL NOT require an account or a token.

#### Scenario: Candidate applies without an account
- **WHEN** a candidate submits the public application form with no authorization credentials
- **THEN** the system accepts the submission exactly as before, unaffected by the recruiter authentication rules
