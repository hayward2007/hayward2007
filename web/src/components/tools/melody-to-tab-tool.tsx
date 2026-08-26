"use client";

import { useRef, useState } from "react";
import {
  AudioLines,
  Clock3,
  ExternalLink,
  FileDown,
  Guitar,
  Link2,
  LoaderCircle,
  Music2,
  Upload,
  Video,
  WandSparkles,
  X,
} from "lucide-react";
import {
  GUITAR_STRINGS,
  buildGuitarTab,
  createTabSegments,
  formatTabTime,
  type GuitarTabSegment,
  type GuitarTabNote,
} from "@/lib/guitar-tab";
import { downloadGuitarTabPdf } from "@/lib/guitar-tab-pdf";

type SourceMode = "youtube" | "file";
type Stage = "idle" | "fetching" | "decoding" | "model" | "transcribing" | "formatting" | "done";

type AnalysisResult = {
  title: string;
  author: string;
  source: string;
  sourceOffsetSeconds: number;
  analyzedDurationSeconds: number;
  sourceDurationSeconds: number;
  notes: GuitarTabNote[];
  segments: GuitarTabSegment[];
  fileStem: string;
};

const CLIP_OPTIONS = [30, 60, 90] as const;
const MAX_UPLOAD_BYTES = 24 * 1024 * 1024;
const BASIC_PITCH_MODEL = "/api/tools/basic-pitch-model/model.json";
const MIN_GUITAR_FREQUENCY = 82.41;
const MAX_GUITAR_FREQUENCY = 1_318.51;

const STAGE_LABELS: Record<Stage, string> = {
  idle: "Ready",
  fetching: "Loading audio",
  decoding: "Preparing excerpt",
  model: "Loading pitch model",
  transcribing: "Listening for melody",
  formatting: "Arranging guitar positions",
  done: "Tab ready",
};

