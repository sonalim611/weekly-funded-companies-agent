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

function isSuccessfulGasResponse(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;

  try {
    const data = JSON.parse(trimmed) as { ok?: boolean };
    if (data.ok === true) return true;
  } catch {
    // Google often wraps JSON in an HTML echo page after redirect.
  }

  return /"ok"\s*:\s*true/i.test(trimmed);
}

async function postToGoogleAppsScript(url: string, payload: Record<string, unknown>) {
  const init: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
    redirect: "follow",
  };

  const response = await fetch(url, init);
  const text = await response.text();

  if (isSuccessfulGasResponse(text)) {
    return { ok: true as const };
  }

  return {
    ok: false as const,
    error: "Google Sheets webhook returned an unexpected response.",
    status: response.status,
    body: text,
  };
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

    const webhookUrl = process.env.GOOGLE_SHEETS_FEEDBACK_WEBHOOK_URL?.trim();
    if (!webhookUrl) {
      return NextResponse.json(
        { error: "Feedback endpoint is not configured on the server." },
        { status: 500 },
      );
    }

    if (!webhookUrl.includes("script.google.com/macros/s/") || !webhookUrl.endsWith("/exec")) {
      return NextResponse.json(
        {
          error:
            "Feedback webhook URL is invalid. Use your deployed Google Apps Script Web App URL ending in /exec.",
        },
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

    const result = await postToGoogleAppsScript(webhookUrl, payload);

    if (!result.ok) {
      console.error("Feedback webhook failed", {
        status: result.status,
        error: result.error,
        body: result.body?.slice(0, 500),
      });

      return NextResponse.json(
        { error: "Unable to save feedback to Google Sheets." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Feedback request failed", error);
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 },
    );
  }
}
