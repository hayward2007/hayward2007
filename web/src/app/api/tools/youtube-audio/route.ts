import { NextRequest } from "next/server";
import { Innertube } from "youtubei.js";
import {
  checkRateLimit,
  getClientIdentifier,
  isSameOriginRequest,
  noStoreJson,
  rateLimitResponse,
  readJsonObject,
} from "@/lib/request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_VIDEO_SECONDS = 15 * 60;
const MAX_AUDIO_BYTES = 24 * 1024 * 1024;
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
  "www.youtu.be",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

let youtubeClient: Promise<Innertube> | undefined;

function getYouTubeClient() {
  youtubeClient ??= Innertube.create({
    generate_session_locally: true,
    enable_session_cache: true,
    retrieve_player: true,
  });
  return youtubeClient;
}

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return noStoreJson({ error: "invalid_origin" }, { status: 403 });
  }

  const clientId = getClientIdentifier(request);
  const limit = checkRateLimit(`youtube-audio:${clientId}`, 8, 10 * 60 * 1000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

  const bodyResult = await readJsonObject(request, 4_096);
  if (!bodyResult.ok) return bodyResult.response;
  const url = (bodyResult.value as Record<string, unknown>).url;
  if (typeof url !== "string") return noStoreJson({ error: "invalid_url" }, { status: 400 });

  const videoId = parseYouTubeVideoId(url);
  if (!videoId) return noStoreJson({ error: "invalid_url" }, { status: 400 });

  try {
    const client = await getYouTubeClient();
    // The public iOS player response exposes direct audio URLs for ordinary
    // videos; the web response increasingly returns SABR-only placeholders.
    const info = await client.getBasicInfo(videoId, { client: "IOS" });
    const status = info.playability_status?.status;
    if (status && status !== "OK") {
      return noStoreJson({ error: "video_unavailable" }, { status: 422 });
    }

    const duration = info.basic_info.duration || 0;
    if (!duration || duration > MAX_VIDEO_SECONDS || info.basic_info.is_live) {
      return noStoreJson({ error: "video_too_long" }, { status: 422 });
    }

    let format;
    try {
      format = info.chooseFormat({ type: "audio", quality: "best", format: "mp4", codec: "mp4a" });
    } catch {
      format = info.chooseFormat({ type: "audio", quality: "bestefficiency", format: "any" });
    }

    if (!format.has_audio) return noStoreJson({ error: "no_audio" }, { status: 422 });
    if (format.content_length && format.content_length > MAX_AUDIO_BYTES) {
      return noStoreJson({ error: "audio_too_large" }, { status: 413 });
    }

    const audio = await info.download({ itag: format.itag });
    let receivedBytes = 0;
    const limitedAudio = audio.pipeThrough(
      new TransformStream<Uint8Array, Uint8Array>({
        transform(chunk, controller) {
          receivedBytes += chunk.byteLength;
          if (receivedBytes > MAX_AUDIO_BYTES) {
            controller.error(new Error("audio_limit_exceeded"));
            return;
          }
          controller.enqueue(chunk);
        },
      }),
    );

    const contentType = format.mime_type.split(";")[0] || "audio/mp4";
    const title = encodeURIComponent((info.basic_info.title || "YouTube melody").slice(0, 180));
    const author = encodeURIComponent((info.basic_info.author || info.basic_info.channel?.name || "").slice(0, 120));
    const headers = new Headers({
      "Cache-Control": "private, no-store",
      "Content-Disposition": "inline",
      "Content-Type": contentType,
      "X-Content-Type-Options": "nosniff",
      "X-Melody-Author": author,
      "X-Melody-Duration": String(duration),
      "X-Melody-Title": title,
      "X-Melody-Video-Id": videoId,
    });
    if (format.content_length) headers.set("Content-Length", String(format.content_length));

    return new Response(limitedAudio, { headers });
  } catch (error) {
    console.error("YouTube audio preparation failed.", error);
    youtubeClient = undefined;
    return noStoreJson({ error: "upstream_failed" }, { status: 502 });
  }
}

function parseYouTubeVideoId(value: string) {
  const input = value.trim();
  if (!input || input.length > 2_048) return null;

  try {
    const parsed = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
    const hostname = parsed.hostname.toLowerCase().replace(/\.$/, "");
    if (!YOUTUBE_HOSTS.has(hostname) || (parsed.protocol !== "https:" && parsed.protocol !== "http:")) return null;

    let candidate = "";
    if (hostname === "youtu.be" || hostname === "www.youtu.be") {
      candidate = parsed.pathname.split("/").filter(Boolean)[0] || "";
    } else if (parsed.pathname === "/watch") {
      candidate = parsed.searchParams.get("v") || "";
    } else {
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (["embed", "shorts", "live"].includes(parts[0])) candidate = parts[1] || "";
    }

    return YOUTUBE_ID.test(candidate) ? candidate : null;
  } catch {
    return null;
  }
}
