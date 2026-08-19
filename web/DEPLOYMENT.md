# Deploying to your own server

This app is a standard Next.js + Prisma/SQLite app, shipped as a Docker image. It no longer depends on Cloudflare Workers.

## 1. First-time setup

```bash
cp .env.production.example .env.production
node scripts/hash-password.mjs "your-admin-password"   # paste the output into .env.production
openssl rand -hex 32                                    # paste into ADMIN_SESSION_SECRET
```

Fill in `NOTION_ACCESS_TOKEN` with the same Notion internal integration token the old Cloudflare Worker used, and set `BASE_DOMAIN`/`NEXT_PUBLIC_BASE_DOMAIN` to your real domain.

Note: `.env.production` is read by `docker-compose` via `env_file`, which does **not** expand `$` in values, so the bcrypt hash goes in unescaped. (Contrast with local dev's `.env`, which Next.js parses directly and *does* expand `$name` — that file needs the hash's `$` characters escaped as `\$`, see the comment already in `.env`.)

## 2. Build and run

```bash
docker compose up -d --build
```

This builds the image, runs `prisma migrate deploy` against `/data/prod.db` (persisted via the `./data` bind mount) on every container start, then starts the app on port 3000.

Check it's alive:

```bash
curl localhost:3000/api/health
```

## 3. Point your domain at it

You need a reverse proxy in front of port 3000 for TLS and for routing the wildcard subdomains that generated portfolios use (`<slug>.yourdomain.com`). [Caddy](https://caddyserver.com/) is the simplest option — it gets you automatic HTTPS, including wildcard certificates via DNS validation, with a few lines of config:

```caddyfile
# /etc/caddy/Caddyfile
hayward.kim, *.hayward.kim {
    tls {
        dns cloudflare {env.CF_API_TOKEN}   # or your DNS provider's Caddy plugin
    }
    reverse_proxy localhost:3000
}
```

A wildcard cert requires a DNS-01 challenge (HTTP-01 can't prove ownership of a wildcard), which is why the `dns` directive above is needed — Caddy has plugins for most providers (Cloudflare, Route53, etc.), or see [certbot's DNS plugins](https://certbot.eff.org/) if you'd rather run nginx + certbot instead.

You'll also need a wildcard DNS record:

```
A     hayward.kim         -> your.server.ip
A     *.hayward.kim       -> your.server.ip
```

**You don't have to set this up before using the portfolio generator.** Every generated portfolio also gets a plain path-based URL (`hayward.kim/p/<slug>`) that works immediately, regardless of DNS. The subdomain form is a nicer-looking upgrade you can add later.

## 4. Load real data

Visit `https://hayward.kim/admin/login`, sign in with the password you hashed in step 1, and click **Sync from Notion** on the dashboard. That pulls your three Notion databases (projects/competitions/activities) into the local SQLite DB. From then on, edits happen in the admin console (`/admin/projects`, `/admin/activities`) — re-syncing overwrites Notion-sourced fields but preserves the slug and any portfolios you've built.

## Updating

```bash
git pull
docker compose up -d --build
```

Migrations run automatically on start; the SQLite file in `./data` persists across rebuilds.
