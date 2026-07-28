# AGENTS.md

<!-- INSFORGE:START -->
## InsForge backend

This project uses [InsForge](https://insforge.dev): Postgres, auth, storage, edge functions, realtime, and Sites hosting.

- **Project:** **Stasus** (API base `https://dvmy89mv.us-west.insforge.app`)
- **Skills:** `insforge` (SDK app code), `insforge-cli` (migrations/RLS/secrets/deploy), `insforge-debug`, `insforge-integrations`
- **Credentials:** app code reads keys from `.env.local`; the CLI reads `.insforge/project.json`. Never hardcode or commit keys.
- **AI:** Do **not** use InsForge Model Gateway for Stasus AI. Anthropic API is direct, and only in the AI build phase.
- **Hosting:** InsForge Sites — not Vercel.

Key patterns:

- Database inserts take an array: `insert([{ ... }])`.
- Reference users with `auth.users(id)`; use `auth.uid()` in RLS policies.
- For storage uploads, persist both the returned `url` and `key`.
<!-- INSFORGE:END -->

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
