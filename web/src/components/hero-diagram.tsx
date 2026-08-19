"use client";

import { motion } from "framer-motion";
import { mulberry32 } from "@/lib/pictogram";

const rand = mulberry32(hashCode("hayward-hero-lattice"));

function hashCode(text: string) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

const WIDTH = 640;
const HEIGHT = 640;
const NODE_COUNT = 26;

const nodes = Array.from({ length: NODE_COUNT }, (_, i) => ({
  id: i,
  x: rand() * WIDTH,
  y: rand() * HEIGHT,
  r: 1.6 + rand() * 2.2,
  delay: rand() * 4,
}));

const links: { a: number; b: number }[] = [];
nodes.forEach((node, i) => {
  const next = nodes[(i + 1) % nodes.length];
  links.push({ a: node.id, b: next.id });
  if (rand() > 0.72) {
    const other = nodes[(i + 5) % nodes.length];
    links.push({ a: node.id, b: other.id });
  }
});

export function HeroDiagram() {
  return (
    <div
      className="pointer-events-none absolute right-[-8%] top-[-8%] hidden h-[560px] w-[560px] opacity-70 lg:block"
      aria-hidden="true"
    >
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-full w-full">
        {links.map((link, i) => {
          const a = nodes[link.a];
          const b = nodes[link.b];
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="var(--line-strong)"
              strokeWidth={1}
            />
          );
        })}
        {nodes.map((node) => (
          <motion.circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r={node.r}
            fill="var(--accent-robotics)"
            animate={{ opacity: [0.25, 0.9, 0.25] }}
            transition={{ duration: 3.4, repeat: Infinity, delay: node.delay, ease: "easeInOut" }}
          />
        ))}
      </svg>
    </div>
  );
}
