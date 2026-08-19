#!/usr/bin/env -S npx tsx
// One-off cleanup: the first curated posts stored field/tags only as an
// inline "<p><code>...</code> ...</p>" badges paragraph inside body HTML,
// before scripts/curation-worker.mts started persisting BlogPost.field/tags
// as their own columns. Run once to backfill those columns from the existing
// posts and strip the now-redundant paragraph out of body. Safe to re-run —
// it only touches posts whose tags column is still the default "[]".
//
// Usage: DATABASE_URL="file:/abs/path/to/prod.db" npx tsx scripts/backfill-blog-tags.mts

import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.blogPost.findMany({
    where: { source: { not: null }, tags: "[]" },
  });
  console.log(`[backfill-blog-tags] found ${posts.length} curated post(s) with no structured tags`);

  let updated = 0;
  for (const post of posts) {
    // Not anchored to the start — different curation-worker revisions put this
    // paragraph either right before or right after the <blockquote>, depending
    // on when each post was published.
    const match = post.body.match(/<p>((?:<code>[^<]*<\/code>\s*)+)<\/p>\n?/);
    if (!match || match.index === undefined) {
      console.log(`[backfill-blog-tags] skip "${post.title}" — no badges paragraph found`);
      continue;
    }
    const codes = Array.from(match[1].matchAll(/<code>([^<]*)<\/code>/g)).map((m) => m[1]);
    if (codes.length === 0) continue;

    const [field, ...tags] = codes;
    const body = post.body.slice(0, match.index) + post.body.slice(match.index + match[0].length);
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { field, tags: JSON.stringify(tags), body },
    });
    updated += 1;
    console.log(`[backfill-blog-tags] updated "${post.title}" — field=${field}, tags=${tags.join(",")}`);
  }

  console.log(`[backfill-blog-tags] done — updated ${updated} post(s)`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("[backfill-blog-tags] fatal error:", err);
  await prisma.$disconnect();
  process.exit(1);
});
