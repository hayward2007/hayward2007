import { NextRequest, NextResponse } from "next/server";
import { getPortfolioBySlug } from "@/lib/data";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const portfolio = await getPortfolioBySlug(slug);
  if (!portfolio) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ portfolio });
}
