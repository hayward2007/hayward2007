import { Box, FileCode2, Gauge, type LucideIcon } from "lucide-react";

const FALLBACK_ICONS: Record<string, LucideIcon> = {
  "Fusion 360": Box,
  MuJoCo: Gauge,
  URDF: FileCode2,
};

// Brand hexes near-black (e.g. Next.js's #000000) would vanish against the
// site's dark-mode background, so those fall back to the theme foreground
// token instead — which is itself near-black in light mode, so light mode
// is unaffected.
function resolveColor(hex: string | undefined, fallback: string) {
  if (!hex) return fallback;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance < 40 ? "var(--fg)" : `#${hex}`;
}

export function SkillTag({
  name,
  path,
  hex,
  primary,
}: {
  name: string;
  path?: string;
  hex?: string;
  primary: boolean;
}) {
  const color = primary ? resolveColor(hex, "var(--accent-robotics)") : "var(--fg-3)";
  const FallbackIcon = FALLBACK_ICONS[name];

  return (
    <span className="group inline-flex items-center gap-2 py-0.5">
      {path && (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="shrink-0 opacity-70 transition-opacity group-hover:opacity-100"
          style={{ color }}
        >
          <path fill="currentColor" d={path} />
        </svg>
      )}
      {!path && FallbackIcon && (
        <FallbackIcon
          size={14}
          strokeWidth={1.7}
          aria-hidden="true"
          className="shrink-0 opacity-60 transition-opacity group-hover:opacity-100"
          style={{ color: "var(--fg-3)" }}
        />
      )}
      <span className="text-[13.5px] font-medium" style={{ color: "var(--fg-2)" }}>
        {name}
      </span>
    </span>
  );
}
