export const GUITAR_STRINGS = [
  { number: 1, label: "e", openMidi: 64 },
  { number: 2, label: "B", openMidi: 59 },
  { number: 3, label: "G", openMidi: 55 },
  { number: 4, label: "D", openMidi: 50 },
  { number: 5, label: "A", openMidi: 45 },
  { number: 6, label: "E", openMidi: 40 },
] as const;

export const TAB_WINDOW_SECONDS = 8;

export type PitchEvent = {
  startTimeSeconds: number;
  durationSeconds: number;
  pitchMidi: number;
  amplitude: number;
};

export type GuitarTabNote = PitchEvent & {
  stringNumber: number;
  stringLabel: string;
  fret: number;
  noteName: string;
};

export type GuitarTabSegment = {
  startTimeSeconds: number;
  durationSeconds: number;
  notes: GuitarTabNote[];
};

type Position = {
  stringNumber: number;
  stringLabel: string;
  fret: number;
};

const MIN_GUITAR_MIDI = 40;
const MAX_GUITAR_MIDI = 88;
const MAX_FRET = 24;
const ONSET_CLUSTER_SECONDS = 0.075;

export function buildGuitarTab(events: PitchEvent[]): GuitarTabNote[] {
  const melody = extractMelody(events);
  if (melody.length === 0) return [];

  const positionLayers = melody.map((note) => positionsForPitch(note.pitchMidi));
  if (positionLayers.some((positions) => positions.length === 0)) return [];

  const costs: number[][] = [];
  const previous: number[][] = [];

  for (let layerIndex = 0; layerIndex < positionLayers.length; layerIndex += 1) {
    const positions = positionLayers[layerIndex];
    costs[layerIndex] = [];
    previous[layerIndex] = [];

    for (let positionIndex = 0; positionIndex < positions.length; positionIndex += 1) {
      const position = positions[positionIndex];
      if (layerIndex === 0) {
        costs[layerIndex][positionIndex] = startingPositionCost(position);
        previous[layerIndex][positionIndex] = -1;
        continue;
      }

      let bestCost = Number.POSITIVE_INFINITY;
      let bestPrevious = 0;
      for (let previousIndex = 0; previousIndex < positionLayers[layerIndex - 1].length; previousIndex += 1) {
        const candidateCost =
          costs[layerIndex - 1][previousIndex] +
          transitionCost(positionLayers[layerIndex - 1][previousIndex], position);
        if (candidateCost < bestCost) {
          bestCost = candidateCost;
          bestPrevious = previousIndex;
        }
      }

      costs[layerIndex][positionIndex] = bestCost;
      previous[layerIndex][positionIndex] = bestPrevious;
    }
  }

  const chosenPositions = new Array<number>(melody.length);
  const finalCosts = costs[costs.length - 1];
  let chosenIndex = finalCosts.indexOf(Math.min(...finalCosts));
  for (let layerIndex = melody.length - 1; layerIndex >= 0; layerIndex -= 1) {
    chosenPositions[layerIndex] = chosenIndex;
    chosenIndex = previous[layerIndex][chosenIndex];
  }

  return melody.map((note, index) => {
    const position = positionLayers[index][chosenPositions[index]];
    return {
      ...note,
      ...position,
      noteName: midiToNoteName(note.pitchMidi),
    };
  });
}

export function createTabSegments(
  notes: GuitarTabNote[],
  windowSeconds = TAB_WINDOW_SECONDS,
): GuitarTabSegment[] {
  if (notes.length === 0) return [];

  const firstWindow = Math.floor(notes[0].startTimeSeconds / windowSeconds) * windowSeconds;
  const lastNote = notes[notes.length - 1];
  const endTime = lastNote.startTimeSeconds + Math.max(lastNote.durationSeconds, 0.05);
  const segments: GuitarTabSegment[] = [];

  for (let start = firstWindow; start < endTime; start += windowSeconds) {
    const segmentNotes = notes.filter(
      (note) => note.startTimeSeconds >= start && note.startTimeSeconds < start + windowSeconds,
    );
    if (segmentNotes.length > 0) {
      segments.push({ startTimeSeconds: start, durationSeconds: windowSeconds, notes: segmentNotes });
    }
  }

  return segments;
}

export function formatTabTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

