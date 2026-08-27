import type { GuitarTabNote, GuitarTabSegment } from "@/lib/guitar-tab";

const NOTE_LETTERS = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];

// VexFlow scientific-pitch key string, e.g. midi 64 -> "e/4".
export function midiToVexKey(midi: number): string {
  const letter = NOTE_LETTERS[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${letter}/${octave}`;
}

export type NotationDuration = "w" | "h" | "q" | "8" | "16";

export type NotationEvent =
  | { type: "note"; keys: string[]; duration: NotationDuration; dotted: boolean; noteName: string; startTimeSeconds: number }
  | { type: "rest"; duration: NotationDuration; dotted: boolean };

export type NotationMeasure = { events: NotationEvent[] };

const BEATS_PER_MEASURE = 4;
const MIN_QUANTIZE_BEATS = 0.2;

// Standard note values in quarter-note "beats", longest first — each raw
// duration snaps to the closest rung. This is a simplification (no ties
// across values, no triplets), appropriate for an auto-transcribed melody
// rather than hand-engraved notation.
const DURATION_LADDER: { beats: number; duration: NotationDuration; dotted: boolean }[] = [
  { beats: 4, duration: "w", dotted: false },
  { beats: 3, duration: "h", dotted: true },
  { beats: 2, duration: "h", dotted: false },
  { beats: 1.5, duration: "q", dotted: true },
  { beats: 1, duration: "q", dotted: false },
  { beats: 0.75, duration: "8", dotted: true },
  { beats: 0.5, duration: "8", dotted: false },
  { beats: 0.25, duration: "16", dotted: false },
];

function quantizeBeats(beats: number) {
  let best = DURATION_LADDER[DURATION_LADDER.length - 1];
  let bestDiff = Number.POSITIVE_INFINITY;
  for (const candidate of DURATION_LADDER) {
    const diff = Math.abs(candidate.beats - beats);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = candidate;
    }
  }
  return best;
}

// Treats the median gap between consecutive note onsets as one beat — a
// simple stand-in for real tempo/beat detection, clamped to a musically
// plausible range (roughly 50-240 BPM).
export function estimateSecondsPerBeat(notes: GuitarTabNote[]): number {
  if (notes.length < 2) return 0.5;

  const intervals: number[] = [];
  for (let i = 1; i < notes.length; i += 1) {
    const gap = notes[i].startTimeSeconds - notes[i - 1].startTimeSeconds;
    if (gap > 0.08 && gap < 2) intervals.push(gap);
  }
  if (intervals.length === 0) return 0.5;

  intervals.sort((a, b) => a - b);
  const median = intervals[Math.floor(intervals.length / 2)];
  return Math.min(1.2, Math.max(0.25, median));
}

export function buildSheetMusicMeasures(segment: GuitarTabSegment, secondsPerBeat: number): NotationMeasure[] {
  const measures: NotationMeasure[] = [];
  let currentMeasure: NotationEvent[] = [];
  let beatsInMeasure = 0;
  let cursorSeconds = segment.startTimeSeconds;

  function pushEvent(event: NotationEvent, beats: number) {
    currentMeasure.push(event);
    beatsInMeasure += beats;
    if (beatsInMeasure >= BEATS_PER_MEASURE - 0.001) {
      measures.push({ events: currentMeasure });
      currentMeasure = [];
      beatsInMeasure = 0;
    }
  }

  function fillRestTo(targetSeconds: number) {
    let remainingBeats = (targetSeconds - cursorSeconds) / secondsPerBeat;
    while (remainingBeats > MIN_QUANTIZE_BEATS) {
      const spaceLeft = BEATS_PER_MEASURE - beatsInMeasure;
      const candidate = quantizeBeats(Math.min(remainingBeats, spaceLeft));
      pushEvent({ type: "rest", duration: candidate.duration, dotted: candidate.dotted }, candidate.beats);
      remainingBeats -= candidate.beats;
      cursorSeconds += candidate.beats * secondsPerBeat;
    }
  }

  const orderedNotes = [...segment.notes].sort((a, b) => a.startTimeSeconds - b.startTimeSeconds);
  for (const note of orderedNotes) {
    if (note.startTimeSeconds > cursorSeconds + MIN_QUANTIZE_BEATS * secondsPerBeat) {
      fillRestTo(note.startTimeSeconds);
    }
    cursorSeconds = Math.max(cursorSeconds, note.startTimeSeconds);

    const noteBeats = note.durationSeconds / secondsPerBeat;
    const spaceLeft = BEATS_PER_MEASURE - beatsInMeasure;
    if (noteBeats > spaceLeft + 0.001) {
      // Doesn't fit the rest of this measure — pad with a rest and start the
      // note fresh next measure, rather than splitting/tying it.
      fillRestTo(cursorSeconds + spaceLeft * secondsPerBeat);
    }

    const candidate = quantizeBeats(Math.min(noteBeats, BEATS_PER_MEASURE));
    pushEvent(
      {
        type: "note",
        keys: [midiToVexKey(note.pitchMidi)],
        duration: candidate.duration,
        dotted: candidate.dotted,
        noteName: note.noteName,
        startTimeSeconds: note.startTimeSeconds,
      },
      candidate.beats,
    );
    cursorSeconds += candidate.beats * secondsPerBeat;
  }

  if (beatsInMeasure > 0.001) {
    fillRestTo(cursorSeconds + (BEATS_PER_MEASURE - beatsInMeasure) * secondsPerBeat);
  }
  if (currentMeasure.length > 0) {
    measures.push({ events: currentMeasure });
  }

  return measures;
}
