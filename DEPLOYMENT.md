# Cloudflare Workers Deployment

Use Cloudflare Workers with GitHub integration.

Cloudflare build settings:

- Root directory: `.`
- Build command: leave blank
- Deploy command: `npx --yes wrangler deploy`
- Build output directory: leave blank

Required Worker variable:

- `NOTION_ACCESS_TOKEN`: Notion internal integration token

The site fetches Notion through `/api/notion` on every page load. The token must stay server-side as a Cloudflare Worker secret or environment variable.

After deployment, check:

- `/api/health`: confirms the request is reaching the Worker and whether the Notion token is configured.
- `/api/notion`: returns live portfolio JSON from Notion.
