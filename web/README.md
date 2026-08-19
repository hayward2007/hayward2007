# Hayward Kim — Robotics & Physical AI

Next.js rewrite of [hayward.kim](https://hayward.kim): a public portfolio site plus a private admin console that syncs project/competition/activity data from Notion into a local SQLite database, and a builder for generating application-specific portfolios shareable via subdomain.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind
- Prisma + SQLite as the site's own database (Notion is the authoring source; `/admin` pulls a snapshot in, then edits happen locally)
- Framer Motion + Lenis for the interaction layer (custom cursor, magnetic buttons, tilt cards, curtain page transitions, scroll reveals)
- `proxy.ts` (Next 16's renamed `middleware.ts`) handles admin auth gating and `<slug>.<domain>` → `/p/[slug]` subdomain rewriting

## Local development

```bash
npm install
npx prisma migrate dev        # creates prisma/dev.db
node scripts/hash-password.mjs "some-password"   # → paste into .env's ADMIN_PASSWORD_HASH (keep the \$ escaping!)
npm run dev
```

Without a real `NOTION_ACCESS_TOKEN`, the site is just empty. `POST /api/dev-seed` (disabled outside development) inserts a few fake projects/competitions so the UI isn't blank while you're working on it.

## Routes

| Path | What |
|---|---|
| `/` | Home — about, projects, awards, activities, contact |
| `/project/[slug]` | Apple-style full-page project detail |
| `/play`, `/play/rover-run` | Mini-games hub (one real game so far) |
| `/tools`, `/tools/merge-pdf` | Small client-side utilities hub |
| `/p/[slug]` | A generated, application-specific portfolio (shareable link) |
| `/admin` | Console: Notion sync, project/activity editing, portfolio builder |

See [DEPLOYMENT.md](./DEPLOYMENT.md) for running this on your own server via Docker.
