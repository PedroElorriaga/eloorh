## Context

- The photos were placed in `dist/assets`. `dist/` is Vite's build output: it is wiped and regenerated on every `vite build`, and it is listed in `.gitignore`, so files there are neither preserved nor versioned.
- The site already serves static images from `public/assets` via absolute paths (`/assets/eloorh-logo.jpeg`, `/assets/eloorh-banner.jpeg`). Vite copies `public/` into `dist/` verbatim at build time.
- `Team.jsx` renders an `Avatar` component (96×96 gradient circle with initials) from a local `TEAM` array.

## Goals / Non-Goals

**Goals:**
- Show the photos in the existing avatar slot with a graceful initials fallback.
- Keep the photo files in a versioned location that survives builds.

**Non-Goals:**
- Redesigning the card layout or avatar size.
- Image optimization pipelines (resizing, WebP conversion, responsive `srcset`).

## Decisions

- **Store photos in `public/assets`, reference as `/assets/<Name>.jpeg`.** Matches the existing logo/banner convention and survives `vite build`. Alternative: import from `src/assets` for hashed filenames — rejected to stay consistent with how the project already handles images; cache-busting is not a concern for these rarely-changing photos.
- **Keep file names as provided (`Fernanda.jpeg`, `Gersonita.jpeg`).** Case matters on the Linux host (Hostinger), so the `photo` paths must match the exact casing.
- **Add an optional `photo` field to each `TEAM` entry; `Avatar` renders `<img>` when present, initials otherwise.** An `onError` handler flips local state to the initials view, so a missing file never shows a broken image. Alternative: always render initials behind the image — rejected as it leaves the broken-image icon on top in some browsers.
- **Image styling: same `w-24 h-24 rounded-full shadow-md` footprint plus `object-cover`,** with `alt={name}` and `loading="lazy"` (the section is below the fold).

## Risks / Trade-offs

- [Fernanda.jpeg is ~190 KB, larger than needed for a 96px avatar] → Acceptable for now; can be resized later without changing specs.
- [Photo faces may be off-center when cropped to a circle] → Adjust `object-position` per member during implementation if needed, verified visually.
