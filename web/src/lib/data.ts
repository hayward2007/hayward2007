import "server-only";

import { prisma } from "@/lib/prisma";
import { GAMES, TOOLS } from "@/lib/catalog";
import { sanitizeExternalUrl, sanitizeHtml, stripHtml } from "@/lib/html";
import { PROJECT_CASE_STUDY_INDEX } from "@/lib/project-case-studies";

const caseStudyIndexBySlug = new Map(PROJECT_CASE_STUDY_INDEX.map((study) => [study.slug, study]));
const PROJECT_COVER_FALLBACKS: Record<string, string> = {
  "dimipay-kiosk": "/project-assets/dimipay-kiosk/hero.png",
};

function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string").slice(0, 50)
      : [];
  } catch {
    return [];
  }
}

export async function getPublicProjects() {
  const projects = await prisma.project.findMany({
    where: { visibility: "public" },
    orderBy: { order: "asc" },
    include: { awards: { include: { competition: true } } },
  });

  const mappedProjects = projects.map((project) => {
    const ownTags = parseJsonArray(project.tags);
    const caseStudy = caseStudyIndexBySlug.get(project.slug);
    return {
      id: project.id,
      slug: project.slug,
      name: caseStudy?.name || project.name,
      descKo: caseStudy?.description || stripHtml(project.descKo),
      descEn: stripHtml(project.descEn),
      cover: project.cover || caseStudy?.heroImage || PROJECT_COVER_FALLBACKS[project.slug] || "",
      icon: project.icon || "",
      // Real content tags (LLM-filled from the Notion write-up when Project.tags
      // is empty) take priority; award rank labels are only a fallback for
      // projects that haven't been summarized yet.
      tags:
        caseStudy?.tags.length
          ? caseStudy.tags
          : ownTags.length > 0
          ? ownTags
          : ([...new Set(project.awards.map((a) => stripHtml(a.competition.rankLabel)).filter(Boolean))] as string[]),
      awards: project.awards.map((a) => ({
        name: a.competition.name,
        result: a.competition.result || "",
        rank: a.competition.rank || "",
        rankLabel: a.competition.rankLabel || "",
        year: a.competition.year || "",
      })),
    };
  });

  const existingSlugs = new Set(mappedProjects.map((project) => project.slug));
  for (const caseStudy of PROJECT_CASE_STUDY_INDEX) {
    if (existingSlugs.has(caseStudy.slug)) continue;
    mappedProjects.push({
      id: `case-study-${caseStudy.slug}`,
      slug: caseStudy.slug,
      name: caseStudy.name,
      descKo: caseStudy.description,
      descEn: "",
      cover: caseStudy.heroImage,
      icon: "",
      tags: caseStudy.tags,
      awards: [],
    });
  }

  return mappedProjects.sort((a, b) => {
    const aOrder = caseStudyIndexBySlug.get(a.slug)?.order ?? Number.MAX_SAFE_INTEGER;
    const bOrder = caseStudyIndexBySlug.get(b.slug)?.order ?? Number.MAX_SAFE_INTEGER;
    return aOrder - bOrder;
  });
}

export async function getProjectBySlug(slug: string) {
  const caseStudy = caseStudyIndexBySlug.get(slug);
  const project = await prisma.project.findUnique({
    where: { slug },
    include: { awards: { include: { competition: true } } },
  });
  if (!project || project.visibility !== "public") {
    if (!caseStudy) return null;
    return {
      id: `case-study-${caseStudy.slug}`,
      slug: caseStudy.slug,
      name: caseStudy.name,
      descKo: caseStudy.description,
      descEn: "",
      aiSummary: "",
      cover: caseStudy.heroImage,
      icon: "",
      awards: [],
    };
  }

  return {
    id: project.id,
    slug: project.slug,
    name: caseStudy?.name || project.name,
    descKo: caseStudy?.description || sanitizeHtml(project.descKo),
    descEn: sanitizeHtml(project.descEn),
    aiSummary: sanitizeHtml(project.aiSummary),
    cover: project.cover || caseStudy?.heroImage || PROJECT_COVER_FALLBACKS[project.slug] || "",
    icon: project.icon || "",
    awards: project.awards.map((a) => ({
      name: a.competition.name,
      result: a.competition.result || "",
      rank: a.competition.rank || "",
      rankLabel: a.competition.rankLabel || "",
      year: a.competition.year || "",
    })),
  };
}

export async function getPublicActivities() {
  const activities = await prisma.activity.findMany({
    where: { visibility: "public" },
    orderBy: { year: "desc" },
  });
  return activities.map((activity) => ({
    id: activity.id,
    name: activity.name,
    year: activity.year || "",
    tags: parseJsonArray(activity.tags),
    aiSummary: sanitizeHtml(activity.aiSummary),
  }));
}

