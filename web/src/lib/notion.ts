import { prisma } from "@/lib/prisma";
import { summarizeNotionContent, type SummarizeKind } from "@/lib/ollama";

const NOTION_VERSION = "2022-06-28";

export const NOTION_DATABASES = {
  projects: "314685d7-d96a-8124-902e-c7155189ef0b",
  competitions: "314685d7-d96a-819a-b96d-cc1340581c03",
  activities: "314685d7-d96a-8145-b41b-db2955b8849d",
};

export class NotionApiError extends Error {
  status: number;
  body: string;
  constructor(status: number, body: string) {
    super(`Notion API returned ${status}`);
    this.name = "NotionApiError";
    this.status = status;
    this.body = body;
  }
}

type RichTextItem = { plain_text?: string };
type NotionProp = Record<string, unknown> & { type: string };
type NotionPage = {
  id: string;
  url: string;
  created_time: string;
  last_edited_time: string;
  cover?: { type: string; external?: { url: string }; file?: { url: string } } | null;
  icon?: { type: string; emoji?: string; external?: { url: string }; file?: { url: string } } | null;
  properties: Record<string, NotionProp>;
};

function richTextToPlain(items: RichTextItem[] = []) {
  return items.map((item) => item.plain_text || "").join("");
}

function propValue(prop: NotionProp | undefined): unknown {
  if (!prop) return null;
  if (prop.type === "title") return richTextToPlain(prop.title as RichTextItem[]);
  if (prop.type === "rich_text") return richTextToPlain(prop.rich_text as RichTextItem[]);
  if (prop.type === "select") return (prop.select as { name?: string } | null)?.name || "";
  if (prop.type === "multi_select") {
    return ((prop.multi_select as { name: string }[]) || []).map((item) => item.name);
  }
  if (prop.type === "number") return prop.number;
  if (prop.type === "checkbox") return prop.checkbox;
  if (prop.type === "date") return (prop.date as { start?: string } | null)?.start || "";
  if (prop.type === "url") return prop.url || "";
  if (prop.type === "relation") return ((prop.relation as { id: string }[]) || []).map((item) => item.id);
  return (prop as Record<string, unknown>)[prop.type] ?? null;
}

function getProp<T>(props: Record<string, unknown>, names: string[], fallback: T): T {
  for (const name of names) {
    if (Object.prototype.hasOwnProperty.call(props, name)) return props[name] as T;
  }
  return fallback;
}

function coverUrl(cover: NotionPage["cover"]) {
  if (!cover) return "";
  if (cover.type === "external") return cover.external?.url || "";
  if (cover.type === "file") return cover.file?.url || "";
  return "";
}

function iconValue(icon: NotionPage["icon"]) {
  if (!icon) return "";
  if (icon.type === "emoji") return icon.emoji || "";
  if (icon.type === "external") return icon.external?.url || "";
  if (icon.type === "file") return icon.file?.url || "";
  return "";
}

function flattenPage(page: NotionPage) {
  const props = Object.fromEntries(
    Object.entries(page.properties || {}).map(([key, value]) => [key, propValue(value)]),
  );

  return {
    id: page.id,
    url: page.url,
    createdTime: page.created_time,
    editedTime: page.last_edited_time,
    cover: coverUrl(page.cover),
    icon: iconValue(page.icon),
    props,
  };
}

function yearFromName(name: string, fallback = "") {
  return String(name || fallback).match(/\b(19|20)\d{2}\b/)?.[0] || "";
}

function rankInfo(result = "") {
  const text = String(result);
  const lower = text.toLowerCase();

  if (lower.includes("gold") || text.includes("금") || text.includes("🥇")) {
    return { key: "gold", label: "Gold", weight: 1 };
  }
  if (lower.includes("silver") || text.includes("은") || text.includes("🥈")) {
    return { key: "silver", label: "Silver", weight: 2 };
  }
  if (lower.includes("bronze") || text.includes("동") || text.includes("🥉")) {
    return { key: "bronze", label: "Bronze", weight: 3 };
  }
  if (lower.includes("encouragement") || text.includes("장려") || text.includes("🏅")) {
    return { key: "encouragement", label: "Encouragement", weight: 4 };
  }
  if (lower.includes("none") || text.includes("❌")) {
    return { key: "none", label: "Participated", weight: 8 };
  }
  return { key: "special", label: "Award", weight: 0 };
}

