import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

type ResumePortfolio = {
  title: string;
  targetRole: string;
  targetOrg: string;
  intro: string;
  items: {
    highlightNote: string;
    project: {
      name: string;
      descKo: string;
      descEn: string;
      awards: { name: string; rankLabel: string; year: string }[];
    };
  }[];
};

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 56;
const CONTENT_W = PAGE_W - MARGIN * 2;

// pdf-lib's standard fonts only support WinAnsi (Latin-1) — embedding a full
// CJK font just for this is out of scope here, so English text is preferred
// and anything outside Latin-1 is stripped rather than crashing the export.
function sanitize(text: string): string {
  return text.replace(/[^\x00-\xFF]/g, "").replace(/\s+/g, " ").trim();
}

function preferEnglish(en: string, ko: string): string {
  const cleanEn = sanitize(en);
  if (cleanEn) return cleanEn;
  return sanitize(ko);
}

function wrapText(text: string, font: { widthOfTextAtSize: (t: string, s: number) => number }, size: number, maxWidth: number) {
  const words = text.split(" ").filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const attempt = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(attempt, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = attempt;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function buildResumePdf(portfolio: ResumePortfolio): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique);

  const ink = rgb(0.05, 0.05, 0.06);
  const muted = rgb(0.45, 0.45, 0.47);
  const accent = rgb(0.05, 0.5, 0.42);

  let page = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  function ensureSpace(needed: number) {
    if (y - needed < MARGIN) {
      page = doc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
    }
  }

  function drawParagraph(text: string, size: number, font = regular, color = ink, lineHeight = 1.4) {
    const clean = sanitize(text);
    if (!clean) return;
    const lines = wrapText(clean, font, size, CONTENT_W);
    for (const line of lines) {
      ensureSpace(size * lineHeight);
      page.drawText(line, { x: MARGIN, y, size, font, color });
      y -= size * lineHeight;
    }
  }

  // Header
  page.drawText("Hayward Kim", { x: MARGIN, y, size: 24, font: bold, color: ink });
  y -= 30;
  const roleLine = sanitize([portfolio.targetRole, portfolio.targetOrg && `— ${portfolio.targetOrg}`].filter(Boolean).join(" "));
  if (roleLine) {
    page.drawText(roleLine, { x: MARGIN, y, size: 12, font: italic, color: accent });
    y -= 22;
  }
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.75, color: rgb(0.85, 0.85, 0.85) });
  y -= 20;

  if (portfolio.intro) {
    drawParagraph(portfolio.intro, 11, regular, ink, 1.5);
    y -= 12;
  }

  for (const item of portfolio.items) {
    ensureSpace(50);
    page.drawText(sanitize(item.project.name), { x: MARGIN, y, size: 15, font: bold, color: ink });
    y -= 18;

    if (item.highlightNote) {
      drawParagraph(item.highlightNote, 10.5, italic, accent, 1.4);
    }

    const desc = preferEnglish(item.project.descEn, item.project.descKo);
    if (desc) drawParagraph(desc, 10.5, regular, ink, 1.45);

    if (item.project.awards.length > 0) {
      const awardsLine = item.project.awards.map((a) => `${a.rankLabel} — ${a.name} (${a.year})`).join("  ·  ");
      drawParagraph(awardsLine, 9.5, regular, muted, 1.4);
    }
    y -= 14;
  }

  ensureSpace(20);
  page.drawText("hayward_kim@korea.ac.kr", { x: MARGIN, y, size: 9.5, font: regular, color: muted });

  return doc.save();
}