export function MelodyToTabTool() {
  const [mode, setMode] = useState<SourceMode>("youtube");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [startAt, setStartAt] = useState("0");
  const [clipLength, setClipLength] = useState<(typeof CLIP_OPTIONS)[number]>(30);
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [pdfWorking, setPdfWorking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const working = stage !== "idle" && stage !== "done";

  function changeMode(nextMode: SourceMode) {
    if (working) return;
    setMode(nextMode);
    setError("");
    setResult(null);
    setStage("idle");
    setProgress(0);
  }

  function pickFile(event: React.ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] || null;
    setError("");
    setResult(null);
    if (nextFile && nextFile.size > MAX_UPLOAD_BYTES) {
      setFile(null);
      setError("Choose an audio file smaller than 24 MB.");
      return;
    }
    setFile(nextFile);
  }

  async function analyze() {
    setError("");
    setResult(null);
    const requestedStart = Math.max(0, Number(startAt) || 0);

    if (mode === "youtube" && !youtubeUrl.trim()) {
      setError("Paste a YouTube URL first.");
      return;
    }
    if (mode === "file" && !file) {
      setError("Choose an audio file first.");
      return;
    }

    try {
      setStage("fetching");
      setProgress(6);

      let audioBytes: ArrayBuffer;
      let title = file?.name.replace(/\.[^.]+$/, "") || "YouTube melody";
      let author = "";
      let source = file?.name || "Local audio";
      let sourceDuration = 0;
      let fileStem = title;

      if (mode === "youtube") {
        const response = await fetch("/api/tools/youtube-audio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: youtubeUrl.trim() }),
        });
        if (!response.ok) throw new Error(await responseError(response));

        title = decodeHeader(response.headers.get("x-melody-title"), "YouTube melody");
        author = decodeHeader(response.headers.get("x-melody-author"), "");
        sourceDuration = Number(response.headers.get("x-melody-duration")) || 0;
        const videoId = response.headers.get("x-melody-video-id") || "youtube";
        source = `https://www.youtube.com/watch?v=${videoId}`;
        fileStem = `${title}-${videoId}`;
        audioBytes = await response.arrayBuffer();
      } else {
        if (!file) throw new Error("missing_file");
        audioBytes = await file.arrayBuffer();
      }

      setStage("decoding");
      setProgress(18);
      const clip = await decodeAudioClip(audioBytes, requestedStart, clipLength);
      sourceDuration ||= clip.sourceDurationSeconds;

      setStage("model");
      setProgress(25);
      const pitch = await import("@spotify/basic-pitch");
      const frames: number[][] = [];
      const onsets: number[][] = [];
      const basicPitch = new pitch.BasicPitch(BASIC_PITCH_MODEL);

      setStage("transcribing");
      try {
        await basicPitch.evaluateModel(
          clip.buffer,
          (frameBatch, onsetBatch) => {
            frames.push(...frameBatch);
            onsets.push(...onsetBatch);
          },
          (modelProgress) => setProgress(28 + Math.round(modelProgress * 64)),
        );
      } finally {
        void basicPitch.model.then((model) => model.dispose()).catch(() => undefined);
      }

      setStage("formatting");
      setProgress(95);
      const detectedNotes = pitch.noteFramesToTime(
        pitch.outputToNotesPoly(
          frames,
          onsets,
          0.45,
          0.28,
          6,
          true,
          MAX_GUITAR_FREQUENCY,
          MIN_GUITAR_FREQUENCY,
          true,
          11,
        ),
      );
      const notes = buildGuitarTab(detectedNotes);
      if (notes.length === 0) throw new Error("no_melody");

      setResult({
        title,
        author,
        source,
        sourceOffsetSeconds: clip.sourceOffsetSeconds,
        analyzedDurationSeconds: clip.durationSeconds,
        sourceDurationSeconds: sourceDuration,
        notes,
        segments: createTabSegments(notes),
        fileStem,
      });
      setProgress(100);
      setStage("done");
    } catch (caught) {
      setStage("idle");
      setProgress(0);
      setError(errorMessage(caught));
    }
  }

  async function exportPdf() {
    if (!result) return;
    setPdfWorking(true);
    setError("");
    try {
      await downloadGuitarTabPdf({
        title: result.title,
        source: result.source,
        sourceOffsetSeconds: result.sourceOffsetSeconds,
        notes: result.notes,
        fileStem: result.fileStem,
      });
    } catch {
      setError("The PDF could not be created. Please try again.");
    } finally {
      setPdfWorking(false);
    }
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-12">
      <section
        className="rounded-lg border p-5 lg:sticky lg:top-24"
        style={{ borderColor: "var(--line)", background: "var(--bg-raised)" }}
        aria-label="Audio source and analysis settings"
      >
        <div className="grid grid-cols-2 rounded-lg border p-1" style={{ borderColor: "var(--line)" }}>
          <button
            type="button"
            onClick={() => changeMode("youtube")}
            disabled={working}
            aria-pressed={mode === "youtube"}
            className="type-nav flex h-9 items-center justify-center gap-2 rounded-md text-xs transition-colors"
            style={mode === "youtube" ? { background: "var(--fg)", color: "var(--bg)" } : { color: "var(--fg-3)" }}
          >
            <Video aria-hidden="true" className="size-4" />
            YouTube
          </button>
          <button
            type="button"
            onClick={() => changeMode("file")}
            disabled={working}
            aria-pressed={mode === "file"}
            className="type-nav flex h-9 items-center justify-center gap-2 rounded-md text-xs transition-colors"
            style={mode === "file" ? { background: "var(--fg)", color: "var(--bg)" } : { color: "var(--fg-3)" }}
          >
            <AudioLines aria-hidden="true" className="size-4" />
            Audio file
          </button>
        </div>

        <div className="mt-6">
          {mode === "youtube" ? (
            <label className="block">
              <span className="type-label">YouTube URL</span>
              <span className="relative mt-2 block">
                <Link2 aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2" style={{ color: "var(--fg-3)" }} />
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(event) => setYoutubeUrl(event.target.value)}
                  placeholder="https://youtu.be/..."
                  disabled={working}
                  className="h-11 w-full rounded-lg border bg-transparent pl-10 pr-3 text-sm"
                  style={{ borderColor: "var(--line-strong)" }}
                />
              </span>
            </label>
          ) : (
            <div>
              <span className="type-label">Audio file</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.m4a,.wav,.ogg,.flac,.webm"
                onChange={pickFile}
                className="hidden"
              />
              {file ? (
                <div className="mt-2 flex h-12 items-center gap-3 rounded-lg border px-3" style={{ borderColor: "var(--line-strong)" }}>
                  <Music2 aria-hidden="true" className="size-4 shrink-0" style={{ color: "var(--accent-ai)" }} />
                  <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    disabled={working}
                    className="grid size-8 shrink-0 place-items-center"
                    title="Remove audio file"
                    aria-label="Remove audio file"
                  >
                    <X aria-hidden="true" className="size-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={working}
                  className="font-display mt-2 flex h-20 w-full items-center justify-center gap-2 rounded-lg border border-dashed text-sm font-semibold"
                  style={{ borderColor: "var(--line-strong)" }}
                >
                  <Upload aria-hidden="true" className="size-4" />
                  Choose audio
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-[96px_minmax(0,1fr)] gap-4">
          <label>
            <span className="type-label flex items-center gap-1.5">
              <Clock3 aria-hidden="true" className="size-3.5" />
              Start
            </span>
            <div className="relative mt-2">
              <input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={startAt}
                onChange={(event) => setStartAt(event.target.value)}
                disabled={working}
                className="h-10 w-full rounded-lg border bg-transparent px-3 pr-7 text-sm"
                style={{ borderColor: "var(--line-strong)" }}
              />
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: "var(--fg-3)" }}>
                s
              </span>
            </div>
          </label>

          <div>
            <span className="type-label">Length</span>
            <div className="mt-2 grid grid-cols-3 rounded-lg border p-1" style={{ borderColor: "var(--line-strong)" }}>
              {CLIP_OPTIONS.map((seconds) => (
                <button
                  key={seconds}
                  type="button"
                  onClick={() => setClipLength(seconds)}
                  disabled={working}
                  aria-pressed={clipLength === seconds}
                  className="type-nav h-8 rounded-md text-xs"
                  style={clipLength === seconds ? { background: "var(--accent-ai)", color: "var(--accent-contrast)" } : { color: "var(--fg-3)" }}
                >
                  {seconds}s
                </button>
              ))}
            </div>
          </div>
        </div>

        {(working || stage === "done") && (
          <div className="mt-6" role="status" aria-live="polite">
            <div className="flex items-center justify-between gap-4 text-xs">
              <span>{STAGE_LABELS[stage]}</span>
              <span className="type-index text-sm" style={{ color: "var(--fg-3)" }}>{progress}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ background: "var(--line)" }}>
              <div
                className="h-full rounded-full transition-[width] duration-200"
                style={{ width: `${progress}%`, background: "var(--accent-ai)" }}
              />
            </div>
          </div>
        )}

        {error && (
          <p className="mt-5 text-sm leading-relaxed" style={{ color: "var(--accent-signal)" }} role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={analyze}
          disabled={working}
          className="type-nav mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm"
          style={{ background: "var(--fg)", color: "var(--bg)" }}
        >
          {working ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <WandSparkles aria-hidden="true" className="size-4" />
          )}
          {working ? STAGE_LABELS[stage] : result ? "Analyze again" : "Analyze melody"}
        </button>
      </section>

      <section className="min-w-0" aria-label="Generated guitar tablature">
        {result ? (
          <>
            <div className="flex flex-col gap-5 border-b pb-6 sm:flex-row sm:items-end sm:justify-between" style={{ borderColor: "var(--line)" }}>
              <div className="min-w-0">
                <p className="type-page-kicker" style={{ color: "var(--accent-ai)" }}>
                  Generated tab
                </p>
                <h2 className="type-card-title mt-2 truncate text-2xl">{result.title}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs" style={{ color: "var(--fg-3)" }}>
                  {result.author && <span>{result.author}</span>}
                  <span>{result.notes.length} notes</span>
                  <span>{formatTabTime(result.analyzedDurationSeconds)} analyzed</span>
                  {result.source.startsWith("https://") && (
                    <a
                      href={result.source}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1 underline decoration-transparent underline-offset-4 hover:decoration-current"
                    >
                      Source
                      <ExternalLink aria-hidden="true" className="size-3" />
                    </a>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={exportPdf}
                disabled={pdfWorking}
                className="type-nav flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border px-4 text-sm"
                style={{ borderColor: "var(--line-strong)", background: "var(--bg-raised)" }}
              >
                {pdfWorking ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <FileDown aria-hidden="true" className="size-4" />}
                Save PDF
              </button>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs" style={{ color: "var(--fg-3)" }}>
              <Guitar aria-hidden="true" className="size-4" />
              <span>Standard tuning</span>
              <span aria-hidden="true">/</span>
              <span>24 frets</span>
              <span aria-hidden="true">/</span>
              <span>{formatTabTime(result.sourceOffsetSeconds)} start</span>
            </div>

            <div className="mt-4 space-y-4">
              {result.segments.map((segment) => (
                <TabStaff
                  key={segment.startTimeSeconds}
                  segment={segment}
                  sourceOffsetSeconds={result.sourceOffsetSeconds}
                />
              ))}
            </div>
          </>
        ) : (
          <EmptyTab />
        )}
      </section>
    </div>
  );
}

function TabStaff({ segment, sourceOffsetSeconds }: { segment: GuitarTabSegment; sourceOffsetSeconds: number }) {
  const ticks = [0, 2, 4, 6, 8];

  return (
    <article className="overflow-hidden rounded-lg border" style={{ borderColor: "var(--line)", background: "var(--bg-raised)" }}>
      <header className="flex items-center justify-between border-b px-4 py-3 text-xs" style={{ borderColor: "var(--line)" }}>
        <span className="font-mono">
          {formatTabTime(sourceOffsetSeconds + segment.startTimeSeconds)} - {formatTabTime(sourceOffsetSeconds + segment.startTimeSeconds + segment.durationSeconds)}
        </span>
        <span style={{ color: "var(--fg-3)" }}>{segment.notes.length} notes</span>
      </header>
      <div className="overflow-x-auto p-4 sm:p-5">
        <div className="relative min-w-[680px]">
          <div className="ml-9 flex h-5 items-start justify-between font-mono text-[10px]" style={{ color: "var(--fg-4)" }}>
            {ticks.map((tick) => <span key={tick}>{tick}s</span>)}
          </div>
          <div className="pointer-events-none absolute bottom-1 left-9 right-0 top-5 flex justify-between" aria-hidden="true">
            {ticks.map((tick) => (
              <span key={tick} className="h-full border-l" style={{ borderColor: "var(--line)" }} />
            ))}
          </div>
          {GUITAR_STRINGS.map((string) => (
            <div key={string.number} className="relative flex h-7 items-center">
              <span className="w-9 shrink-0 font-mono text-xs font-semibold" style={{ color: "var(--fg-3)" }}>
                {string.label}
              </span>
              <div className="relative h-full flex-1">
                <span className="absolute left-0 right-0 top-1/2 border-t" style={{ borderColor: "var(--line-strong)" }} />
                {segment.notes
                  .filter((note) => note.stringNumber === string.number)
                  .map((note, index) => {
                    const left = Math.max(
                      0.8,
                      Math.min(
                        98.2,
                        ((note.startTimeSeconds - segment.startTimeSeconds) / segment.durationSeconds) * 100,
                      ),
                    );
                    return (
                      <span
                        key={`${note.startTimeSeconds}-${note.pitchMidi}-${index}`}
                        className="absolute top-1/2 z-10 min-w-5 -translate-x-1/2 -translate-y-1/2 rounded-[3px] px-1 text-center font-mono text-[11px] font-bold"
                        style={{ left: `${left}%`, background: "var(--bg-raised)", color: "var(--accent-ai)" }}
                        title={`${note.noteName}, string ${note.stringNumber}, fret ${note.fret}, ${formatTabTime(sourceOffsetSeconds + note.startTimeSeconds)}`}
                      >
                        {note.fret}
                      </span>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function EmptyTab() {
  return (
    <div className="flex min-h-[430px] flex-col items-center justify-center border-y text-center" style={{ borderColor: "var(--line)" }}>
      <div className="grid size-14 place-items-center rounded-lg border" style={{ borderColor: "var(--line-strong)", color: "var(--accent-ai)" }}>
        <Guitar aria-hidden="true" className="size-6" />
      </div>
      <p className="font-display mt-5 text-sm font-semibold">Your guitar tab will appear here.</p>
      <div className="mt-8 w-full max-w-md space-y-4 px-8" aria-hidden="true">
        {GUITAR_STRINGS.map((string) => (
          <div key={string.number} className="flex items-center gap-3">
            <span className="w-3 font-mono text-[10px]" style={{ color: "var(--fg-4)" }}>{string.label}</span>
            <span className="h-px flex-1" style={{ background: "var(--line)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

async function decodeAudioClip(bytes: ArrayBuffer, requestedStart: number, requestedDuration: number) {
  const AudioContextClass = window.AudioContext;
  const context = new AudioContextClass();
  try {
    const decoded = await context.decodeAudioData(bytes.slice(0));
    if (requestedStart >= decoded.duration) throw new Error("start_out_of_range");
    const duration = Math.max(0.1, Math.min(requestedDuration, decoded.duration - requestedStart));
    const sampleRate = 22_050;
    const offline = new OfflineAudioContext(1, Math.max(1, Math.ceil(duration * sampleRate)), sampleRate);
    const source = offline.createBufferSource();
    source.buffer = decoded;
    source.connect(offline.destination);
    source.start(0, requestedStart, duration);
    const buffer = await offline.startRendering();
    return {
      buffer,
      durationSeconds: duration,
      sourceDurationSeconds: decoded.duration,
      sourceOffsetSeconds: requestedStart,
    };
  } catch (caught) {
    if (caught instanceof Error && caught.message === "start_out_of_range") throw caught;
    throw new Error("decode_failed");
  } finally {
    await context.close().catch(() => undefined);
  }
}

async function responseError(response: Response) {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error || `request_${response.status}`;
  } catch {
    return `request_${response.status}`;
  }
}

function decodeHeader(value: string | null, fallback: string) {
  if (!value) return fallback;
  try {
    return decodeURIComponent(value);
  } catch {
    return fallback;
  }
}

function errorMessage(caught: unknown) {
  const code = caught instanceof Error ? caught.message : "unknown";
  const messages: Record<string, string> = {
    invalid_url: "Use a valid YouTube video, Shorts, or youtu.be link.",
    video_unavailable: "That video is private, restricted, or unavailable.",
    video_too_long: "Choose a non-live YouTube video under 15 minutes.",
    audio_too_large: "That audio source is too large to analyze here.",
    no_audio: "No playable audio track was found for that video.",
    upstream_failed: "YouTube did not provide a usable audio track. Try another video or upload an audio file.",
    too_many_requests: "Too many analyses were started. Please wait a few minutes.",
    decode_failed: "The browser could not decode this audio format. Try an MP3, WAV, M4A, or another video.",
    start_out_of_range: "The start time is beyond the end of this audio.",
    no_melody: "No clear playable melody was detected in this excerpt. Try a section with a lead vocal or instrument.",
    missing_file: "Choose an audio file first.",
  };
  return messages[code] || "The melody could not be analyzed. Try another excerpt or audio file.";
}
