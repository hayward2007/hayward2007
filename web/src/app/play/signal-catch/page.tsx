import { SignalCatch } from "@/components/games/signal-catch";

export default function SignalCatchPage() {
  return (
    <main className="py-16 md:py-24">
      <div className="wrap">
        <p className="type-page-kicker" style={{ color: "var(--accent-ai)" }}>
          Play — Signal Catch
        </p>
        <h1 className="type-tool-title mt-4 max-w-4xl">Don&apos;t let a packet hit the ground.</h1>
        <div className="mt-12">
          <SignalCatch />
        </div>
      </div>
    </main>
  );
}
