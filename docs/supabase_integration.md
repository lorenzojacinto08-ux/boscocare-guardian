# Supabase integration — Quick Reference & Guide

This document explains the core Supabase integrations and related references in this repository:

- [src/integrations/supabase/client.ts](src/integrations/supabase/client.ts) — typed Supabase client and runtime config
- [supabase/references/enums.md](supabase/references/enums.md) — schema enums reference (supabase-managed)
- [supabase/references/tables.md](supabase/references/tables.md) — tables reference (supabase-managed)
- [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx) — local React auth context

Use these links to open the files directly from the repo.

---

## 1) Supabase client (what and how)

File: [`src/integrations/supabase/client.ts`](src/integrations/supabase/client.ts)  
Symbol: [`supabase`](src/integrations/supabase/client.ts)

- Purpose: a single, typed Supabase client created with `createClient<Database>(...)` and exported as `supabase` for use across the app.
- Env vars: Vite public variables must use the `VITE_` prefix:
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_PUBLISHABLE_KEY
- Auth options configured in the client:
  - storage: `localStorage`
  - persistSession: `true`
  - autoRefreshToken: `true`

Example usage (from components/pages in this repo):

```ts
import { supabase } from "@/integrations/supabase/client";

const { data, error } = await supabase.from("your_table").select("*");
```

Notes:

- The client is typed against `src/integrations/supabase/types.ts` so `supabase.from('...')` benefits from strict typing for rows, inserts, and updates.
- Keep public env values safe — do not store secrets here.

---

## 2) Enums & Tables reference files

Files:

- [supabase/references/enums.md](supabase/references/enums.md)
- [supabase/references/tables.md](supabase/references/tables.md)

Purpose:

- These reference markdown files are intended as human-readable exports of your Supabase schema (enums and tables).
- They should be kept in sync with your actual database schema and migrations in `supabase/migrations/`.

Where the app reads types:

- The generated type definitions used by the client live in `src/integrations/supabase/types.ts` (see `Constants` and the generated `Database` shape).
  - Example symbol: [`Constants`](src/integrations/supabase/types.ts)

Recommended workflow:

- When you add/modify tables or enums, create or update a migration under `supabase/migrations/` (example: `supabase/migrations/20251009054329_2562f48e-....sql`).
- Regenerate/commit the types and update the `supabase/references/*.md` docs so the repo and team remain consistent.
- Use the references for quick lookup (column types, optional/required fields, relations).

---

## 3) Auth context (React)

File: [`src/contexts/AuthContext.tsx`](src/contexts/AuthContext.tsx)  
Related: [`src/components/AuthGuard.tsx`](src/components/AuthGuard.tsx)

Purpose:

- Provide a React context for auth state (current user/session) and helper utilities across the app.
- Centralize subscription to Supabase auth state changes and session retrieval (so pages/components don't duplicate this logic).

Common patterns in this repo:

- `AuthGuard` uses Supabase session and redirects to `/auth` if not authenticated. See [`src/components/AuthGuard.tsx`](src/components/AuthGuard.tsx).
- Pages call `supabase.auth.getUser()` where needed to get the current user before DB actions (insert/update/delete).

Example consumer pattern:

```ts
// pseudo-usage
import { useAuth } from "@/contexts/AuthContext";

const { user, signOut } = useAuth();
if (user) {
  // make authorized requests
}
```

Recommendations:

- Keep subscription/unsubscribe logic inside the context to avoid leaks.
- Expose lightweight helpers: `user`, `session`, `loading`, `signIn`, `signOut`.
- Use `lib/supabase.ts` helpers for common auth flows:
  - [`signUp`](src/lib/supabase.ts)
  - [`signIn`](src/lib/supabase.ts)
  - [`signOut`](src/lib/supabase.ts)
  - [`getUserRole`](src/lib/supabase.ts)

---

## 4) Useful cross-references in the repo

- Supabase client: [`src/integrations/supabase/client.ts`](src/integrations/supabase/client.ts) (exports: `supabase`)
- Generated DB types: [`src/integrations/supabase/types.ts`](src/integrations/supabase/types.ts) (contains `Database`, `Constants`, enums)
- Auth helpers: [`src/lib/supabase.ts`](src/lib/supabase.ts) (exports: `signUp`, `signIn`, `signOut`, `getUserRole`)
- Auth guard: [`src/components/AuthGuard.tsx`](src/components/AuthGuard.tsx)
- Migrations: `supabase/migrations/` (example migration: `supabase/migrations/20251009054329_2562f48e-9e0b-453c-8bcf-ac1d7f0f1c32.sql`)

---

If you want, I can:

- Populate `supabase/references/enums.md` and `supabase/references/tables.md` from the generated types in `src/integrations/supabase/types.ts`, or
- Add usage examples to `src/contexts/AuthContext.tsx` (consume/export helpers) and wire them into App providers.
