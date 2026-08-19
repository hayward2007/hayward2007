import { getCompetitions, getPublicActivities } from "@/lib/data";
import { getServerDict } from "@/lib/locale-server";
import { CompetitionsExplorer } from "@/components/competitions-explorer";
import { ActivitiesExplorer } from "@/components/activities-explorer";
import { Reveal } from "@/components/reveal";

export const dynamic = "force-dynamic";

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
    <main className="py-20 md:py-28">
      <div className="wrap mb-10">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.14em]" style={{ color: "var(--accent-signal)" }}>
            {dict.awards.eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            {featured.length} {dict.awards.placed}
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--fg-3)" }}>
            {dict.awards.of} {competitions.length} {dict.awards.enteredNationwide}
          </p>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed" style={{ color: "var(--fg-2)" }}>
            {dict.awards.intro}
          </p>
        </Reveal>
      </div>

      <Reveal>
        <div className="wrap mb-14 flex flex-wrap gap-8 border-y py-6" style={{ borderColor: "var(--line)" }}>
          {Object.entries(breakdown).map(([rank, count]) => (
            <div key={rank}>
              <p className="text-2xl font-semibold tabular-nums">{count}</p>
              <p className="text-sm" style={{ color: "var(--fg-3)" }}>
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
          <p className="font-mono text-xs uppercase tracking-[0.14em]" style={{ color: "var(--accent-ai)" }}>
            {dict.activities.eyebrow}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">{dict.activities.title}</h2>
          <p className="mt-3 max-w-lg text-[15px] leading-relaxed" style={{ color: "var(--fg-2)" }}>
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
