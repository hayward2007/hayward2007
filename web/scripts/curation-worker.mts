#!/usr/bin/env -S npx tsx
// Scrapes arXiv/GitHub/RSS for robotics & physical-AI content, asks a local
// Ollama model to curate each new item into a short write-up, and publishes
// it straight to the blog (no review step — see prisma/schema.prisma's
// BlogPost.source comment for why that's fine here). Run on a schedule via
// launchd on the home server, not part of the Next.js app itself.
//
// Usage: DATABASE_URL="file:/abs/path/to/prod.db" npx tsx scripts/curation-worker.mts

import Parser from "rss-parser";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();
const rss = new Parser({ customFields: { item: ["summary", "id"] }, timeout: 15_000 });

const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434/api/chat";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:3b-instruct";
const MAX_NEW_POSTS_PER_RUN = 8; // caps this run only — anything past it just waits for the next hourly run

const SYSTEM_PROMPT = `You are a curator for a personal robotics/physical-AI blog. You are given one
scraped item (an arXiv paper abstract, a GitHub issue, or a news article) and
must produce ONLY a JSON object, no other text, with this exact shape:

{
  "title": string,            // keep the original title as-is; do not invent one
  "field": string,             // one short category, e.g. "로보틱스", "AI", "드론", "휴머노이드"
  "tags": string[],            // 1-3 short lowercase tags
  "summary_lines": string[],   // EXACTLY 3 short lines in Korean, each a complete sentence
  "detail": string             // 2-4 paragraphs in Korean, factual, no speculation beyond
                                // what's in the source, explaining what it is, why it matters
                                // for robotics/physical AI, and any concrete numbers/results
                                // mentioned in the source. Do not fabricate results, authors,
                                // or claims not present in the source text.
}

Rules:
- Write summary_lines and detail in Korean, regardless of the source language.
- Never claim this is original reporting — write as a curator summarizing someone
  else's work, and do not use first person as if you did the work.
- If the source text is too short/thin to summarize meaningfully, still return the
  JSON, but keep "detail" honest about how little is known rather than padding it.
- Output nothing but the JSON object — no markdown fences, no preamble.`;

type ScrapedItem = {
  title: string;
  url: string;
  source: string; // human-readable, e.g. "arXiv", "GitHub", "IEEE Spectrum" — stored as-is on BlogPost.source
  text: string; // abstract / issue body / article snippet, fed to the LLM
  publishedAt: string | null;
};

type CuratedPost = {
  title: string;
  field: string;
  tags: string[];
  summary_lines: string[];
  detail: string;
};

// ---------- Sources ----------
// Deliberately a plain array, not a plugin system — add another entry here
// when a new source is wanted, same spirit as src/lib/catalog.ts elsewhere
// in this app.

const ARXIV_CATEGORIES = ["cs.RO", "cs.AI", "cs.HC", "cs.LG"];
const ARXIV_KEYWORDS = [
  "robot",
  "robotic",
  "manipulation",
  "locomotion",
  "humanoid",
  "quadruped",
  "legged",
  "actuator",
  "embodied",
  "physical ai",
  "sim-to-real",
  "drone",
  "uav",
  "grasping",
  "whole-body",
];

const GITHUB_REPOS = [
  "ros2/ros2",
  "isaac-sim/IsaacLab",
  "huggingface/lerobot",
  "google-deepmind/mujoco",
  "ArduPilot/ardupilot",
  "PX4/PX4-Autopilot",
];

const RSS_FEEDS: { label: string; url: string }[] = [
  { label: "IEEE Spectrum", url: "https://spectrum.ieee.org/feeds/topic/robotics.rss" },
  { label: "TechCrunch", url: "https://techcrunch.com/category/robotics/feed/" },
  { label: "The Robot Report", url: "https://www.therobotreport.com/feed/" },
  { label: "DroneLife", url: "https://dronelife.com/feed/" },
];

