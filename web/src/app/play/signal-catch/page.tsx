import { SignalCatch } from "@/components/games/signal-catch";

export default function SignalCatchPage() {
  return (
    <main className="py-20">
      <div className="wrap">
        <p className="font-mono text-xs uppercase tracking-[0.14em]" style={{ color: "var(--accent-ai)" }}>
          Play — Signal Catch
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Don&apos;t let a packet hit the ground.</h1>
        <div className="mt-10">
          <SignalCatch />
        </div>
      </div>
    </main>
  );
}
