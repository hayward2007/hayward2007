import type { Metadata } from "next";
import { MelodyToTabTool } from "@/components/tools/melody-to-tab-tool";

export const metadata: Metadata = {
  title: "Melody to Guitar Tab",
  description: "Turn a YouTube or audio melody into standard-tuning guitar tablature.",
};

export default function MelodyToTabPage() {
  return (
    <main className="py-16 md:py-24">
      <div className="wrap">
        <header className="max-w-3xl">
          <p className="type-page-kicker" style={{ color: "var(--accent-ai)" }}>
            Tools / Audio transcription
          </p>
          <h1 className="type-tool-title mt-4">Melody to Guitar Tab</h1>
          <p className="type-page-lede mt-4" style={{ color: "var(--fg-2)" }}>
            Audio to playable, standard-tuning tablature.
          </p>
        </header>
        <div className="mt-10 md:mt-12">
          <MelodyToTabTool />
        </div>
      </div>
    </main>
  );
}
