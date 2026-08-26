import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MODEL_ASSETS: Record<string, string> = {
  "model.json": "application/json; charset=utf-8",
  "group1-shard1of1.bin": "application/octet-stream",
};

export async function GET(_request: Request, { params }: { params: Promise<{ asset: string }> }) {
  const { asset } = await params;
  const contentType = MODEL_ASSETS[asset];
  if (!contentType) return NextResponse.json({ error: "not_found" }, { status: 404 });

  try {
    const modelPath = path.join(process.cwd(), "node_modules", "@spotify", "basic-pitch", "model", asset);
    const file = await readFile(modelPath);
    return new Response(new Uint8Array(file), {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": contentType,
        "Cross-Origin-Resource-Policy": "same-origin",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Basic Pitch model asset could not be read.", error);
    return NextResponse.json({ error: "model_unavailable" }, { status: 503 });
  }
}
