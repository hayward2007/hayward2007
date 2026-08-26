import { StackTower } from "@/components/games/stack-tower";

export default function StackTowerPage() {
  return (
    <main className="py-16 md:py-24">
      <div className="wrap">
        <p className="type-page-kicker" style={{ color: "var(--accent-signal)" }}>
          Play — Stack Tower
        </p>
        <h1 className="type-tool-title mt-4 max-w-4xl">How high can you stack it?</h1>
        <div className="mt-12">
          <StackTower />
        </div>
      </div>
    </main>
  );
}