function priorityValue(value: unknown) {
  if (value === 0) return 0;
  const match = String(value ?? "").match(/\d+/);
  return match ? Number(match[0]) : 99;
}

function isPublic(value: unknown) {
  const text = String(value || "").toLowerCase();
  return text === "public" || text === "show" || text === "visible" || text === "true";
}

export function slugify(name: string) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "project";
}

async function notionRequest(token: string, path: string, options: RequestInit = {}) {
  const response = await fetch(`https://api.notion.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new NotionApiError(response.status, message);
  }

  return response.json();
}

async function queryDatabase(token: string, databaseId: string): Promise<NotionPage[]> {
  const pages: NotionPage[] = [];
  let startCursor: string | undefined;

  do {
    const payload: Record<string, unknown> = { page_size: 100 };
    if (startCursor) payload.start_cursor = startCursor;

    const data = await notionRequest(token, `/databases/${databaseId}/query`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    pages.push(...data.results);
    startCursor = data.next_cursor;
  } while (startCursor);

  return pages;
}

type NotionBlock = Record<string, unknown> & { id: string; type: string; has_children?: boolean };

const LINE_PREFIX: Record<string, string> = {
  bulleted_list_item: "- ",
  numbered_list_item: "1. ",
  quote: "> ",
  heading_1: "# ",
  heading_2: "## ",
  heading_3: "### ",
};

function blockText(block: NotionBlock): string {
  const value = block[block.type] as
    | { rich_text?: RichTextItem[]; caption?: RichTextItem[]; checked?: boolean; cells?: RichTextItem[][] }
    | undefined;
  if (!value) return "";

  if (Array.isArray(value.cells)) return value.cells.map((cell) => richTextToPlain(cell)).join(" | ");

  const text = Array.isArray(value.rich_text)
    ? richTextToPlain(value.rich_text)
    : Array.isArray(value.caption)
      ? richTextToPlain(value.caption)
      : "";
  if (!text) return "";

  if (block.type === "to_do") return `${value.checked ? "[x] " : "[ ] "}${text}`;
  return `${LINE_PREFIX[block.type] || ""}${text}`;
}

async function fetchBlockChildren(token: string, blockId: string): Promise<NotionBlock[]> {
  const blocks: NotionBlock[] = [];
  let startCursor: string | undefined;

  do {
    const query = startCursor
      ? `?start_cursor=${encodeURIComponent(startCursor)}&page_size=100`
      : "?page_size=100";
    const data = await notionRequest(token, `/blocks/${blockId}/children${query}`);
    blocks.push(...(data.results as NotionBlock[]));
    startCursor = data.next_cursor;
  } while (startCursor);

  return blocks;
}

const MAX_BLOCK_DEPTH = 6;
// child_page/child_database point at an entirely separate Notion page/DB —
// recursing into those would pull in unrelated content (and risks cycles),
// not this page's own body.
const SKIP_RECURSION_TYPES = new Set(["child_page", "child_database"]);

async function walkBlocks(token: string, blockId: string, depth: number): Promise<string[]> {
  if (depth > MAX_BLOCK_DEPTH) return [];
  const children = await fetchBlockChildren(token, blockId);
  const lines: string[] = [];

  for (const block of children) {
    const text = blockText(block);
    if (text) lines.push(text);
    if (block.has_children && !SKIP_RECURSION_TYPES.has(block.type)) {
      lines.push(...(await walkBlocks(token, block.id, depth + 1)));
    }
  }

  return lines;
}

/**
 * Recursively fetches a Notion page's full body — every nested block, not
 * just the one level `/blocks/{id}/children` returns on its own — flattened
 * to plain text. This is the actual page content you see when you open the
 * page in Notion, distinct from its database properties (title, selects,
 * short rich-text fields), which `flattenPage`/`propValue` already cover.
 */
export async function getPageText(token: string, pageId: string): Promise<string> {
  const lines = await walkBlocks(token, pageId, 0);
  return lines.join("\n");
}

export function notionStatusHint(status: number) {
  if (status === 401) return "The Notion token is invalid or was not saved correctly.";
  if (status === 403) return "The Notion integration does not have permission to read this resource.";
  if (status === 404) {
    return "A Notion database was not found. Share each database with the integration and confirm the database IDs.";
  }
  if (status === 429) return "Notion rate-limited the request. Try again after a short wait.";
  return "Check the server logs for the detailed Notion error body.";
}

// The recursive block fetch + LLM call is the expensive part of a sync (a
// handful of Notion API round-trips and one Ollama call per item). Gate it on
// Notion's own last_edited_time so a steady-state 30-min auto-sync only pays
// that cost for pages that actually changed, not every page every time.
async function fetchSummaryFields(
  token: string,
  kind: SummarizeKind,
  pageId: string,
  name: string,
  newEditedTime: string,
  existing: { editedTime: Date | null; aiSummary: string | null } | null | undefined,
  currentTags: string[],
): Promise<{ rawContent?: string; aiSummary?: string; tags?: string[] }> {
  const unchanged = existing?.editedTime?.toISOString() === new Date(newEditedTime).toISOString();
  if (unchanged && existing?.aiSummary) return {};

  try {
    const rawContent = await getPageText(token, pageId);
    if (!rawContent.trim()) return {};
    const result = await summarizeNotionContent(kind, name, rawContent, currentTags);
    if (!result) return { rawContent };
    return { rawContent, aiSummary: result.summaryHtml, tags: result.tags };
  } catch (err) {
    console.error(`[notion] summarize step failed for ${kind} "${name}":`, err);
    return {};
  }
}

/**
 * Pulls all three Notion databases and upserts them into the local SQLite DB.
 * Notion stays the authoring source for a fresh pull; anything edited locally
 * afterward in the admin console is NOT pushed back to Notion.
 */
export async function syncFromNotion(token: string) {
  const [projectPages, competitionPages, activityPages] = await Promise.all([
    queryDatabase(token, NOTION_DATABASES.projects),
    queryDatabase(token, NOTION_DATABASES.competitions),
    queryDatabase(token, NOTION_DATABASES.activities),
  ]);

  const flatCompetitions = competitionPages.map(flattenPage);
  const competitionById = new Map(flatCompetitions.map((item) => [item.id, item]));

  const usedSlugs = new Set<string>();
  const competitionNotionToLocalId = new Map<string, string>();

  let competitionCount = 0;
  for (const item of flatCompetitions) {
    const name = getProp(item.props, ["Name", "NAME"], "");
    if (!name) continue;
    const result = getProp(item.props, ["Result", "RESULT"], "");
    const priority = getProp(item.props, ["Priority", "PRIORITY"], "");
    const host = getProp<string[]>(item.props, ["Host", "HOST & ORGANIZER"], []);
    const rank = rankInfo(result as string);

    const existingCompetition = await prisma.competition.findUnique({ where: { notionId: item.id } });
    const summary = await fetchSummaryFields(
      token,
      "competition",
      item.id,
      name as string,
      item.editedTime,
      existingCompetition,
      [],
    );

    const row = await prisma.competition.upsert({
      where: { notionId: item.id },
      create: {
        notionId: item.id,
        name: name as string,
        result: result as string,
        rank: rank.key,
        rankLabel: rank.label,
        host: JSON.stringify(Array.isArray(host) ? host : [host].filter(Boolean)),
        year: yearFromName(name as string, item.createdTime),
        priority: priorityValue(priority),
        notionUrl: item.url,
        editedTime: new Date(item.editedTime),
        rawContent: summary.rawContent,
        aiSummary: summary.aiSummary,
      },
      update: {
        name: name as string,
        result: result as string,
        rank: rank.key,
        rankLabel: rank.label,
        host: JSON.stringify(Array.isArray(host) ? host : [host].filter(Boolean)),
        year: yearFromName(name as string, item.createdTime),
        priority: priorityValue(priority),
        notionUrl: item.url,
        editedTime: new Date(item.editedTime),
        rawContent: summary.rawContent,
        aiSummary: summary.aiSummary,
      },
    });
    competitionNotionToLocalId.set(item.id, row.id);
    competitionCount += 1;
  }

  let projectCount = 0;
  for (const page of projectPages) {
    const item = flattenPage(page);
    const name = getProp(item.props, ["Name", "NAME"], "");
    if (!name) continue;

    const descKo = getProp(item.props, ["Introduction [KOR]", "INTRODUCTION (KOREAN)"], "");
    const descEn = getProp(item.props, ["Introduction [ENG]", "INTRODUCTION (ENGLISH)"], "");
    const visibility = getProp(item.props, ["Visibility"], "");
    const competitionIds = getProp<string[]>(item.props, ["Competition", "COMPETITION"], []);

    const awardCompetitionIds = competitionIds
      .map((id) => competitionById.get(id))
      .filter(Boolean)
      .map((c) => c as NonNullable<typeof c>)
      .filter((c) => rankInfo(getProp(c.props, ["Result", "RESULT"], "") as string).key !== "none")
      .map((c) => c.id);

    const existing = await prisma.project.findUnique({ where: { notionId: item.id } });
    let slug = existing?.slug;
    if (!slug) {
      const base = slugify(name as string);
      slug = base;
      let n = 2;
      while (usedSlugs.has(slug) || (await prisma.project.findUnique({ where: { slug } }))) {
        slug = `${base}-${n}`;
        n += 1;
      }
    }
    usedSlugs.add(slug);

    const existingProjectTags: string[] = existing?.tags ? JSON.parse(existing.tags) : [];
    const summary = await fetchSummaryFields(
      token,
      "project",
      item.id,
      name as string,
      item.editedTime,
      existing,
      existingProjectTags,
    );
    const finalTags = summary.tags ?? existingProjectTags;

    const row = await prisma.project.upsert({
      where: { notionId: item.id },
      create: {
        notionId: item.id,
        name: name as string,
        slug,
        descKo: descKo as string,
        descEn: descEn as string,
        cover: item.cover,
        icon: item.icon,
        visibility: isPublic(visibility) ? "public" : "private",
        notionUrl: item.url,
        editedTime: new Date(item.editedTime),
        order: projectCount,
        tags: JSON.stringify(finalTags),
        rawContent: summary.rawContent,
        aiSummary: summary.aiSummary,
      },
      update: {
        name: name as string,
        descKo: descKo as string,
        descEn: descEn as string,
        cover: item.cover,
        icon: item.icon,
        visibility: isPublic(visibility) ? "public" : "private",
        notionUrl: item.url,
        editedTime: new Date(item.editedTime),
        tags: JSON.stringify(finalTags),
        rawContent: summary.rawContent,
        aiSummary: summary.aiSummary,
      },
    });

    await prisma.projectAward.deleteMany({ where: { projectId: row.id } });
    for (const competitionNotionId of awardCompetitionIds) {
      const localCompetitionId = competitionNotionToLocalId.get(competitionNotionId);
      if (!localCompetitionId) continue;
      await prisma.projectAward.create({
        data: { projectId: row.id, competitionId: localCompetitionId },
      });
    }

    projectCount += 1;
  }

  let activityCount = 0;
  for (const page of activityPages) {
    const item = flattenPage(page);
    const name = getProp(item.props, ["Name", "NAME"], "");
    if (!name) continue;

    const visibility = getProp(item.props, ["Visibility"], "");
    const tagsRaw = getProp(item.props, ["Tags", "TAGS", "Type", "TYPE", "Category", "CATEGORY"], []);
    const notionTags = Array.isArray(tagsRaw)
      ? tagsRaw
      : String(tagsRaw || "").split(",").map((v) => v.trim()).filter(Boolean);

    const existingActivity = await prisma.activity.findUnique({ where: { notionId: item.id } });
    const summary = await fetchSummaryFields(
      token,
      "activity",
      item.id,
      name as string,
      item.editedTime,
      existingActivity,
      notionTags,
    );
    // Notion's own Tags property always wins when present; the LLM only
    // fills the gap when Notion has none ("부족한 태그" — fill missing, don't
    // override curated ones), and a skipped/failed summarize step falls back
    // to whatever was already stored rather than clearing tags to empty.
    const existingActivityTags: string[] = existingActivity?.tags ? JSON.parse(existingActivity.tags) : [];
    const finalTags = notionTags.length > 0 ? notionTags : summary.tags ?? existingActivityTags;

    await prisma.activity.upsert({
      where: { notionId: item.id },
      create: {
        notionId: item.id,
        name: name as string,
        visibility: isPublic(visibility) ? "public" : "private",
        year: yearFromName(name as string, item.createdTime),
        tags: JSON.stringify(finalTags),
        notionUrl: item.url,
        editedTime: new Date(item.editedTime),
        rawContent: summary.rawContent,
        aiSummary: summary.aiSummary,
      },
      update: {
        name: name as string,
        visibility: isPublic(visibility) ? "public" : "private",
        year: yearFromName(name as string, item.createdTime),
        tags: JSON.stringify(finalTags),
        notionUrl: item.url,
        editedTime: new Date(item.editedTime),
        rawContent: summary.rawContent,
        aiSummary: summary.aiSummary,
      },
    });
    activityCount += 1;
  }

  return { projectCount, competitionCount, activityCount };
}
