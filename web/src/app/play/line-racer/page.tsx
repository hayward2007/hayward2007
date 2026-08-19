import { LineRacer } from "@/components/games/line-racer";

export default function LineRacerPage() {
  return (
    <main className="py-20">
      <div className="wrap">
        <p className="font-mono text-xs uppercase tracking-[0.14em]" style={{ color: "var(--accent-robotics)" }}>
          Play — Line Racer
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Stay on the track. It only gets faster.</h1>
        <div className="mt-10">
          <LineRacer />
        </div>
      </div>
    </main>
  );
}
