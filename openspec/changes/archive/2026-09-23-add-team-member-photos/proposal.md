## Why

The "Quem somos" section shows Fernanda and Gersonita only as colored circles with their initials. Real photos make the team feel closer and more trustworthy to visitors and candidates, and the photos are now available (`Fernanda.jpeg`, `Gersonita.jpeg`, currently dropped in `dist/assets`).

## What Changes

- Each team card in the "Quem somos" section shows the member's photo in place of the initials avatar.
- The photo keeps the current avatar footprint (circular, same size), is cropped to fill the circle without distortion, and carries alt text with the member's name.
- If a photo fails to load (or a member has no photo), the card falls back to the existing initials avatar.
- The two photos move into the project's versioned static assets (`public/assets`) so they survive `vite build`, which regenerates `dist/`, and are committed (`dist/` is gitignored).

## Capabilities

### New Capabilities
- `team-section`: How the public site presents the Eloo RH team members ("Quem somos" cards), including member photos and their fallback.

### Modified Capabilities
<!-- None -->

## Impact

- `src/components/Team.jsx`: team data gains a photo path per member; the avatar renders the photo with initials fallback.
- `public/assets/`: new files `Fernanda.jpeg` and `Gersonita.jpeg` (copied from `dist/assets`).
- No backend, API, or dependency changes.