export async function getCompetitions() {
  const competitions = await prisma.competition.findMany({
    orderBy: [{ priority: "asc" }, { year: "desc" }],
  });
  return competitions.map((c) => ({
    id: c.id,
    name: c.name,
    result: c.result || "",
    rank: c.rank || "",
    rankLabel: c.rankLabel || "",
    host: parseJsonArray(c.host),
    aiSummary: sanitizeHtml(c.aiSummary),
    year: c.year || "",
    priority: c.priority,
    isAward: c.rank !== "none",
  }));
}

export async function getCounts() {
  const [projects, competitions, activities, visibleProjects, visibleActivities] = await Promise.all([
    prisma.project.count(),
    prisma.competition.count(),
    prisma.activity.count(),
    prisma.project.count({ where: { visibility: "public" } }),
    prisma.activity.count({ where: { visibility: "public" } }),
  ]);
  return { projects, competitions, activities, visibleProjects, visibleActivities };
}

export async function getLastSync() {
  const log = await prisma.syncLog.findFirst({ orderBy: { createdAt: "desc" } });
  return log?.createdAt?.toISOString() || null;
}

export type SearchEntry = {
  type: "project" | "record" | "activity" | "game" | "tool" | "post";
  title: string;
  subtitle: string;
  href: string;
};

export async function getSearchIndex(): Promise<SearchEntry[]> {
  const [projects, competitions, activities, posts] = await Promise.all([
    getPublicProjects(),
    getCompetitions(),
    getPublicActivities(),
    getPublishedBlogPosts(),
  ]);

  const projectEntries: SearchEntry[] = projects.map((p) => ({
    type: "project",
    title: p.name,
    subtitle: p.descKo || p.descEn || "",
    href: `/project/${p.slug}`,
  }));

  const recordEntries: SearchEntry[] = competitions.map((c) => ({
    type: "record",
    title: c.name,
    subtitle: [c.year, c.rankLabel].filter(Boolean).join(" · "),
    href: "/awards",
  }));

  const activityEntries: SearchEntry[] = activities.map((a) => ({
    type: "activity",
    title: a.name,
    subtitle: a.year,
    href: "/awards",
  }));

  const gameEntries: SearchEntry[] = GAMES.map((g) => ({ type: "game", title: g.title, subtitle: g.desc, href: g.href }));
  const toolEntries: SearchEntry[] = TOOLS.map((t) => ({ type: "tool", title: t.title, subtitle: t.desc, href: t.href }));
  const postEntries: SearchEntry[] = posts.map((post) => ({
    type: "post",
    title: post.title,
    subtitle: post.excerpt,
    href: `/social/${post.slug}`,
  }));

  return [...projectEntries, ...recordEntries, ...activityEntries, ...gameEntries, ...toolEntries, ...postEntries];
}

export async function getPortfolioBySlug(slug: string) {
  const build = await prisma.portfolioBuild.findUnique({
    where: { slug },
    include: {
      items: {
        orderBy: { order: "asc" },
        include: { project: { include: { awards: { include: { competition: true } } } } },
      },
    },
  });
  if (!build || !build.isPublished) return null;

  return {
    slug: build.slug,
    title: build.title,
    targetRole: build.targetRole || "",
    targetOrg: build.targetOrg || "",
    intro: build.intro || "",
    accent: build.accent,
    items: build.items.map((item) => ({
      highlightNote: item.highlightNote || "",
      project: {
        slug: item.project.slug,
        name: item.project.name,
        descKo: stripHtml(item.project.descKo),
        descEn: stripHtml(item.project.descEn),
        cover: item.project.cover || PROJECT_COVER_FALLBACKS[item.project.slug] || "",
        awards: item.project.awards.map((a) => ({
          name: a.competition.name,
          rankLabel: a.competition.rankLabel || "",
          year: a.competition.year || "",
        })),
      },
    })),
  };
}

export async function getPublishedBlogPosts() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });
  return posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: stripHtml(post.body).slice(0, 160),
    createdAt: post.createdAt.toISOString(),
    source: post.source || "",
    field: post.field || "",
    tags: parseJsonArray(post.tags),
  }));
}

export async function getBlogPostBySlug(slug: string) {
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: { comments: { orderBy: { createdAt: "desc" }, take: 100 } },
  });
  if (!post || !post.published) return null;

  return {
    slug: post.slug,
    title: post.title,
    body: sanitizeHtml(post.body),
    createdAt: post.createdAt.toISOString(),
    source: post.source || "",
    sourceUrl: sanitizeExternalUrl(post.sourceUrl),
    field: post.field || "",
    tags: parseJsonArray(post.tags),
    comments: post.comments.reverse().map((c) => ({
      id: c.id,
      name: c.name,
      body: c.body,
      createdAt: c.createdAt.toISOString(),
    })),
  };
}
