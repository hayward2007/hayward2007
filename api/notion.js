const NOTION_VERSION = "2022-06-28";

const DATABASES = {
  projects: "314685d7-d96a-8124-902e-c7155189ef0b",
  competitions: "314685d7-d96a-819a-b96d-cc1340581c03",
  activities: "314685d7-d96a-8145-b41b-db2955b8849d",
};

function richTextToPlain(items = []) {
  return items.map((item) => item.plain_text || "").join("");
}

function propValue(prop) {
  if (!prop) return null;
  if (prop.type === "title") return richTextToPlain(prop.title);
  if (prop.type === "rich_text") return richTextToPlain(prop.rich_text);
  if (prop.type === "select") return prop.select?.name || "";
  if (prop.type === "multi_select") return prop.multi_select?.map((item) => item.name) || [];
  if (prop.type === "number") return prop.number;
  if (prop.type === "checkbox") return prop.checkbox;
  if (prop.type === "date") return prop.date?.start || "";
  if (prop.type === "url") return prop.url || "";
  if (prop.type === "relation") return prop.relation?.map((item) => item.id) || [];
  return prop[prop.type] ?? null;
}

function getProp(props, names, fallback = null) {
  for (const name of names) {
    if (Object.prototype.hasOwnProperty.call(props, name)) return props[name];
  }
  return fallback;
}

function flattenPage(page) {
  const props = Object.fromEntries(
    Object.entries(page.properties || {}).map(([key, value]) => [key, propValue(value)]),
  );
  return {
    id: page.id,
    url: page.url,
    createdTime: page.created_time,
    editedTime: page.last_edited_time,
    props,
  };
}

function yearFromName(name, fallback = "") {
  return String(name || fallback).match(/\b(19|20)\d{2}\b/)?.[0] || "";
}

function rankInfo(result = "") {
  const text = String(result);
  const lower = text.toLowerCase();
  if (lower.includes("gold") || text.includes("금") || text.includes("🥇")) return { key: "gold", label: "Gold", weight: 1 };
  if (lower.includes("silver") || text.includes("은") || text.includes("🥈")) return { key: "silver", label: "Silver", weight: 2 };
  if (lower.includes("bronze") || text.includes("동") || text.includes("🥉")) return { key: "bronze", label: "Bronze", weight: 3 };
  if (lower.includes("encouragement") || text.includes("장려") || text.includes("🏅")) return { key: "encouragement", label: "Encouragement", weight: 4 };
  if (lower.includes("none") || text.includes("❌")) return { key: "none", label: "Participated", weight: 8 };
  return { key: "special", label: "Award", weight: 0 };
}

function priorityValue(value) {
  if (value === 0) return 0;
  const match = String(value ?? "").match(/\d+/);
  return match ? Number(match[0]) : 99;
}

function isPublic(value) {
  const text = String(value || "").toLowerCase();
  return text === "public" || text === "show" || text === "visible" || text === "true";
}