async function fetchArxiv(): Promise<ScrapedItem[]> {
  const catQuery = ARXIV_CATEGORIES.map((c) => `cat:${c}`).join("+OR+");
  const url = `http://export.arxiv.org/api/query?search_query=${catQuery}&sortBy=submittedDate&sortOrder=descending&max_results=25`;
  const feed = await rss.parseURL(url);
  const candidates = feed.items.map((item) => {
    const extra = item as { summary?: string; id?: string };
    const title = (item.title || "").replace(/\s+/g, " ").trim();
    const summary = (extra.summary || item.contentSnippet || "").replace(/\s+/g, " ").trim();
    const scraped: ScrapedItem = {
      title,
      url: item.link || extra.id || "",
      source: "arXiv",
      text: summary,
      publishedAt: item.isoDate || null,
    };
    return { scraped, haystack: `${title} ${summary}`.toLowerCase() };
  });
  return candidates
    .filter(({ scraped, haystack }) => scraped.url && ARXIV_KEYWORDS.some((kw) => haystack.includes(kw)))
    .map(({ scraped }) => scraped);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// GitHub's search endpoint rate-limits unauthenticated callers harder (and
// more unpredictably — slow responses, not just clean 4xx) than a plain
// per-hour budget suggests, especially in bursts. A small stagger between
// the per-repo calls, plus a hard timeout on each so one stalled request
// can't hold up the whole run, is cheap insurance for something that runs
// unattended on a schedule.
const GITHUB_REQUEST_TIMEOUT_MS = 15_000;
const GITHUB_REQUEST_STAGGER_MS = 1500;

async function fetchGithubIssues(): Promise<ScrapedItem[]> {
  const results: ScrapedItem[] = [];
  for (const repo of GITHUB_REPOS) {
    const url = `https://api.github.com/search/issues?q=repo:${repo}+is:issue+is:open&sort=created&order=desc&per_page=5`;
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/vnd.github+json" },
        signal: AbortSignal.timeout(GITHUB_REQUEST_TIMEOUT_MS),
      });
      if (!res.ok) {
        console.error(`[curation-worker] GitHub search failed for ${repo}: ${res.status}`);
        continue;
      }
      const data = (await res.json()) as { items?: { title: string; html_url: string; body?: string; created_at: string }[] };
      for (const item of data.items || []) {
        results.push({
          title: `[${repo}] ${item.title}`,
          url: item.html_url,
          source: "GitHub",
          text: (item.body || "").slice(0, 2000),
          publishedAt: item.created_at,
        });
      }
    } catch (err) {
      console.error(`[curation-worker] GitHub search errored for ${repo}:`, err);
    }
    await sleep(GITHUB_REQUEST_STAGGER_MS);
  }
  return results;
}

async function fetchRssFeeds(): Promise<ScrapedItem[]> {
  const results: ScrapedItem[] = [];
  for (const { label, url } of RSS_FEEDS) {
    try {
      const feed = await rss.parseURL(url);
      for (const item of feed.items.slice(0, 10)) {
        results.push({
          title: (item.title || "").trim(),
          url: item.link || "",
          source: label,
          text: (item.contentSnippet || item.content || "").slice(0, 2000),
          publishedAt: item.isoDate || null,
        });
      }
    } catch (err) {
      console.error(`[curation-worker] RSS fetch failed for ${label}:`, err);
    }
  }
  return results.filter((item) => item.url);
}

// ---------- Local LLM ----------

async function curate(item: ScrapedItem): Promise<CuratedPost> {
  const userMessage = [
    `Source type: ${item.source}`,
    `Title: ${item.title}`,
    item.publishedAt ? `Published: ${item.publishedAt}` : null,
    `URL: ${item.url}`,
    "",
    item.text || "(no body text available)",
  ]
    .filter(Boolean)
    .join("\n");

  const res = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(90_000), // generous — generation legitimately takes a few seconds to ~30s, this is just a backstop against a genuinely stuck request
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      format: "json",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Ollama request failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { message?: { content?: string } };
  const raw = data.message?.content;
  if (!raw) throw new Error("Ollama returned no message content");

  const parsed = JSON.parse(raw) as Partial<CuratedPost>;
  if (
    !parsed.title ||
    !parsed.field ||
    !Array.isArray(parsed.tags) ||
    !Array.isArray(parsed.summary_lines) ||
    !parsed.detail
  ) {
    throw new Error(`Ollama returned an incomplete curation object: ${raw.slice(0, 300)}`);
  }
  return parsed as CuratedPost;
}

