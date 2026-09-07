## Purpose

Lets visitors of the eloorh site send a message through the public contact form and have it delivered by email to the eloorh team, without requiring the visitor to have their own email client.

## ADDED Requirements

### Requirement: Contact submission validation
The system SHALL require `nome`, `email`, `assunto`, and `mensagem` on `POST /api/contact`, and SHALL require `email` to match a valid email address format.

#### Scenario: Missing required field
- **WHEN** a contact submission omits `nome`, `email`, `assunto`, or `mensagem` (empty or whitespace-only)
- **THEN** the system responds with HTTP 400 and a message asking to fill in all required fields, and sends no email

#### Scenario: Invalid email format
- **WHEN** a contact submission's `email` does not match a valid email address pattern
- **THEN** the system responds with HTTP 400 and a message asking for a valid email, and sends no email

### Requirement: Contact submission delivered by email
On a valid submission, the system SHALL deliver the message by email to the configured eloorh contact address, with the submitter's address set as the reply-to address.

#### Scenario: Valid submission is emailed
- **WHEN** a contact submission passes validation
- **THEN** the system sends an email to the configured contact address with the submitter's name, email, subject, and message, using the submitter's email as reply-to, and subject prefixed to identify it as a site contact message
- **AND** the system responds with HTTP 201 confirming the message was sent

### Requirement: Email delivery is a hard dependency
The system SHALL treat email delivery as required for a successful contact submission: if the email service is not configured, or if sending fails, the submission SHALL NOT be reported as successful.

#### Scenario: Email service not configured
- **WHEN** a contact submission passes validation but the server has no SMTP credentials configured
- **THEN** the system responds with HTTP 500 indicating the email service is not configured, and sends no email

#### Scenario: Email authentication failure
- **WHEN** a contact submission passes validation but the configured SMTP credentials are rejected by the email provider
- **THEN** the system responds with HTTP 500 indicating an SMTP authentication failure

#### Scenario: Other email delivery failure
- **WHEN** a contact submission passes validation but the email fails to send for a reason other than authentication
- **THEN** the system responds with HTTP 500 with a generic message asking the submitter to try again
