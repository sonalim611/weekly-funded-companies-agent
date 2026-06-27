import { NextRequest, NextResponse } from "next/server";
import { analyzeResumeForStartup } from "@/lib/gemini";
import { extractTextFromPdf } from "@/lib/pdf";
import { getStartupById } from "@/lib/yc";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume") as File | null;
    const startupId = formData.get("startupId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Resume PDF is required" }, { status: 400 });
    }

    if (!startupId) {
      return NextResponse.json({ error: "Startup selection is required" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
    }

    const startup = await getStartupById(startupId);
    if (!startup) {
      return NextResponse.json({ error: "Invalid startup selected" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const resumeText = await extractTextFromPdf(buffer);
    const analysis = await analyzeResumeForStartup(startup, resumeText);

    return NextResponse.json({
      startup,
      analysis,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    const message = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