// ---------- Rendering + persistence ----------

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderBody(curated: CuratedPost, item: ScrapedItem): string {
  const summary = curated.summary_lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("");
  const badges = [curated.field, ...curated.tags].filter(Boolean).map((t) => `<code>${escapeHtml(t)}</code>`).join(" ");
  const detailParagraphs = curated.detail
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("");
  return [
    badges ? `<p>${badges}</p>` : "",
    `<blockquote>${summary}</blockquote>`,
    detailParagraphs,
    `<p><a href="${escapeHtml(item.url)}">원문 보기 →</a></p>`,
  ]
    .filter(Boolean)
    .join("\n");
}

function slugify(name: string): string {
  return (
    String(name || "")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      // Punctuation like "[repo/name] Issue: title" needs to become a word
      // boundary (a space), not just vanish — dropping it outright smashed
      // adjacent words together (e.g. "isaac-sim/IsaacLab" -> "isaac-simisaaclab").
      .replace(/[^a-z0-9\s-]/g, " ")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "post"
  );
}

async function uniqueSlug(title: string): Promise<string> {
  const base = slugify(title);
  let slug = base;
  let n = 1;
  while (await prisma.blogPost.findUnique({ where: { slug } })) {
    slug = `${base}-${++n}`;
  }
  return slug;
}

// ---------- Main ----------

// A source that's down/rate-limited for this run shouldn't take out the
// other two — each is isolated so one failure just means fewer items this
// run instead of an aborted run and zero new posts from any source.
async function fetchSourceSafely(label: string, fn: () => Promise<ScrapedItem[]>): Promise<ScrapedItem[]> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[curation-worker] source "${label}" failed for this run:`, err);
    return [];
  }
}

async function main() {
  const [arxiv, github, articles] = await Promise.all([
    fetchSourceSafely("arxiv", fetchArxiv),
    fetchSourceSafely("github", fetchGithubIssues),
    fetchSourceSafely("rss", fetchRssFeeds),
  ]);
  const items = [...arxiv, ...github, ...articles];
  console.log(`[curation-worker] scraped ${items.length} candidate items`);

  let published = 0;
  for (const item of items) {
    if (published >= MAX_NEW_POSTS_PER_RUN) {
      console.log(`[curation-worker] hit the per-run cap (${MAX_NEW_POSTS_PER_RUN}), stopping for this run`);
      break;
    }
    const seen = await prisma.curationSeen.findUnique({ where: { sourceUrl: item.url } });
    if (seen) continue;

    try {
      const curated = await curate(item);
      // Use the scraped item's own title rather than the LLM's echoed-back
      // copy of it — the prompt asks it not to alter the title, but there's
      // no reason to trust a generative model's transcription over the
      // original when we already have the original right here.
      const slug = await uniqueSlug(item.title);
      await prisma.blogPost.create({
        data: {
          slug,
          title: item.title,
          body: renderBody(curated, item),
          published: true,
          source: item.source,
          sourceUrl: item.url,
        },
      });
      await prisma.curationSeen.create({ data: { sourceUrl: item.url } });
      published += 1;
      console.log(`[curation-worker] published: ${item.title} (${item.source})`);
    } catch (err) {
      // Deliberately NOT marking this URL as seen on failure — a transient
      // Ollama/network hiccup should get retried on the next scheduled run
      // instead of silently skipping the item forever.
      console.error(`[curation-worker] failed to curate ${item.url}:`, err);
    }
  }

  console.log(`[curation-worker] done — published ${published} new post(s)`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("[curation-worker] fatal error:", err);
  await prisma.$disconnect();
  process.exit(1);
});
