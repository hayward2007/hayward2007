import type { Metadata } from "next";
import { getCompetitions, getPublicActivities } from "@/lib/data";
import { getServerDict } from "@/lib/locale-server";
import { getCompetitionRankLabel } from "@/lib/competition-ranks";
import { CompetitionsExplorer } from "@/components/competitions-explorer";
import { ActivitiesExplorer } from "@/components/activities-explorer";
import { Reveal } from "@/components/reveal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Awards & Activities" };

export default async function AwardsPage() {
  const [competitions, activities, { dict, locale }] = await Promise.all([
    getCompetitions(),
    getPublicActivities(),
    getServerDict(),
  ]);
  const localizedCompetitions = competitions.map((competition) => ({
    ...competition,
    rankLabel: getCompetitionRankLabel(competition.rank, competition.rankLabel, locale),
  }));
  const featured = localizedCompetitions.filter((c) => c.isAward);

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
            {locale === "ko" ? `${featured.length}회 수상` : `${featured.length} awards`}
          </h1>
          <p className="type-label mt-4" style={{ color: "var(--fg-3)" }}>
            {locale === "ko"
              ? `총 ${competitions.length}개 대회 참가`
              : `${competitions.length} competitions entered`}
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
                {getCompetitionRankLabel(rank, rank, locale)}
              </p>
            </div>
          ))}
        </div>
      </Reveal>

      <div className="wrap">
        <CompetitionsExplorer
          competitions={localizedCompetitions}
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
