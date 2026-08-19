import { SignalSequence } from "@/components/games/signal-sequence";

export default function SignalSequencePage() {
  return (
    <main className="py-20">
      <div className="wrap">
        <p className="font-mono text-xs uppercase tracking-[0.14em]" style={{ color: "var(--accent-signal)" }}>
          Play — Signal Sequence
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Watch it. Repeat it. Don&apos;t break it.</h1>
        <div className="mt-10">
          <SignalSequence />
        </div>
      </div>
    </main>
  );
}
