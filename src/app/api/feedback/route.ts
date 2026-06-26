import { NextRequest, NextResponse } from "next/server";
import { validateFeedbackInput } from "@/lib/feedback";
import { recordFeedbackSubmission } from "@/lib/supabase/records";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Database is not configured" }, { status: 503 });
    }

    const body = await request.json();
    const input = validateFeedbackInput(body);

    if (!input) {
      return NextResponse.json({ error: "Invalid feedback data" }, { status: 400 });
    }

    const feedback = await recordFeedbackSubmission(input);

    return NextResponse.json({
      id: feedback.id,
      createdAt: feedback.createdAt,
    });
  } catch (error) {
    console.error("Failed to save feedback:", error);
    const message = error instanceof Error ? error.message : "Failed to save feedback";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
