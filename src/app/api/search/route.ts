import { NextRequest, NextResponse } from "next/server";
import { searchComponents } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const library = searchParams.get("library") || searchParams.get("lib") || "";
  const limit = Number(searchParams.get("limit") || "50");

  const data = searchComponents({ q, library, limit });

  return NextResponse.json(
    {
      ok: true,
      q,
      library: library || null,
      total: data.total,
      count: data.results.length,
      results: data.results,
      libraries: data.libraries,
      previewBase: "https://components.callsal.app",
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
