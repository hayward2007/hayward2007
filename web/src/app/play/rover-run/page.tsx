import { RoverRun } from "@/components/games/rover-run";

export default function RoverRunPage() {
  return (
    <main className="py-16 md:py-24">
      <div className="wrap">
        <p className="type-page-kicker" style={{ color: "var(--accent-robotics)" }}>
          Play — Rover Run
        </p>
        <h1 className="type-tool-title mt-4 max-w-4xl">Keep the rover moving.</h1>
        <div className="mt-12">
          <RoverRun />
        </div>
      </div>
    </main>
  );
}
