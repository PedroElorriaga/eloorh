## Context

See proposal.md - Why. Three constraints shape this design. The frontend is a Vite/React build published as static files to Hostinger, with no server-side rendering and no guarantee that arbitrary paths can be rewritten to `index.html`. The API is a single Express process on Railway that already holds `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` and talks to Postgres through a plain `pg` pool. The `curriculos` Storage bucket is private, and the service-role key that can read it is a server secret — so a resume can only reach a recruiter's browser if the server hands out access deliberately, one file at a time.

## Goals / Non-Goals

**Goals:**
- Put candidate personal data behind a login without building an identity system.
- Keep the public landing page unchanged in behavior, bundle size, and hosting setup.
- Make the authorization check impossible to skip: one middleware in front of every recruiter endpoint, not a check repeated per handler.

**Non-Goals:**
- Roles or permission levels among recruiters — every provisioned account sees the same data. If that changes, it is a separate change.
- Editing, annotating, or deleting applications; the panel is read-only (see the `application-review` spec).
- An audit log of who viewed or downloaded which resume.
- Migrating the public forms to authenticated submission — candidates stay anonymous.

## Decisions

- **Supabase Auth over a hand-rolled login**: the project already runs on Supabase, and Auth is included on the current plan at no extra cost at this scale (Free covers 50,000 monthly active users; the panel will have a handful). It brings password hashing, token expiry, and password recovery already written and maintained. The alternative considered was a `recruiters` table with bcrypt and a self-issued JWT — rejected because it means owning the parts of authentication that are easiest to get subtly wrong (hash parameters, token expiry, reset-link single use) for no gain the panel would notice.
- **Public sign-up disabled at the provider, not hidden in the UI**: simply omitting a registration form would still leave the project's public anon key able to create accounts, since that is a normal Supabase Auth call. Sign-up is therefore turned off in the Supabase project settings, making the absence of a UI a consequence rather than the control.
- **The API verifies the token; it does not trust the client**: the panel sends the access token as a `Bearer` credential, and the Express middleware resolves it through the Supabase Auth API before any handler runs. A token is never decoded and accepted on its claims alone, so a revoked or tampered token fails.
- **Row Level Security is not the gate here**: the API reads `job_applications` with the service-role key through the `pg` pool, which bypasses RLS by design. The access control is the middleware. This is worth stating because it is the opposite of the usual Supabase pattern, where the browser talks to the database directly and RLS is the gate — the browser here never touches Postgres.
- **`painel.html` as a second Vite entry, not a client-side route**: Vite's `build.rollupOptions.input` takes two HTML entries, so the panel ships as its own page with its own bundle. This needs no rewrite rule on Hostinger (a real file exists at that path), and the public site does not download panel or auth code. Alternatives considered: a `HashRouter` route (`/#/painel`) — works without rewrites but bundles the panel into the public site and leaves a `#` in the URL; `BrowserRouter` at `/painel` — the nicest URL, rejected because it depends on a Hostinger rewrite that is not currently configured and would break on reload if it were missing.
- **Resume access via short-lived signed URLs, not a proxy download**: the server calls Supabase Storage to mint a signed URL for the one requested file and returns the link; the browser then fetches the file from Storage directly. This keeps large file bodies off the Express process (which would otherwise buffer every download on a small Railway instance) while keeping the bucket private. The alternative, streaming the file through the API, was rejected for that memory and bandwidth cost; its only advantage — the file's address never reaching the client — is marginal once the URL expires.
- **The anon key ships in the frontend bundle, and that is expected**: `VITE_SUPABASE_ANON_KEY` is designed to be public and grants nothing on its own beyond calling Auth. The distinction that matters, and that must survive review, is that `SUPABASE_SERVICE_ROLE_KEY` is never given a `VITE_` prefix and never reaches a build.
- **Listing is paginated from the start**: `GET /api/applications` takes a bounded page size rather than returning every row. The table has an index on `created_at`, and a panel that silently degrades as applications accumulate is a worse outcome than paging that is unnecessary in the first month.

## Risks / Trade-offs

- **A leaked or shared recruiter password exposes every candidate's data** → there is no second factor and no per-recruiter data partition. Mitigation: accounts are provisioned individually rather than shared, so a compromised account can be disabled without disrupting the others; Supabase Auth's password recovery gives a way to rotate credentials quickly.
- **A signed URL is a bearer token for that file while it lives** → anyone who obtains the link within its window can download the resume without signing in. Mitigation: keep the expiry short (minutes, not hours) and mint a fresh URL per request rather than caching one.
- **No audit trail** → if a resume leaks, there is no record of which recruiter downloaded it. Accepted for now given the size of the team; noted here so the decision is deliberate rather than overlooked.
- **The anon key and the service-role key look alike in a `.env` file** → pasting the wrong one into a `VITE_`-prefixed variable would publish a key that bypasses Row Level Security in a static bundle. Mitigation: `.env.example` and `backend-setup.md` must label both keys explicitly, and the task list includes checking the built assets for the service-role key before deploying.
- **Two deploy targets must move together** → the panel page is useless until the API exposes the endpoints, and the API's auth middleware is harmless but unused until the panel ships. Mitigation: deploy the API first; the new endpoints are additive and break nothing that exists.

## Migration Plan

No data migration: the panel reads rows and files that already exist, and adds no columns. Rollout order is (1) disable public sign-up and create the recruiter accounts in the Supabase dashboard, (2) deploy the API with the auth middleware and the three endpoints — additive, so the running public endpoints are unaffected, (3) add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the GitHub Actions build and publish the frontend with `painel.html`. Rollback is to revert the frontend build; the API endpoints can stay in place harmlessly, since without the panel nothing calls them and they refuse unauthenticated requests anyway.
