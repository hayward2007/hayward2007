"use client";

import { useEffect, useRef } from "react";
import type { NotationMeasure } from "@/lib/sheet-music";

const MEASURE_WIDTH = 168;
const STAVE_TOP = 6;
const STAVE_HEIGHT = 110;
const FIRST_MEASURE_EXTRA_WIDTH = 46; // room for clef + time signature

export function SheetMusicStaff({ measures }: { measures: NotationMeasure[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || measures.length === 0) return;
    let cancelled = false;

    import("vexflow").then(({ Renderer, Stave, StaveNote, Voice, Formatter, Accidental }) => {
      if (cancelled || !container) return;
      container.innerHTML = "";

      const width = measures.reduce(
        (sum, _measure, index) => sum + MEASURE_WIDTH + (index === 0 ? FIRST_MEASURE_EXTRA_WIDTH : 0),
        8,
      );
      const renderer = new Renderer(container, Renderer.Backends.SVG);
      renderer.resize(width, STAVE_HEIGHT);
      const context = renderer.getContext();
      // VexFlow paints in solid black by default, which disappears against
      // this site's dark theme — repaint with the page's own foreground
      // token instead. SVG presentation attributes resolve CSS var()
      // against the document, so this stays correct across the theme
      // toggle without re-rendering.
      context.setFillStyle("var(--fg)");
      context.setStrokeStyle("var(--fg)");

      let x = 4;
      measures.forEach((measure, index) => {
        const measureWidth = MEASURE_WIDTH + (index === 0 ? FIRST_MEASURE_EXTRA_WIDTH : 0);
        const stave = new Stave(x, STAVE_TOP, measureWidth);
        if (index === 0) stave.addClef("treble").addTimeSignature("4/4");
        stave.setContext(context).draw();

        const staveNotes = measure.events.map((event) => {
          if (event.type === "rest") {
            return new StaveNote({ keys: ["b/4"], duration: `${event.duration}r`, dots: event.dotted ? 1 : 0 });
          }
          const note = new StaveNote({ keys: event.keys, duration: event.duration, dots: event.dotted ? 1 : 0 });
          event.keys.forEach((key, keyIndex) => {
            if (key.includes("#")) note.addModifier(new Accidental("#"), keyIndex);
          });
          return note;
        });

        const voice = new Voice({ numBeats: 4, beatValue: 4 });
        voice.setStrict(false);
        voice.addTickables(staveNotes);
        new Formatter().joinVoices([voice]).format([voice], measureWidth - 20);
        voice.draw(context, stave);

        x += measureWidth;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [measures]);

  return <div ref={containerRef} className="min-w-max" />;
}
