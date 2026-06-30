import { NextResponse } from "next/server";

interface FeedbackBody {
  rating: number;
  liked?: string;
  confusing?: string;
  feature?: string;
}

function normalize(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.trim();
}

function isValidRating(rating: unknown): rating is number {
  return typeof rating === "number" && Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as FeedbackBody;
    const rating = body?.rating;

    if (!isValidRating(rating)) {
      return NextResponse.json(
        { error: "Rating must be an integer from 1 to 5." },
        { status: 400 },
      );
    }

    const liked = normalize(body.liked);
    const confusing = normalize(body.confusing);
    const feature = normalize(body.feature);

    const webhookUrl = process.env.GOOGLE_SHEETS_FEEDBACK_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json(
        { error: "Feedback endpoint is not configured on the server." },
        { status: 500 },
      );
    }

    const payload = {
      timestamp: new Date().toISOString(),
      rating,
      liked,
      confusing,
      feature,
      userAgent: request.headers.get("user-agent") ?? "",
    };

    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!webhookResponse.ok) {
      return NextResponse.json(
        { error: "Unable to save feedback to Google Sheets." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 },
    );
  }
}
