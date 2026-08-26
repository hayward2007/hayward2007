import { SignalSequence } from "@/components/games/signal-sequence";

export default function SignalSequencePage() {
  return (
    <main className="py-16 md:py-24">
      <div className="wrap">
        <p className="type-page-kicker" style={{ color: "var(--accent-signal)" }}>
          Play — Signal Sequence
        </p>
        <h1 className="type-tool-title mt-4 max-w-4xl">Watch it. Repeat it. Don&apos;t break it.</h1>
        <div className="mt-12">
          <SignalSequence />
        </div>
      </div>
    </main>
  );
}
