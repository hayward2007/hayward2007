import { LineRacer } from "@/components/games/line-racer";

export default function LineRacerPage() {
  return (
    <main className="py-16 md:py-24">
      <div className="wrap">
        <p className="type-page-kicker" style={{ color: "var(--accent-robotics)" }}>
          Play — Line Racer
        </p>
        <h1 className="type-tool-title mt-4 max-w-4xl">Stay on the track. It only gets faster.</h1>
        <div className="mt-12">
          <LineRacer />
        </div>
      </div>
    </main>
  );
}
