## Purpose

Defines how the public Eloo RH site presents its team members in the "Quem somos" section, so visitors can recognize the people behind the company.

## Requirements

### Requirement: Team member photo on card
Each team member card in the "Quem somos" section SHALL display that member's photo as a circular avatar at the top of the card, filling the circle without distorting the image's aspect ratio.

#### Scenario: Fernanda's card shows her photo
- **WHEN** a visitor views the "Quem somos" section
- **THEN** Fernanda Ramalho's card displays her photo as a circular avatar instead of the "FR" initials

#### Scenario: Gersonita's card shows her photo
- **WHEN** a visitor views the "Quem somos" section
- **THEN** Gersonita Pinheiro's card displays her photo as a circular avatar instead of the "GP" initials

#### Scenario: Photo is not distorted
- **WHEN** a member's photo has an aspect ratio different from 1:1
- **THEN** the avatar crops the photo to fill the circle rather than stretching or squashing it

### Requirement: Accessible team photo
Each team member photo SHALL have alternative text that identifies the member by name.

#### Scenario: Screen reader announces the member
- **WHEN** assistive technology reads a team member's photo
- **THEN** it announces alternative text containing the member's full name

### Requirement: Initials fallback
When a team member has no photo configured, or the photo fails to load, the card SHALL display the member's initials avatar instead, with no broken-image indicator.

#### Scenario: Photo fails to load
- **WHEN** a member's photo cannot be loaded (e.g., the file is missing)
- **THEN** the card shows the member's initials on the colored circular avatar

#### Scenario: Member without photo
- **WHEN** a team member entry has no photo configured
- **THEN** the card shows the member's initials on the colored circular avatar

### Requirement: Photos available in production builds
The team photos SHALL be served by the deployed site after a production build.

#### Scenario: Photos present after build
- **WHEN** the site is built for production and deployed
- **THEN** each team member photo loads successfully on the "Quem somos" section
