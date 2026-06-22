"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Startup } from "@/lib/startups";

interface AnalysisResult {
  startup: Startup;
  analysis: string;
}

interface StartupsResponse {
  startups: Startup[];
  fetchedAt: string;
  source: string;
  weekStart: string;
  weekEnd: string;
  usedFallback: boolean;
}

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [startupsSource, setStartupsSource] = useState<string | null>(null);
  const [weekRange, setWeekRange] = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);
  const [startupsLoading, setStartupsLoading] = useState(true);
  const [startupId, setStartupId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const selectedStartup = startups.find((s) => s.id === startupId);

  useEffect(() => {
    async function loadStartups() {
      try {
        const response = await fetch("/api/startups");
        const data: StartupsResponse = await response.json();

        if (!response.ok) {
          throw new Error("error" in data ? String(data.error) : "Failed to load startups");
        }

        setStartups(data.startups);
        setStartupsSource(data.source);
        setWeekRange(`${data.weekStart} – ${data.weekEnd}`);
        setUsedFallback(data.usedFallback);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load startups");
      } finally {
        setStartupsLoading(false);
      }
    }

    loadStartups();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!file) {
      setError("Please upload your resume PDF.");
      return;
    }

    if (!startupId) {
      setError("Please select a startup.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("startupId", startupId);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-card-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <h1 className="text-2xl font-semibold tracking-tight">Start With Startup</h1>
          <p className="text-muted text-sm mt-1">
            A weekly AI agent that finds recently funded startups and creates a personalized
            application strategy
          </p>
          {weekRange && (
            <p className="text-xs text-muted/70 mt-1">
              {usedFallback
                ? `Few launches this week — showing ${startups.length} recent YC startups`
                : `This week (${weekRange})`}
              {startupsSource ? ` · ${startupsSource}` : ""}
            </p>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-2">
          <section className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="rounded-xl border border-card-border bg-card p-6 space-y-4">
                <h2 className="text-lg font-medium">1. Upload Resume</h2>
                <label
                  htmlFor="resume"
                  className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-card-border rounded-lg cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-colors"
                >
                  <svg
                    className="w-8 h-8 text-muted mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span className="text-sm text-muted">
                    {file ? file.name : "Click to upload PDF"}
                  </span>
                  <input
                    id="resume"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const selected = e.target.files?.[0] ?? null;
                      setFile(selected);
                      setResult(null);
                    }}
                  />
                </label>
              </div>

              <div className="rounded-xl border border-card-border bg-card p-6 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-medium">2. Select Startup</h2>
                  {!startupsLoading && (
                    <span className="text-xs text-muted">
                      {startups.length} {usedFallback ? "recent" : "this week"}
                    </span>
                  )}
                </div>

                {startupsLoading ? (
                  <div className="flex items-center justify-center py-12 text-muted text-sm gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Loading startups from Y Combinator...
                  </div>
                ) : startups.length === 0 ? (
                  <p className="text-sm text-muted py-8 text-center">
                    No startups available right now. Check back later.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[28rem] overflow-y-auto pr-1">
                    {startups.map((startup) => (
                      <label
                        key={startup.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          startupId === startup.id
                            ? "border-accent bg-accent/10"
                            : "border-card-border hover:border-accent/30"
                        }`}
                      >
                        <input
                          type="radio"
                          name="startup"
                          value={startup.id}
                          checked={startupId === startup.id}
                          onChange={(e) => {
                            setStartupId(e.target.value);
                            setResult(null);
                          }}
                          className="mt-1 accent-accent"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{startup.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                              {startup.fundingAmount}
                            </span>
                            {startup.isHiring && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-300">
                                Hiring
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted mt-0.5">
                            {startup.industry}
                            {startup.location ? ` · ${startup.location}` : ""}
                          </p>
                          <p className="text-sm text-muted/80 mt-1 line-clamp-2">
                            {startup.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || startupsLoading || !file || !startupId}
                className="w-full py-3 px-4 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Analyzing with Gemini...
                  </span>
                ) : (
                  "Analyze Match"
                )}
              </button>
            </form>
          </section>

          <section>
            {loading && (
              <div className="rounded-xl border border-card-border bg-card p-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/20 mb-4">
                  <svg className="animate-spin h-6 w-6 text-accent" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                </div>
                <p className="text-muted">
                  Extracting resume text and analyzing fit for{" "}
                  <span className="text-foreground font-medium">{selectedStartup?.name}</span>...
                </p>
              </div>
            )}

            {!loading && !result && (
              <div className="rounded-xl border border-dashed border-card-border bg-card/30 p-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-card-border/50 mb-4">
                  <svg
                    className="w-6 h-6 text-muted"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="text-muted">
                  Upload your resume and select a startup to see your personalized match analysis.
                </p>
              </div>
            )}

            {!loading && result && (
              <div className="rounded-xl border border-card-border bg-card overflow-hidden">
                <div className="px-6 py-4 border-b border-card-border bg-accent/5">
                  <h2 className="text-lg font-medium">
                    Analysis for {result.startup.name}
                  </h2>
                  <p className="text-sm text-muted mt-0.5">
                    {result.startup.fundingAmount} · {result.startup.industry}
                  </p>
                </div>
                <div className="px-6 py-5 prose-analysis">
                  <ReactMarkdown>{result.analysis}</ReactMarkdown>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
