"use client";

import { useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { hashSeed, variantForSeed, buildPictogram } from "@/lib/pictogram";

export function Pictogram({
  seedText,
  dotRadius = 3,
  complexity = 1,
  stroke = "var(--fg-3)",
  hoverStroke = "var(--accent-robotics)",
  className,
}: {
  seedText: string;
  dotRadius?: number;
  complexity?: number;
  stroke?: string;
  hoverStroke?: string;
  className?: string;
}) {
  const seed = hashSeed(seedText);
  const variant = variantForSeed(seed);
  const shapes = buildPictogram(seed, variant, dotRadius, complexity);

  const svgRef = useRef<SVGSVGElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState(false);

  function onMouseMove(e: ReactMouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setOffset({ x: px * 14, y: py * 14 });
  }

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 120 120"
      className={className}
      preserveAspectRatio="xMidYMid meet"
      style={{ color: stroke, transition: "color 0.3s ease-out" }}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setOffset({ x: 0, y: 0 });
      }}
    >
      <g
        style={{
          color: hover ? hoverStroke : stroke,
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${hover ? 1.16 : 1})`,
          transformOrigin: "60px 60px",
          transformBox: "fill-box",
          transition: hover
            ? "transform 0.15s ease-out, color 0.25s ease-out"
            : "transform 0.4s var(--ease, ease-out), color 0.4s ease-out",
        }}
      >
        {shapes.lines.map((line, i) => (
          <line key={i} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke="currentColor" strokeWidth={0.6} />
        ))}
        {shapes.nodes.map((node, i) => (
          <circle
            key={i}
            cx={node.x}
            cy={node.y}
            r={hover ? node.r * 1.4 : node.r}
            fill="currentColor"
            style={{ transition: "r 0.2s ease-out" }}
          />
        ))}
        {shapes.rects.map((rect, i) => (
          <rect key={i} x={rect.x} y={rect.y} width={rect.w} height={rect.h} fill="none" stroke="currentColor" strokeWidth={0.8} />
        ))}
        {shapes.circles.map((circle, i) => (
          <circle key={i} cx={circle.cx} cy={circle.cy} r={circle.r} fill="none" stroke="currentColor" strokeWidth={0.8} />
        ))}
        {shapes.paths.map((path, i) => (
          <path key={i} d={path.d} fill="none" stroke="currentColor" strokeWidth={0.8} />
        ))}
      </g>
    </svg>
  );
}
