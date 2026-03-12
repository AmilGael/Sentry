import { getTodaysPassesForCache } from "@/lib/actions/front-desk";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const passes = await getTodaysPassesForCache();
    return NextResponse.json({
      passes,
      cachedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
