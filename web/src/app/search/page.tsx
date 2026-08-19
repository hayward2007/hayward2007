import { getSearchIndex } from "@/lib/data";
import { SearchClient } from "@/components/search-client";
import { Reveal } from "@/components/reveal";

export const dynamic = "force-dynamic";

export default async function SearchPage() {
  const index = await getSearchIndex();

  return (
    <main className="py-20">
      <div className="wrap max-w-2xl">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.14em]" style={{ color: "var(--accent-robotics)" }}>
            Search
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Find anything on the site.</h1>
        </Reveal>
        <Reveal delay={0.05} className="mt-10">
          <SearchClient index={index} />
        </Reveal>
      </div>
    </main>
  );
}
