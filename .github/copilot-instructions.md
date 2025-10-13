## Repo overview (short)

This is a Vite + React + TypeScript SPA scaffolded with shadcn UI and Lovable. It uses Supabase for auth and data, TanStack Query for remote state, and React Router for page navigation. Tailwind CSS is the styling system.

Key entry points

- `src/main.tsx` — app bootstrap (renders `App`).
- `src/App.tsx` — routing and global providers (QueryClient, Tooltip, Toaster).
- `src/integrations/supabase/client.ts` — Supabase client; env vars prefixed with `VITE_` are used here.
- `src/lib/supabase.ts` — helper functions for authentication flows (signIn, signUp, signOut, getUserRole).
- `src/components/AuthGuard.tsx` — protects routes by listening to Supabase auth state.

Big-picture architecture and patterns

- Single-page React app. Routes are declared in `src/App.tsx`; each page component under `src/pages/` is a screen-level route.
- Remote data is fetched with `@tanstack/react-query` (QueryClient is provided at top-level). Prefetching and caching follow React Query conventions.
- Authentication is handled by Supabase. The app subscribes to auth state changes via `supabase.auth.onAuthStateChange` and uses `supabase.auth.getSession()` on load. The `AuthGuard` component redirects to `/auth` when there is no active session.
- Role-based logic: `src/lib/supabase.ts` stores and queries a `user_roles` table. New sign-ups insert into `user_roles`.
- Environment variables: public client values live in `.env` (Vite requires `VITE_` prefix; see `src/integrations/supabase/client.ts`).

Developer workflows (commands)

- Install: `npm i`
- Dev server: `npm run dev` (Vite runs on port 8080 per `vite.config.ts`, host set to `::`).
- Build (production): `npm run build`.
- Preview build: `npm run preview`.
- Lint: `npm run lint`.

Project-specific conventions

- Path alias: `@` points to `src/` (see `vite.config.ts`). Use imports like `import { supabase } from '@/integrations/supabase/client'`.
- Generated Supabase client: `src/integrations/supabase/client.ts` includes a generated `Database` type import from `./types`. Do not edit the generated header comments when present.
- UI components: shadcn-style primitives are in `src/components/ui/` (e.g., `button.tsx`, `toaster.tsx`). Prefer composing these for shared controls.
- Fonts, tailwind, and global CSS live in `index.css` and `App.css`.
- The project uses `lovable-tagger` in dev mode to tag components; this runs only when Vite mode is `development`.

Integration & external dependencies

- Supabase: `@supabase/supabase-js` for auth and DB. Client configuration reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from the environment. Auth session is stored in `localStorage` (see `client.ts`).
- React Query: global `QueryClient` in `App.tsx` — use `useQuery`/`useMutation` and rely on cache invalidation patterns.
- Routing: `react-router-dom` v6; routes are defined with `<Routes>/<Route>`.

Common editing patterns/examples

- Add a new page route: create `src/pages/NewPage.tsx` and add a `<Route path="/new" element={<NewPage/>} />` entry in `src/App.tsx`.
- Use Supabase in a component: import the typed client `import { supabase } from '@/integrations/supabase/client'` and call `supabase.from('table').select(...)`.
- Protect a route: wrap page usage with `AuthGuard` or add a check inside the page itself using `supabase.auth.getSession()`.

Files to check when debugging

- `vite.config.ts` (dev server host/port, aliases)
- `package.json` (scripts and dependency versions)
- `src/integrations/supabase/client.ts` and `src/lib/supabase.ts` (auth flows)
- `src/components/AuthGuard.tsx` (redirects, loading state)

Notes for AI code agents

- Keep changes minimal and localized. Prefer updating or adding components under `src/components` and pages under `src/pages`.
- When modifying auth or DB logic, preserve existing Supabase patterns: typed client import, `VITE_` env usage, and `user_roles` table interactions.
- Do not add server-side secrets to this repo; use the Vite `VITE_` prefix for variables meant for the client.
- Example: when implementing a new API call, add a helper under `src/lib/` and a respective `useQuery` in the component; follow the `signIn/signUp` helpers for error handling patterns.

If you need more context

- Look in `src/pages/` for page-level examples. Inspect `src/components/ui/` for UI primitives.
- Check `README.md` for Lovable-specific workflows (project hosted on Lovable; pushes may be integrated there).

Questions for the maintainer

- Which CI/CD pipeline or hosting target should agents assume when adding build/deploy scripts? (Currently README references Lovable hosting.)
- Are there any additional Supabase policies or extensions (Edge Functions, triggers) the agent should be aware of?
