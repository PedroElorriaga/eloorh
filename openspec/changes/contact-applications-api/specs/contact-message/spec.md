## Purpose

Lets visitors of the eloorh site send a message through the public contact form and have it delivered to the eloorh team's WhatsApp, using the visitor's own WhatsApp account, without requiring a backend or an email client.

## ADDED Requirements

### Requirement: Contact submission validation
The system SHALL require `nome`, `email`, `assunto`, and `mensagem` in the contact form, and SHALL require `email` to match a valid email address format, before handing the message off to WhatsApp.

#### Scenario: Missing required field
- **WHEN** a contact submission omits `nome`, `email`, `assunto`, or `mensagem` (empty or whitespace-only)
- **THEN** the system shows an inline error on each offending field and does not open WhatsApp

#### Scenario: Invalid email format
- **WHEN** a contact submission's `email` does not match a valid email address pattern
- **THEN** the system shows an inline error asking for a valid email and does not open WhatsApp

### Requirement: Contact submission handed off to WhatsApp
On a valid submission, the system SHALL open WhatsApp addressed to the configured eloorh company number, with a message pre-filled with the submitter's name, email, subject, and message.

#### Scenario: Valid submission opens WhatsApp
- **WHEN** a contact submission passes validation
- **THEN** the system opens `https://wa.me/<company number>?text=<pre-filled message>` in a new browser tab, where the pre-filled text identifies the message as coming from the site and carries the submitter's name, email, subject, and message

#### Scenario: Message text is URL-encoded
- **WHEN** the submitted fields contain line breaks, accented characters, or other characters unsafe in a URL
- **THEN** the system percent-encodes the pre-filled text so WhatsApp receives the message exactly as typed

#### Scenario: Submitter sees confirmation in the site
- **WHEN** the system has opened WhatsApp for a valid submission
- **THEN** the contact form shows its success state so the visitor knows the hand-off happened, with the option to compose a new message

### Requirement: Contact delivery has no server dependency
The contact form SHALL be entirely client-side: it SHALL NOT call the eloorh API, and the system SHALL NOT expose a contact endpoint or depend on an email service.

#### Scenario: Backend unavailable
- **WHEN** the eloorh API is unreachable or not deployed
- **THEN** the contact form still validates and opens WhatsApp normally, because it issues no network request of its own
