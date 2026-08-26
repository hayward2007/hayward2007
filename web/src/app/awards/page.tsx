import type { Metadata } from "next";
import { getCompetitions, getPublicActivities } from "@/lib/data";
import { getServerDict } from "@/lib/locale-server";
import { CompetitionsExplorer } from "@/components/competitions-explorer";
import { ActivitiesExplorer } from "@/components/activities-explorer";
import { Reveal } from "@/components/reveal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Awards & Activities" };

const RANK_LABELS: Record<string, string> = {
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
  encouragement: "Encouragement",
  special: "Award",
};

export default async function AwardsPage() {
  const [competitions, activities, { dict }] = await Promise.all([
    getCompetitions(),
    getPublicActivities(),
    getServerDict(),
  ]);
  const featured = competitions.filter((c) => c.isAward);

  const breakdown = featured.reduce<Record<string, number>>((acc, c) => {
    acc[c.rank] = (acc[c.rank] || 0) + 1;
    return acc;
  }, {});

  return (
    <main className="py-16 md:py-24">
      <div className="wrap mb-10">
        <Reveal>
          <p className="type-page-kicker" style={{ color: "var(--accent-signal)" }}>
            {dict.awards.eyebrow}
          </p>
          <h1 className="type-page-title mt-4 max-w-5xl">
            {featured.length} {dict.awards.placed}
          </h1>
          <p className="type-label mt-4" style={{ color: "var(--fg-3)" }}>
            {dict.awards.of} {competitions.length} {dict.awards.enteredNationwide}
          </p>
          <p className="type-page-lede mt-5" style={{ color: "var(--fg-2)" }}>
            {dict.awards.intro}
          </p>
        </Reveal>
      </div>

      <Reveal>
        <div className="wrap mb-14 flex flex-wrap gap-x-12 gap-y-6 border-y py-6" style={{ borderColor: "var(--line-strong)" }}>
          {Object.entries(breakdown).map(([rank, count]) => (
            <div key={rank}>
              <p className="type-stat">{count}</p>
              <p className="type-label mt-2" style={{ color: "var(--fg-3)" }}>
                {RANK_LABELS[rank] || rank}
              </p>
            </div>
          ))}
        </div>
      </Reveal>

      <div className="wrap">
        <CompetitionsExplorer
          competitions={competitions}
          placedOnlyLabel={dict.awards.placedOnly}
          viewAllLabel={dict.awards.viewAll}
          closeLabel={dict.common.close}
          emptyLabel={dict.common.noSummaryYet}
        />
      </div>

      <div className="wrap mt-20 border-t pt-16" style={{ borderColor: "var(--line)" }}>
        <Reveal>
          <p className="type-page-kicker" style={{ color: "var(--accent-ai)" }}>
            {dict.activities.eyebrow}
          </p>
          <h2 className="type-section-title mt-4">{dict.activities.title}</h2>
          <p className="type-page-lede mt-4" style={{ color: "var(--fg-2)" }}>
            {dict.activities.intro}
          </p>
        </Reveal>
        <div className="mt-10">
          <ActivitiesExplorer
            activities={activities}
            allLabel={dict.activities.all}
            closeLabel={dict.common.close}
            emptyLabel={dict.common.noSummaryYet}
          />
        </div>
      </div>
    </main>
  );
}
