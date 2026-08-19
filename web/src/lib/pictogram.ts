export function hashSeed(text: string) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const PICTOGRAM_VARIANTS = ["nodes", "bars", "rings", "chevrons"] as const;
export type PictogramVariant = (typeof PICTOGRAM_VARIANTS)[number];

export function variantForSeed(seed: number): PictogramVariant {
  return PICTOGRAM_VARIANTS[seed % PICTOGRAM_VARIANTS.length];
}

type Node = { x: number; y: number; r: number };
type Line = { x1: number; y1: number; x2: number; y2: number };
type Rect = { x: number; y: number; w: number; h: number };
type Circle = { cx: number; cy: number; r: number };
type Path = { d: string };

export type PictogramShapes = {
  nodes: Node[];
  lines: Line[];
  rects: Rect[];
  circles: Circle[];
  paths: Path[];
};

export function buildPictogram(
  seed: number,
  variant: PictogramVariant,
  dotRadius = 3,
  complexity = 1,
): PictogramShapes {
  const rand = mulberry32(seed);
  const size = 120;
  const shapes: PictogramShapes = { nodes: [], lines: [], rects: [], circles: [], paths: [] };

  if (variant === "nodes") {
    const count = Math.round((7 + Math.floor(rand() * 4)) * complexity);
    const points: Node[] = Array.from({ length: count }, () => ({
      x: rand() * size,
      y: rand() * size,
      r: dotRadius,
    }));
    points.forEach((p, i) => {
      const next = points[(i + 1) % points.length];
      shapes.lines.push({ x1: p.x, y1: p.y, x2: next.x, y2: next.y });
      if (rand() > 0.5) {
        const other = points[(i + 2) % points.length];
        shapes.lines.push({ x1: p.x, y1: p.y, x2: other.x, y2: other.y });
      }
    });
    shapes.nodes = points;
    return shapes;
  }

  if (variant === "bars") {
    const rows = Math.max(3, Math.round((5 + Math.floor(rand() * 3)) * complexity));
    for (let i = 0; i < rows; i += 1) {
      const w = 30 + rand() * (size - 40);
      shapes.rects.push({ x: 10, y: 10 + i * (size / rows), w, h: (size / rows) * 0.42 });
    }
    return shapes;
  }

  if (variant === "rings") {
    const rings = Math.max(2, Math.round((3 + Math.floor(rand() * 3)) * complexity));
    for (let i = 0; i < rings; i += 1) {
      shapes.circles.push({ cx: size / 2, cy: size / 2, r: 10 + i * (size / rings / 1.4) });
    }
    return shapes;
  }

  // chevrons
  const count = Math.max(2, Math.round((4 + Math.floor(rand() * 3)) * complexity));
  for (let i = 0; i < count; i += 1) {
    const y = 12 + i * (size / count);
    shapes.paths.push({ d: `M10 ${y} L${size / 2} ${y + 14} L${size - 10} ${y}` });
  }
  return shapes;
}
