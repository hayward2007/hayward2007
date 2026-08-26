import { ArmReach } from "@/components/games/arm-reach";

export default function ArmReachPage() {
  return (
    <main className="py-16 md:py-24">
      <div className="wrap">
        <p className="type-page-kicker" style={{ color: "var(--accent-robotics)" }}>
          Play — Arm Reach
        </p>
        <h1 className="type-tool-title mt-4 max-w-4xl">Hit every target before time runs out.</h1>
        <div className="mt-12">
          <ArmReach />
        </div>
      </div>
    </main>
  );
}
