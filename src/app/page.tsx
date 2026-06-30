"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { DashboardHeader } from "@/components/DashboardHeader";
import { FeedbackModal } from "@/components/FeedbackModal";
import { StartupCard } from "@/components/StartupCard";
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
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLElement>(null);
  const startupsRef = useRef<HTMLElement>(null);

  const selectedStartup = startups.find((s) => s.id === startupId);
  const hiringCount = startups.filter((s) => s.isHiring).length;

  const filteredStartups = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matches = startups.filter((startup) => {
      if (!q) return true;
      return (
        startup.name.toLowerCase().includes(q) ||
        startup.industry.toLowerCase().includes(q) ||
        startup.description.toLowerCase().includes(q) ||
        (startup.location?.toLowerCase().includes(q) ?? false)
      );
    });

    return [...matches].sort((a, b) => {
      if (a.isHiring && !b.isHiring) return -1;
      if (!a.isHiring && b.isHiring) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [startups, search]);

  useEffect(() => {
    if (!resultsRef.current || (!loading && !result)) return;

    const scrollToResults = () => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    // Wait for the analysis panel to render before scrolling.
    requestAnimationFrame(() => {
      requestAnimationFrame(scrollToResults);
    });
  }, [loading, result]);

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

  async function runAnalysis(targetStartupId?: string) {
    const id = targetStartupId ?? startupId;
    setError(null);

    if (!file) {
      setError("Please upload your resume PDF first.");
      fileInputRef.current?.click();
      return;
    }

    if (!id) {
      setError("Please select a startup to analyze.");
      startupsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    setStartupId(id);
    setResult(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("startupId", id);

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

  function handleSelectStartup(id: string) {
    setStartupId(id);
    setResult(null);
    setError(null);
  }

  function handleAnalyzeStartup(id: string) {
    handleSelectStartup(id);
    void runAnalysis(id);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader
        search={search}
        onSearchChange={setSearch}
        onOpenFeedback={() => setFeedbackOpen(true)}
      />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Quick Actions + Metrics */}
          <section>
            <div className="flex flex-col lg:flex-row lg:items-stretch gap-4">
              <div className="flex flex-col sm:flex-row gap-3 lg:flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const selected = e.target.files?.[0] ?? null;
                    setFile(selected);
                    setResult(null);
                    setError(null);
                  }}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-3 flex-1 px-6 py-4 rounded-2xl bg-card border border-card-border shadow-card hover:shadow-lg transition-shadow text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.75}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold">Upload Resume</p>
                    <p className="text-sm text-muted truncate">
                      {file ? file.name : "PDF required for analysis"}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => void runAnalysis()}
                  disabled={loading || startupsLoading}
                  className="flex items-center justify-center gap-3 flex-1 px-6 py-4 rounded-2xl bg-card border border-card-border shadow-card hover:shadow-lg transition-shadow disabled:opacity-60"
                >
                  <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.75}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">Generate Strategy</p>
                    <p className="text-sm text-muted">
                      {selectedStartup ? `For ${selectedStartup.name}` : "Select a startup below"}
                    </p>
                  </div>
                </button>
              </div>

              <div className="flex gap-3 shrink-0">
                <div className="rounded-2xl bg-card border border-card-border shadow-card px-5 py-4 min-w-[8.5rem]">
                  <div className="flex items-center gap-2 text-muted text-sm mb-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.75}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"
                      />
                    </svg>
                    Active Startups
                  </div>
                  <p className="text-2xl font-bold">
                    {startupsLoading ? "—" : startups.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-card border border-card-border shadow-card px-5 py-4 min-w-[8.5rem]">
                  <div className="flex items-center gap-2 text-muted text-sm mb-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.75}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Hiring Now
                  </div>
                  <p className="text-2xl font-bold">
                    {startupsLoading ? "—" : hiringCount}
                  </p>
                </div>
              </div>
            </div>

            {weekRange && (
              <p className="text-xs text-muted mt-3">
                {usedFallback
                  ? `Few launches this week — showing ${startups.length} recent YC startups`
                  : `This week (${weekRange})`}
                {startupsSource ? ` · ${startupsSource}` : ""}
              </p>
            )}
          </section>

          {error && (
            <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-3 text-sm text-red-600 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Featured Startups */}
          <section ref={startupsRef}>
            <div className="flex items-center justify-between gap-4 mb-3">
              <div>
                <h2 className="text-lg font-semibold">Featured Startups</h2>
                {!startupsLoading && filteredStartups.length > 0 && (
                  <p className="text-xs text-muted mt-1">
                    Hiring startups shown first · scroll to browse
                  </p>
                )}
              </div>
              {!startupsLoading && (
                <span className="text-sm text-muted shrink-0">
                  {search ? `${filteredStartups.length} of ${startups.length}` : startups.length}
                </span>
              )}
            </div>

            {startupsLoading ? (
              <div className="flex items-center justify-center py-16 text-muted text-sm gap-2">
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
                Loading startups from Y Combinator...
              </div>
            ) : filteredStartups.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-card-border bg-card/50 py-16 text-center text-muted text-sm">
                {search ? "No startups match your search." : "No startups available right now."}
              </div>
            ) : (
              <div className="max-h-[min(28rem,calc(100vh-22rem))] overflow-y-auto analysis-scroll pr-1 -mr-1">
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 pb-1">
                  {filteredStartups.map((startup) => (
                    <StartupCard
                      key={startup.id}
                      startup={startup}
                      selected={startupId === startup.id}
                      analyzing={loading && startupId === startup.id}
                      onSelect={() => handleSelectStartup(startup.id)}
                      onAnalyze={() => handleAnalyzeStartup(startup.id)}
                      disabled={loading}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* AI Strategy / Analysis */}
          <section ref={resultsRef} className="scroll-mt-24">
            <h2 className="text-lg font-semibold mb-5">AI Strategy Modules</h2>

            {loading && (
              <div className="rounded-2xl border border-card-border bg-card shadow-card overflow-hidden">
                <div className="gradient-primary px-6 py-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
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
                  <div>
                    <p className="font-semibold text-white">Growth Catalyst AI</p>
                    <p className="text-sm text-white/80">
                      Analyzing fit for {selectedStartup?.name}...
                    </p>
                  </div>
                </div>
                <div className="p-8 text-center text-muted text-sm">
                  Extracting resume text and generating your personalized application strategy.
                </div>
              </div>
            )}

            {!loading && !result && (
              <div className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-2xl border border-card-border bg-card shadow-card overflow-hidden">
                  <div className="gradient-primary px-5 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.75}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      <span className="font-semibold text-white text-sm">Growth Catalyst AI</span>
                    </div>
                  </div>
                  <ul className="px-5 py-4 space-y-2.5 text-sm text-muted">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                      Optimize your pitch for funded startups
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                      Identify skill gaps and strengths
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                      Tailored application talking points
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-card-border bg-card shadow-card overflow-hidden">
                  <div className="gradient-primary px-5 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.75}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                      <span className="font-semibold text-white text-sm">Match Intelligence</span>
                    </div>
                  </div>
                  <ul className="px-5 py-4 space-y-2.5 text-sm text-muted">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                      Resume-to-startup fit scoring
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                      Role alignment recommendations
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                      Weekly YC launch coverage
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {!loading && result && (
              <div className="rounded-2xl border border-card-border bg-card shadow-card overflow-hidden flex flex-col max-h-[min(80vh,calc(100vh-8rem))]">
                <div className="gradient-primary px-5 sm:px-6 py-4 shrink-0 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.75}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-white truncate">
                        Strategy for {result.startup.name}
                      </h3>
                      <p className="text-sm text-white/80 truncate">
                        {result.startup.fundingAmount} · {result.startup.industry}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="overflow-y-auto flex-1 px-5 sm:px-6 py-5 prose-analysis analysis-scroll">
                  <ReactMarkdown>{result.analysis}</ReactMarkdown>
                </div>
              </div>
            )}
          </section>
        </main>
      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </div>
  );
}
