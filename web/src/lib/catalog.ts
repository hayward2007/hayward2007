// Single source of truth for the games/tools hub (src/app/play/page.tsx) and
// the search index (getSearchIndex in src/lib/data.ts) — one list, two consumers.
export type CatalogEntry = { slug: string; title: string; desc: string; href: string };

export const GAMES: CatalogEntry[] = [
  { slug: "rover-run", title: "Rover Run", desc: "Jump over incoming obstacles. Space / tap to jump.", href: "/play/rover-run" },
  { slug: "arm-reach", title: "Arm Reach", desc: "Guide the arm to each target before time runs out.", href: "/play/arm-reach" },
  { slug: "signal-catch", title: "Signal Catch", desc: "Catch every packet before it hits the ground.", href: "/play/signal-catch" },
  { slug: "stack-tower", title: "Stack Tower", desc: "Drop each block on the last. How high can you go?", href: "/play/stack-tower" },
  { slug: "signal-sequence", title: "Signal Sequence", desc: "Watch the pattern, then repeat it back.", href: "/play/signal-sequence" },
  { slug: "line-racer", title: "Line Racer", desc: "Steer along the track before it outruns you.", href: "/play/line-racer" },
];

export const TOOLS: CatalogEntry[] = [
  { slug: "merge-pdf", title: "Merge PDF", desc: "Combine multiple PDFs into one.", href: "/tools/merge-pdf" },
  { slug: "compress-image", title: "Compress Image", desc: "Shrink an image's file size.", href: "/tools/compress-image" },
  { slug: "resume-export", title: "Résumé Export", desc: "Turn a generated portfolio into a PDF.", href: "/tools/resume-export" },
  { slug: "qr-code", title: "QR Code", desc: "Turn any text or link into a scannable code.", href: "/tools/qr-code" },
  { slug: "color-palette", title: "Color Palette", desc: "Extract the dominant colors from an image.", href: "/tools/color-palette" },
  { slug: "unit-converter", title: "Unit Converter", desc: "Angle, length, mass, torque conversions.", href: "/tools/unit-converter" },
];
