# Geopolitika SI

Novičarski/analitični portal z urejevalnim CMS-jem. Zgrajen z:

- **Next.js** (App Router) + **TypeScript** (strict)
- **Payload CMS 3** — admin panel na `/admin`, content API, avtentikacija
- **PostgreSQL (Supabase)** prek `@payloadcms/db-postgres`
- **Supabase Storage (S3)** za slike prek `@payloadcms/storage-s3`
- **Tailwind CSS 4**, Lexical rich-text urejevalnik
- Node 20+, pnpm

Za urednike: glej **[EDITOR-GUIDE.md](./EDITOR-GUIDE.md)** (v slovenščini).

---

## Local development

```bash
pnpm install
cp .env.example .env        # then fill in the values (see below)

# Terminal 1 — local dev database (embedded Postgres, no Docker needed):
pnpm dev:db

# Terminal 2 — the app:
pnpm dev
```

Open http://localhost:3000/admin — the first visit prompts you to create the
first (admin) user. Optionally seed Slovenian demo content:

```bash
pnpm seed   # categories, tags, 4 sample articles, demo editor (urednik@example.com / urednik123)
```

The local dev DB (`pnpm dev:db`) is [PGlite](https://pglite.dev) — a real
Postgres speaking the wire protocol, persisted in `.dev-db/`. Keep
`DATABASE_POOL_MAX=1..5` with it. You can instead point `DATABASE_URI` at any
real Postgres (Docker compose file included: `docker compose up postgres`).

### Scripts

| Script | Purpose |
| --- | --- |
| `pnpm dev` | Dev server on :3000 |
| `pnpm dev:db` | Local PGlite Postgres on :5432 |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm seed` | Seed demo content (skips if data exists) |
| `pnpm generate:types` | Regenerate `src/payload-types.ts` after schema changes |
| `pnpm lint`, `pnpm test` | Lint, tests |

---

## Environment variables

All secrets live in `.env` (never committed). `.env.example` is the template.

| Var | What it is | Where to get it |
| --- | --- | --- |
| `DATABASE_URI` | Postgres connection string | Supabase → **Project Settings → Database → Connection string**. Use the **Transaction pooler** URL (port **6543**) — serverless-friendly. Replace `[YOUR-PASSWORD]` with the DB password you set when creating the project. |
| `PAYLOAD_SECRET` | Secret for auth tokens | Generate yourself: `openssl rand -hex 32` |
| `NEXT_PUBLIC_SERVER_URL` | Public site URL, no trailing slash | `http://localhost:3000` in dev; your domain in production |
| `S3_BUCKET` | Supabase Storage bucket name | Supabase → **Storage → New bucket**. Create a **public** bucket, e.g. `media`. |
| `S3_ENDPOINT` | S3 endpoint URL | Supabase → **Storage → Settings → S3 Connection** → "Endpoint" (looks like `https://<project-ref>.storage.supabase.co/storage/v1/s3`) |
| `S3_REGION` | S3 region | Same S3 Connection panel (e.g. `eu-central-1`) |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | S3 access keys | Supabase → **Storage → Settings → S3 Access Keys → New access key** |

When the `S3_*` vars are unset (typical local dev), uploads are stored on local
disk in `media/` instead — no Supabase needed to develop.

### Supabase setup, step by step

1. Create a project at https://supabase.com (choose a region close to your users; free tier is fine to start).
2. **Database**: Project Settings → Database → copy the *Transaction pooler* connection string into `DATABASE_URI`.
3. **Storage**: Storage → *New bucket* → name `media`, tick **Public bucket**.
4. Storage → Settings → *S3 Connection*: copy endpoint and region.
5. Storage → Settings → *S3 Access Keys* → *New access key*: copy the key id and secret.
6. On first deploy Payload creates its tables automatically in dev mode; for production run migrations (below).

### Database migrations (production)

In development Payload pushes schema changes automatically. For production
databases, create and run versioned migrations instead:

```bash
pnpm payload migrate:create   # after changing collections
pnpm payload migrate          # run pending migrations (part of deploy)
```

---

## Deployment

### Option A — Vercel + Supabase

1. Push the repo to GitHub and import it in Vercel.
2. Framework preset: **Next.js**. Build command `pnpm build` (default).
3. Add the env vars from the table above in Vercel → Project → Settings →
   Environment Variables (`NEXT_PUBLIC_SERVER_URL` = your production domain).
4. Make sure `DATABASE_URI` is the **pooler** URL (port 6543) — Vercel is
   serverless and will exhaust direct connections otherwise.
5. Deploy. Then open `https://your-domain/admin` and create the first user.

### Option B — Hostinger / generic VPS (Node + PM2)

Requirements on the server: Node 20+, pnpm (`npm i -g pnpm`), git.

```bash
git clone <your-repo> geopolitika && cd geopolitika
cp .env.example .env && nano .env      # fill in production values
pnpm install
pnpm build
npm i -g pm2
pm2 start "pnpm start" --name geopolitika
pm2 save && pm2 startup                # start on boot
```

Put a reverse proxy in front (nginx/Caddy) that forwards :80/:443 → :3000 and
terminates TLS (Let's Encrypt). Set `NEXT_PUBLIC_SERVER_URL` to the public
domain **before** `pnpm build`.

Updating:

```bash
git pull && pnpm install && pnpm build && pm2 restart geopolitika
```

#### VPS with Docker (alternative)

A `Dockerfile` is included. Build and run with your `.env`:

```bash
docker build -t geopolitika .
docker run -d --env-file .env -p 3000:3000 --name geopolitika geopolitika
```

---

## Project structure

```
src/
  payload.config.ts       # Payload: collections, globals, plugins, DB, storage
  collections/            # Articles, Categories, Tags, Media, Pages, Users
  globals/SiteSettings.ts # site name, logo, social links, footer, default meta
  access/roles.ts         # admin / editor / author access rules
  fields/slug.ts          # auto-generated, editable slug field
  lib/                    # data queries, formatting, lexical helpers
  components/             # header, footer, cards, pagination, …
  app/(frontend)/         # public site (home, article, category, tag, author,
                          # search, CMS pages, RSS, draft preview)
  app/(payload)/          # admin panel + REST/GraphQL API routes
scripts/
  dev-db.mjs              # PGlite dev database server
  seed.ts                 # demo content seed
```

**Roles**: *admin* — everything, including users and site settings; *editor* —
writes and publishes all content; *author* — creates drafts only (publishing
their drafts is an editor's job).

Everything editorial (articles, categories, tags, pages, logo, footer, social
links, SEO defaults) is edited in `/admin` — nothing content-related is
hardcoded in the frontend.
