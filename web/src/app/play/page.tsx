import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowUpRight,
  Bot,
  BrainCircuit,
  FileDown,
  Files,
  Gauge,
  ImageDown,
  Layers3,
  Music2,
  PanelsTopLeft,
  Pipette,
  QrCode,
  RadioTower,
  Scale,
  Waypoints,
  type LucideIcon,
} from "lucide-react";
import { getServerDict } from "@/lib/locale-server";
import { Reveal } from "@/components/reveal";
import { GAMES, TOOLS } from "@/lib/catalog";

export const metadata: Metadata = { title: "Play & Tools" };

const GAME_ICONS: Record<string, LucideIcon> = {
  "rover-run": Bot,
  "arm-reach": Waypoints,
  "signal-catch": RadioTower,
  "stack-tower": Layers3,
  "signal-sequence": BrainCircuit,
  "line-racer": Gauge,
};

const TOOL_ICONS: Record<string, LucideIcon> = {
  "melody-to-tab": Music2,
  "merge-pdf": Files,
  "compress-image": ImageDown,
  "resume-export": FileDown,
  "qr-code": QrCode,
  "color-palette": Pipette,
  "unit-converter": Scale,
};

export default async function PlayHubPage() {
  const { dict } = await getServerDict();

  return (
    <main className="py-16 md:py-24">
      <div className="wrap">
        <Reveal>
          <p className="type-page-kicker" style={{ color: "var(--accent-robotics)" }}>
            {dict.play.eyebrow}
          </p>
          <h1 className="type-page-title mt-4">{dict.play.title}</h1>
          <p className="type-page-lede mt-5" style={{ color: "var(--fg-2)" }}>
            {dict.play.intro}
          </p>
        </Reveal>

        <Reveal delay={0.06} className="mt-16">
          <div className="mb-5 flex items-end justify-between border-b pb-3" style={{ borderColor: "var(--line-strong)" }}>
            <p className="type-page-kicker" style={{ color: "var(--fg-3)" }}>{dict.nav.play}</p>
            <span className="type-index text-sm" style={{ color: "var(--fg-4)" }}>{String(GAMES.length).padStart(2, "0")}</span>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {GAMES.map((game, i) => {
            const Icon = GAME_ICONS[game.slug] ?? Bot;
            return (
              <Reveal key={game.slug} delay={Math.min(0.08 + i * 0.04, 0.2)} className="h-full">
                <Link
                  href={game.href}
                  data-cursor="true"
                  className="surface-interactive group flex h-[200px] flex-col p-5 transition-[transform,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-robotics)]"
                  style={{ borderColor: "var(--line)", background: "var(--bg-raised)" }}
                >
                  <div className="flex items-start justify-between">
                    <span className="flex size-9 items-center justify-center rounded-md border" style={{ borderColor: "var(--line)", color: "var(--accent-robotics)" }}>
                      <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <span className="type-index text-sm" style={{ color: "var(--fg-4)" }}>{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h2 className="type-card-title mt-4 text-xl">{game.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--fg-3)" }}>
                    {game.desc}
                  </p>
                  <span className="type-label mt-auto inline-flex items-center gap-1.5" style={{ color: "var(--accent-robotics)" }}>
                    Play
                    <ArrowUpRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.1} className="mt-16">
          <div className="mb-4 flex items-end justify-between border-b pb-3" style={{ borderColor: "var(--line-strong)" }}>
            <p className="type-page-kicker" style={{ color: "var(--fg-3)" }}>{dict.tools.eyebrow}</p>
            <span className="type-index text-sm" style={{ color: "var(--fg-4)" }}>{String(TOOLS.length + 1).padStart(2, "0")}</span>
          </div>
          <p className="mb-5 max-w-lg text-sm leading-relaxed" style={{ color: "var(--fg-3)" }}>
            {dict.tools.intro}
          </p>
        </Reveal>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {TOOLS.map((tool, i) => {
            const Icon = TOOL_ICONS[tool.slug] ?? PanelsTopLeft;
            return (
              <Reveal key={tool.slug} delay={Math.min(0.14 + i * 0.04, 0.26)} className="h-full">
                <Link
                  href={tool.href}
                  data-cursor="true"
                  className="surface-interactive group flex h-[200px] flex-col p-5 transition-[transform,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-ai)]"
                  style={{ borderColor: "var(--line)", background: "var(--bg-raised)" }}
                >
                  <div className="flex items-start justify-between">
                    <span className="flex size-9 items-center justify-center rounded-md border" style={{ borderColor: "var(--line)", color: "var(--accent-ai)" }}>
                      <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <span className="type-index text-sm" style={{ color: "var(--fg-4)" }}>{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h2 className="type-card-title mt-4 text-xl">{tool.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--fg-3)" }}>
                    {tool.desc}
                  </p>
                  <span className="type-label mt-auto inline-flex items-center gap-1.5" style={{ color: "var(--accent-ai)" }}>
                    Open
                    <ArrowUpRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </Link>
              </Reveal>
            );
          })}

          <Reveal delay={Math.min(0.14 + TOOLS.length * 0.04, 0.3)} className="h-full">
            <Link
              href="/admin/portfolios"
              data-cursor="true"
              className="surface-interactive group flex h-[200px] flex-col p-5 transition-[transform,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-ai)]"
              style={{ borderColor: "var(--line)", background: "var(--bg-raised)" }}
            >
              <div className="flex items-start justify-between">
                <span className="flex size-9 items-center justify-center rounded-md border" style={{ borderColor: "var(--line)", color: "var(--accent-ai)" }}>
                  <PanelsTopLeft size={17} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <span className="type-index text-sm" style={{ color: "var(--fg-4)" }}>{String(TOOLS.length + 1).padStart(2, "0")}</span>
              </div>
              <h2 className="type-card-title mt-4 text-xl">Portfolio Builder</h2>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--fg-3)" }}>
                Assemble a shareable project portfolio page.
              </p>
              <span
                className="type-label mt-auto inline-flex items-center gap-1.5"
                style={{ color: "var(--accent-ai)" }}
              >
                Open (admin login)
                <ArrowUpRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </Link>
          </Reveal>
        </div>
      </div>
    </main>
  );
}
