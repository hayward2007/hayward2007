import { StackTower } from "@/components/games/stack-tower";

export default function StackTowerPage() {
  return (
    <main className="py-20">
      <div className="wrap">
        <p className="font-mono text-xs uppercase tracking-[0.14em]" style={{ color: "var(--accent-signal)" }}>
          Play — Stack Tower
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">How high can you stack it?</h1>
        <div className="mt-10">
          <StackTower />
        </div>
      </div>
    </main>
  );
}
