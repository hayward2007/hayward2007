import { RoverRun } from "@/components/games/rover-run";

export default function RoverRunPage() {
  return (
    <main className="py-20">
      <div className="wrap">
        <p className="font-mono text-xs uppercase tracking-[0.14em]" style={{ color: "var(--accent-robotics)" }}>
          Play — Rover Run
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Keep the rover moving.</h1>
        <div className="mt-10">
          <RoverRun />
        </div>
      </div>
    </main>
  );
}
