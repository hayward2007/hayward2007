import "server-only";

import { z } from "zod";

const shortText = (max: number) => z.string().trim().max(max);
const optionalText = (max: number) => z.string().max(max).optional();
const visibility = z.enum(["public", "private"]);
const projectIds = z
  .array(z.string().min(1).max(64))
  .min(1)
  .max(50)
  .refine((ids) => new Set(ids).size === ids.length, "duplicate_project_ids");

export const projectPatchSchema = z
  .object({
    name: shortText(160).min(1).optional(),
    slug: shortText(160).min(1).optional(),
    descKo: optionalText(100_000).nullable(),
    descEn: optionalText(100_000).nullable(),
    cover: shortText(2048)
      .refine((value) => !value || value.startsWith("/") || /^https?:\/\//i.test(value), "invalid_cover_url")
      .optional(),
    icon: optionalText(2048).nullable(),
    visibility: visibility.optional(),
    order: z.coerce.number().int().min(-10_000).max(10_000).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, "empty_patch");

export const activityPatchSchema = z
  .object({
    name: shortText(200).min(1).optional(),
    year: shortText(24).optional().nullable(),
    visibility: visibility.optional(),
    tags: z.array(shortText(80).min(1)).max(30).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, "empty_patch");

export const competitionPatchSchema = z
  .object({
    name: shortText(240).min(1).optional(),
    year: shortText(24).optional().nullable(),
    priority: z.coerce.number().int().min(0).max(10_000).optional(),
    rank: z.enum(["gold", "silver", "bronze", "encouragement", "special", "none"]).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, "empty_patch");

export const blogCreateSchema = z.object({ title: shortText(200).min(1) }).strict();

export const blogPatchSchema = z
  .object({
    title: shortText(200).min(1).optional(),
    slug: shortText(200).min(1).optional(),
    body: optionalText(250_000),
    published: z.boolean().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, "empty_patch");

const portfolioFields = {
  title: shortText(200).min(1),
  targetRole: shortText(200).optional(),
  targetOrg: shortText(200).optional(),
  intro: z.string().max(5_000).optional(),
  accent: z.enum(["teal", "violet", "signal"]).optional(),
  isPublished: z.boolean().optional(),
  projectIds,
  highlightNotes: z.record(z.string(), z.string().max(500)).optional(),
};

export const portfolioCreateSchema = z
  .object({
    ...portfolioFields,
    slug: shortText(200).min(1).optional(),
  })
  .strict();

export const portfolioPatchSchema = z
  .object({
    title: portfolioFields.title.optional(),
    targetRole: portfolioFields.targetRole,
    targetOrg: portfolioFields.targetOrg,
    intro: portfolioFields.intro,
    accent: portfolioFields.accent,
    isPublished: portfolioFields.isPublished,
    projectIds: projectIds.optional(),
    highlightNotes: portfolioFields.highlightNotes,
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, "empty_patch");
