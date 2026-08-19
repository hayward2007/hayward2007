import { ArmReach } from "@/components/games/arm-reach";

export default function ArmReachPage() {
  return (
    <main className="py-20">
      <div className="wrap">
        <p className="font-mono text-xs uppercase tracking-[0.14em]" style={{ color: "var(--accent-robotics)" }}>
          Play — Arm Reach
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Hit every target before time runs out.</h1>
        <div className="mt-10">
          <ArmReach />
        </div>
      </div>
    </main>
  );
}
