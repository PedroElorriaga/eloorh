## 1. Assets

- [x] 1.1 Copy `dist/assets/Fernanda.jpeg` and `dist/assets/Gersonita.jpeg` to `public/assets/` (keeping exact file names) and verify both files exist there

## 2. Team cards

- [x] 2.1 In `src/components/Team.jsx`, add `photo: '/assets/Fernanda.jpeg'` and `photo: '/assets/Gersonita.jpeg'` to the respective `TEAM` entries and verify the paths match the file names' casing
- [x] 2.2 Update `Avatar` to accept `photo` and `name`: render a 96px circular `<img>` with `object-cover`, `alt={name}` and `loading="lazy"` when `photo` is set, falling back to the initials circle when `photo` is missing or the image fires `onError`; pass the new props from the card map; verify with `npm run build` succeeding without errors
- [x] 2.3 Verify in `npm run dev` that both cards show the photos, undistorted and reasonably centered in the circle (adjust `object-position` if a face is cut off)
- [x] 2.4 Verify fallback by temporarily pointing one `photo` to a non-existent path and confirming the initials avatar appears with no broken-image icon, then revert

## 3. Build check

- [x] 3.1 Run `npm run build` and verify `dist/assets/Fernanda.jpeg` and `dist/assets/Gersonita.jpeg` are present in the fresh build output
