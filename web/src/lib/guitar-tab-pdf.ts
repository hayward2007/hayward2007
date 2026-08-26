import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import {
  GUITAR_STRINGS,
  createTabSegments,
  formatTabTime,
  type GuitarTabNote,
} from "@/lib/guitar-tab";

type GuitarTabPdfInput = {
  title: string;
  source: string;
  sourceOffsetSeconds: number;
  notes: GuitarTabNote[];
  fileStem?: string;
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const PAGE_MARGIN = 48;

export async function createGuitarTabPdfBytes(input: GuitarTabPdfInput) {
  const document = await PDFDocument.create();
  const sans = await document.embedFont(StandardFonts.Helvetica);
  const sansBold = await document.embedFont(StandardFonts.HelveticaBold);
  const monoBold = await document.embedFont(StandardFonts.CourierBold);
  const ink = rgb(0.05, 0.05, 0.06);
  const muted = rgb(0.38, 0.38, 0.4);
  const line = rgb(0.79, 0.79, 0.81);
  const guide = rgb(0.91, 0.91, 0.92);
  const accent = rgb(0.32, 0.26, 0.84);
  const paper = rgb(1, 1, 1);
  const segments = createTabSegments(input.notes);

  document.setTitle(asciiText(input.title) || "Melody Guitar Tab");
  document.setCreator("hayward.kim Melody to Tab");

  let page = addPage();
  let y = drawHeader();

  for (const segment of segments) {
    const staffHeight = 142;
    if (y - staffHeight < PAGE_MARGIN) {
      page = addPage();
      y = drawHeader(true);
    }

    const left = PAGE_MARGIN + 24;
    const right = PAGE_WIDTH - PAGE_MARGIN;
    const width = right - left;
    const top = y - 22;
    const rowGap = 18;

    page.drawText(
      `${formatTabTime(input.sourceOffsetSeconds + segment.startTimeSeconds)} - ${formatTabTime(
        input.sourceOffsetSeconds + segment.startTimeSeconds + segment.durationSeconds,
      )}`,
      { x: PAGE_MARGIN, y, size: 8.5, font: sansBold, color: muted },
    );

    for (let tick = 0; tick <= 4; tick += 1) {
      const x = left + (width * tick) / 4;
      page.drawLine({
        start: { x, y: top + 4 },
        end: { x, y: top - rowGap * 5 - 4 },
        thickness: 0.45,
        color: guide,
      });
      if (tick < 4) {
        page.drawText(`${tick * 2}s`, { x: x + 2, y: top + 8, size: 6.5, font: sans, color: muted });
      }
    }

    GUITAR_STRINGS.forEach((string, stringIndex) => {
      const lineY = top - stringIndex * rowGap;
      page.drawText(string.label, { x: PAGE_MARGIN, y: lineY - 3, size: 8, font: monoBold, color: muted });
      page.drawLine({ start: { x: left, y: lineY }, end: { x: right, y: lineY }, thickness: 0.8, color: line });
    });

    for (const note of segment.notes) {
      const x =
        left +
        (width * (note.startTimeSeconds - segment.startTimeSeconds)) / segment.durationSeconds;
      const noteY = top - (note.stringNumber - 1) * rowGap;
      const label = String(note.fret);
      const labelWidth = monoBold.widthOfTextAtSize(label, 8.5);
      page.drawRectangle({
        x: x - labelWidth / 2 - 2,
        y: noteY - 5,
        width: labelWidth + 4,
        height: 10,
        color: paper,
      });
      page.drawText(label, { x: x - labelWidth / 2, y: noteY - 3.2, size: 8.5, font: monoBold, color: accent });
    }

    y = top - rowGap * 5 - 28;
  }

  const pages = document.getPages();
  pages.forEach((pdfPage, index) => {
    pdfPage.drawText(`${index + 1} / ${pages.length}`, {
      x: PAGE_WIDTH - PAGE_MARGIN - 24,
      y: 25,
      size: 7,
      font: sans,
      color: muted,
    });
  });

  return document.save();

  function drawHeader(continued = false) {
    page.drawText(continued ? "MELODY GUITAR TAB / CONTINUED" : "MELODY GUITAR TAB", {
      x: PAGE_MARGIN,
      y: PAGE_HEIGHT - 48,
      size: 9,
      font: sansBold,
      color: accent,
    });
    page.drawText(trimToWidth(asciiText(input.title) || "Untitled melody", 26, PAGE_WIDTH - PAGE_MARGIN * 2, sansBold), {
      x: PAGE_MARGIN,
      y: PAGE_HEIGHT - 79,
      size: 18,
      font: sansBold,
      color: ink,
    });
    page.drawText(trimToWidth(input.source, 8, PAGE_WIDTH - PAGE_MARGIN * 2, sans), {
      x: PAGE_MARGIN,
      y: PAGE_HEIGHT - 98,
      size: 8,
      font: sans,
      color: muted,
    });
    page.drawText("Standard tuning  /  24 frets  /  timeline in seconds", {
      x: PAGE_MARGIN,
      y: PAGE_HEIGHT - 115,
      size: 8,
      font: sans,
      color: muted,
    });
    page.drawLine({
      start: { x: PAGE_MARGIN, y: PAGE_HEIGHT - 128 },
      end: { x: PAGE_WIDTH - PAGE_MARGIN, y: PAGE_HEIGHT - 128 },
      thickness: 0.8,
      color: line,
    });
    return PAGE_HEIGHT - 150;
  }

  function addPage() {
    const nextPage = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    nextPage.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: paper });
    return nextPage;
  }
}

export async function downloadGuitarTabPdf(input: GuitarTabPdfInput) {
  const bytes = await createGuitarTabPdfBytes(input);
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement("a");
  link.href = url;
  link.download = `${safeFileStem(input.fileStem || input.title)}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}

function asciiText(value: string) {
  return value.normalize("NFKD").replace(/[^\x20-\x7e]/g, "").trim();
}

function safeFileStem(value: string) {
  const safe = asciiText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  return safe || "melody-guitar-tab";
}

function trimToWidth(
  value: string,
  fontSize: number,
  maxWidth: number,
  font: { widthOfTextAtSize(text: string, size: number): number },
) {
  if (font.widthOfTextAtSize(value, fontSize) <= maxWidth) return value;
  let trimmed = value;
  while (trimmed.length > 1 && font.widthOfTextAtSize(`${trimmed}...`, fontSize) > maxWidth) {
    trimmed = trimmed.slice(0, -1);
  }
  return `${trimmed}...`;
}
