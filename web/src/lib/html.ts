import DOMPurify from "isomorphic-dompurify";

// Kept intentionally small — this only needs to round-trip what the
// StarterKit-only rich-text editor (src/components/admin/rich-text-editor.tsx)
// can produce.
const ALLOWED_TAGS = ["p", "strong", "em", "s", "h1", "h2", "h3", "ul", "ol", "li", "blockquote", "br", "code", "pre"];

// For rendering a description as real formatted HTML (the project detail page).
export function sanitizeHtml(value: string | null | undefined): string {
  return DOMPurify.sanitize(value || "", { ALLOWED_TAGS, ALLOWED_ATTR: [] });
}

// For plain-text contexts (card excerpts, PDF export, search subtitles) — strips
// tags rather than rendering them, and also flattens embedded newlines the way
// Notion-synced plain text (pre-rich-text content) already relied on. Routed
// through DOMPurify (ALLOWED_TAGS: []) rather than a bare tag-stripping regex —
// a regex only removes the `<script>`/`<style>` tags themselves and leaves their
// inner JS/CSS source behind as visible text; DOMPurify discards that content
// too, since it treats those elements' entire subtree as unsafe to keep.
export function stripHtml(value: string | null | undefined): string {
  const text = DOMPurify.sanitize(value || "", { ALLOWED_TAGS: [] });
  return text.replace(/\s*\n\s*/g, " ").replace(/\s+/g, " ").trim();
}