function extractMelody(events: PitchEvent[]): PitchEvent[] {
  const playable = events
    .filter(
      (event) =>
        Number.isFinite(event.startTimeSeconds) &&
        Number.isFinite(event.durationSeconds) &&
        Number.isFinite(event.pitchMidi) &&
        Number.isFinite(event.amplitude) &&
        event.pitchMidi >= MIN_GUITAR_MIDI &&
        event.pitchMidi <= MAX_GUITAR_MIDI &&
        event.durationSeconds >= 0.055 &&
        event.amplitude >= 0.18,
    )
    .map((event) => ({
      startTimeSeconds: Math.max(0, event.startTimeSeconds),
      durationSeconds: Math.min(6, event.durationSeconds),
      pitchMidi: Math.round(event.pitchMidi),
      amplitude: Math.max(0, Math.min(1, event.amplitude)),
    }))
    .sort((a, b) => a.startTimeSeconds - b.startTimeSeconds || b.pitchMidi - a.pitchMidi);

  if (playable.length === 0) return [];

  const clusters: PitchEvent[][] = [];
  for (const note of playable) {
    const current = clusters[clusters.length - 1];
    if (!current || note.startTimeSeconds - current[0].startTimeSeconds > ONSET_CLUSTER_SECONDS) {
      clusters.push([note]);
    } else {
      const duplicateIndex = current.findIndex((candidate) => candidate.pitchMidi === note.pitchMidi);
      if (duplicateIndex === -1) current.push(note);
      else if (note.amplitude > current[duplicateIndex].amplitude) current[duplicateIndex] = note;
    }
  }

  const costs: number[][] = [];
  const previous: number[][] = [];
  for (let clusterIndex = 0; clusterIndex < clusters.length; clusterIndex += 1) {
    costs[clusterIndex] = [];
    previous[clusterIndex] = [];

    for (let noteIndex = 0; noteIndex < clusters[clusterIndex].length; noteIndex += 1) {
      const note = clusters[clusterIndex][noteIndex];
      const localCost =
        (1 - note.amplitude) * 3.2 +
        (note.durationSeconds < 0.09 ? 0.8 : 0) -
        note.pitchMidi * 0.012;

      if (clusterIndex === 0) {
        costs[clusterIndex][noteIndex] = localCost;
        previous[clusterIndex][noteIndex] = -1;
        continue;
      }

      let bestCost = Number.POSITIVE_INFINITY;
      let bestPrevious = 0;
      for (let previousIndex = 0; previousIndex < clusters[clusterIndex - 1].length; previousIndex += 1) {
        const previousNote = clusters[clusterIndex - 1][previousIndex];
        const interval = Math.abs(note.pitchMidi - previousNote.pitchMidi);
        const leapCost = interval * 0.11 + (interval > 12 ? (interval - 12) * 0.16 : 0);
        const candidateCost = costs[clusterIndex - 1][previousIndex] + localCost + leapCost;
        if (candidateCost < bestCost) {
          bestCost = candidateCost;
          bestPrevious = previousIndex;
        }
      }
      costs[clusterIndex][noteIndex] = bestCost;
      previous[clusterIndex][noteIndex] = bestPrevious;
    }
  }

  const chosen = new Array<number>(clusters.length);
  const finalCosts = costs[costs.length - 1];
  let chosenIndex = finalCosts.indexOf(Math.min(...finalCosts));
  for (let clusterIndex = clusters.length - 1; clusterIndex >= 0; clusterIndex -= 1) {
    chosen[clusterIndex] = chosenIndex;
    chosenIndex = previous[clusterIndex][chosenIndex];
  }

  const melody: PitchEvent[] = [];
  clusters.forEach((cluster, index) => {
    const note = cluster[chosen[index]];
    const previousNote = melody[melody.length - 1];
    if (
      previousNote &&
      previousNote.pitchMidi === note.pitchMidi &&
      note.startTimeSeconds <= previousNote.startTimeSeconds + previousNote.durationSeconds + 0.12
    ) {
      previousNote.durationSeconds = Math.max(
        previousNote.durationSeconds,
        note.startTimeSeconds + note.durationSeconds - previousNote.startTimeSeconds,
      );
      previousNote.amplitude = Math.max(previousNote.amplitude, note.amplitude);
    } else {
      melody.push({ ...note });
    }
  });

  return melody.slice(0, 900);
}

function positionsForPitch(midi: number): Position[] {
  return GUITAR_STRINGS.flatMap((string) => {
    const fret = midi - string.openMidi;
    if (fret < 0 || fret > MAX_FRET) return [];
    return [{ stringNumber: string.number, stringLabel: string.label, fret }];
  });
}

function startingPositionCost(position: Position) {
  return position.fret * 0.06 + (position.fret > 12 ? (position.fret - 12) * 0.12 : 0);
}

function transitionCost(previous: Position, next: Position) {
  const fretDistance = Math.abs(previous.fret - next.fret);
  const stringDistance = Math.abs(previous.stringNumber - next.stringNumber);
  const largeShift = fretDistance > 5 ? (fretDistance - 5) * 0.45 : 0;
  const openStringShift = next.fret === 0 && previous.fret > 4 ? 0.9 : 0;
  return fretDistance * 0.68 + stringDistance * 0.38 + largeShift + openStringShift;
}

function midiToNoteName(midi: number) {
  const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  return `${names[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`;
}
