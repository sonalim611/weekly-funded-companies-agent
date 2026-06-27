import { NextResponse } from "next/server";
import { fetchWeeklyStartups } from "@/lib/yc";

export const revalidate = 86400;

export async function GET() {
  try {
    const data = await fetchWeeklyStartups();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch startups:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch startups";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
