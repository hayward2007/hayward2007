import type { Metadata } from "next";
import { getSearchIndex } from "@/lib/data";
import { SearchClient } from "@/components/search-client";
import { Reveal } from "@/components/reveal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

export default async function SearchPage() {
  const index = await getSearchIndex();

  return (
    <main className="py-16 md:py-24">
      <div className="wrap max-w-3xl">
        <Reveal>
          <p className="type-page-kicker" style={{ color: "var(--accent-robotics)" }}>
            Search
          </p>
          <h1 className="type-page-title mt-4">Find anything on the site.</h1>
        </Reveal>
        <Reveal delay={0.05} className="mt-10">
          <SearchClient index={index} />
        </Reveal>
      </div>
    </main>
  );
}
