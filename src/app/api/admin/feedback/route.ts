import { NextRequest, NextResponse } from "next/server";
import { listFeedbackSubmissions } from "@/lib/supabase/records";
import { isSupabaseConfigured } from "@/lib/supabase/server";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;

  const header = request.headers.get("x-admin-secret");
  return header === secret;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
  }

  try {
    const feedback = await listFeedbackSubmissions();
    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Failed to fetch feedback:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch feedback";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
