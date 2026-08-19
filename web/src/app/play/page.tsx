import Link from "next/link";
import { getServerDict } from "@/lib/locale-server";
import { Reveal } from "@/components/reveal";
import { GAMES, TOOLS } from "@/lib/catalog";

export default async function PlayHubPage() {
  const { dict } = await getServerDict();

  return (
    <main className="py-20">
      <div className="wrap">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.14em]" style={{ color: "var(--accent-robotics)" }}>
            {dict.play.eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{dict.play.title}</h1>
          <p className="mt-3 max-w-lg text-[15px] leading-relaxed" style={{ color: "var(--fg-2)" }}>
            {dict.play.intro}
          </p>
        </Reveal>

        <Reveal delay={0.06} className="mt-14">
          <p className="mb-5 font-mono text-xs uppercase tracking-[0.1em]" style={{ color: "var(--fg-3)" }}>
            {dict.nav.play}
          </p>
        </Reveal>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {GAMES.map((game, i) => (
            <Reveal key={game.slug} delay={Math.min(0.08 + i * 0.04, 0.2)}>
              <div className="rounded-2xl border p-6" style={{ borderColor: "var(--line)" }}>
                <h2 className="text-lg font-medium">{game.title}</h2>
                <p className="mt-2 text-sm" style={{ color: "var(--fg-3)" }}>
                  {game.desc}
                </p>
                <Link
                  href={game.href}
                  data-cursor="true"
                  className="mt-4 inline-block text-sm font-medium"
                  style={{ color: "var(--accent-robotics)" }}
                >
                  Play →
                </Link>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1} className="mt-16">
          <p className="mb-5 font-mono text-xs uppercase tracking-[0.1em]" style={{ color: "var(--fg-3)" }}>
            {dict.tools.eyebrow}
          </p>
          <p className="mb-5 max-w-lg text-sm" style={{ color: "var(--fg-3)" }}>
            {dict.tools.intro}
          </p>
        </Reveal>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {TOOLS.map((tool, i) => (
            <Reveal key={tool.slug} delay={Math.min(0.14 + i * 0.04, 0.26)}>
              <div className="rounded-2xl border p-6" style={{ borderColor: "var(--line)" }}>
                <h2 className="text-lg font-medium">{tool.title}</h2>
                <p className="mt-2 text-sm" style={{ color: "var(--fg-3)" }}>
                  {tool.desc}
                </p>
                <Link
                  href={tool.href}
                  data-cursor="true"
                  className="mt-4 inline-block text-sm font-medium"
                  style={{ color: "var(--accent-ai)" }}
                >
                  Open →
                </Link>
              </div>
            </Reveal>
          ))}

          <Reveal delay={Math.min(0.14 + TOOLS.length * 0.04, 0.3)}>
            <div className="rounded-2xl border p-6" style={{ borderColor: "var(--line)" }}>
              <h2 className="text-lg font-medium">Portfolio Builder</h2>
              <p className="mt-2 text-sm" style={{ color: "var(--fg-3)" }}>
                Assemble a shareable project portfolio page.
              </p>
              <Link
                href="/admin/portfolios"
                data-cursor="true"
                className="mt-4 inline-block text-sm font-medium"
                style={{ color: "var(--accent-ai)" }}
              >
                Open (admin login) →
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </main>
  );
}