function transformData(raw) {
  const competitionPages = raw.competitions.map(flattenPage);
  const competitionById = new Map(competitionPages.map((item) => [item.id, item]));

  const competitions = competitionPages
    .map((item) => {
      const name = getProp(item.props, ["Name", "NAME"], "");
      const result = getProp(item.props, ["Result", "RESULT"], "");
      const priority = getProp(item.props, ["Priority", "PRIORITY"], "");
      const host = getProp(item.props, ["Host", "HOST & ORGANIZER"], []);
      const rank = rankInfo(result);
      return {
        id: item.id,
        type: "competition",
        name,
        result,
        rank: rank.key,
        rankLabel: rank.label,
        host,
        year: yearFromName(name, item.createdTime),
        priority: priorityValue(priority),
        priorityLabel: priority ? String(priority) : "",
        isAward: rank.key !== "none",
        notionUrl: item.url,
        editedTime: item.editedTime,
      };
    })
    .filter((item) => item.name)
    .sort((a, b) => a.priority - b.priority || rankInfo(a.result).weight - rankInfo(b.result).weight || Number(b.year || 0) - Number(a.year || 0));

  const projects = raw.projects
    .map(flattenPage)
    .map((item) => {
      const name = getProp(item.props, ["Name", "NAME"], "");
      const desc = getProp(item.props, ["Introduction [KOR]", "INTRODUCTION (KOREAN)"], "");
      const english = getProp(item.props, ["Introduction [ENG]", "INTRODUCTION (ENGLISH)"], "");
      const visibility = getProp(item.props, ["Visibility"], "");
      const competitionIds = getProp(item.props, ["Competition", "COMPETITION"], []);
      const relatedAwards = competitionIds
        .map((id) => competitionById.get(id))
        .filter(Boolean)
        .map((competition) => rankInfo(getProp(competition.props, ["Result", "RESULT"], "")))
        .filter((rank) => rank.key !== "none")
        .map((rank) => rank.label);

      return {
        id: item.id,
        type: "project",
        name,
        desc,
        english,
        tags: [...new Set(relatedAwards)],
        visibility,
        notionUrl: item.url,
        editedTime: item.editedTime,
      };
    })
    .filter((item) => item.name && isPublic(item.visibility));

  const activities = raw.activities
    .map(flattenPage)
    .map((item) => {
      const name = getProp(item.props, ["Name", "NAME"], "");
      const visibility = getProp(item.props, ["Visibility"], "");
      return {
        id: item.id,
        type: "activity",
        name,
        visibility,
        year: yearFromName(name, item.createdTime),
        tags: [],
        notionUrl: item.url,
        editedTime: item.editedTime,
      };
    })
    .filter((item) => item.name && isPublic(item.visibility))
    .sort((a, b) => Number(b.year || 0) - Number(a.year || 0));

  return {
    projects,
    competitions,
    featuredCompetitions: competitions.filter((item) => item.isAward),
    activities,
    counts: {
      projects: raw.projects.length,
      competitions: raw.competitions.length,
      activities: raw.activities.length,
      visibleProjects: projects.length,
      visibleActivities: activities.length,
    },
    syncedAt: new Date().toISOString(),
  };
}

function blockText(block) {
  const value = block[block.type];
  if (!value) return "";
  if (Array.isArray(value.rich_text)) return richTextToPlain(value.rich_text);
  if (Array.isArray(value.caption)) return richTextToPlain(value.caption);
  return "";
}

async function notionRequest(token, path, options = {}) {
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
    throw new Error(`Notion ${response.status}: ${message}`);
  }

  return response.json();
}

async function queryDatabase(token, databaseId) {
  const pages = [];
  let startCursor;
  do {
    const payload = { page_size: 100 };
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

async function getPageBlocks(token, pageId) {
  const blocks = [];
  let startCursor;
  do {
    const query = startCursor ? `?start_cursor=${encodeURIComponent(startCursor)}&page_size=100` : "?page_size=100";
    const data = await notionRequest(token, `/blocks/${pageId}/children${query}`);
    blocks.push(...data.results);
    startCursor = data.next_cursor;
  } while (startCursor);

  return blocks
    .map((block) => ({
      id: block.id,
      type: block.type,
      text: blockText(block),
    }))
    .filter((block) => block.text);
}

module.exports = async function handler(req, res) {
  const token = process.env.NOTION_ACCESS_TOKEN;
  if (!token) {
    res.status(500).json({ error: "NOTION_ACCESS_TOKEN is not configured." });
    return;
  }

  try {
    const url = new URL(req.url, `https://${req.headers.host || "localhost"}`);
    const pageId = url.searchParams.get("page");

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");

    if (pageId) {
      const blocks = await getPageBlocks(token, pageId);
      res.status(200).json({ blocks });
      return;
    }

    const [projects, competitions, activities] = await Promise.all([
      queryDatabase(token, DATABASES.projects),
      queryDatabase(token, DATABASES.competitions),
      queryDatabase(token, DATABASES.activities),
    ]);
    res.status(200).json(transformData({ projects, competitions, activities }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
