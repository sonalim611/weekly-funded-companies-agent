import { NextResponse } from "next/server";
import { recordWeeklyStartupSearch } from "@/lib/supabase/records";
import { fetchWeeklyStartups } from "@/lib/yc";

export const revalidate = 86400;

export async function GET() {
  try {
    const data = await fetchWeeklyStartups();

    await recordWeeklyStartupSearch({
      startupsCount: data.startups.length,
      usedFallback: data.usedFallback,
      weekStart: data.weekStart,
      weekEnd: data.weekEnd,
      source: data.source,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch startups:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch startups";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
