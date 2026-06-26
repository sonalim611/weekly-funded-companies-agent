"use client";

import { useState } from "react";
import { HeaderActions } from "@/components/HeaderActions";
import type { FeedbackRecord } from "@/lib/feedback";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5 text-amber-400" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? "opacity-100" : "opacity-25"}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function AdminFeedbackClient() {
  const [secret, setSecret] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadFeedback(adminSecret: string) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/feedback", {
        headers: { "x-admin-secret": adminSecret },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load feedback");
      }

      setFeedback(data.feedback);
      setAuthenticated(true);
      sessionStorage.setItem("admin_secret", adminSecret);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feedback");
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }

  function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    if (!secret.trim()) {
      setError("Admin secret is required.");
      return;
    }
    loadFeedback(secret.trim());
  }

  function handleRefresh() {
    const stored = sessionStorage.getItem("admin_secret") || secret;
    if (stored) loadFeedback(stored);
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-card-border bg-card/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold">Feedback Admin</h1>
              <p className="text-sm text-muted mt-1">StartWithStartup user feedback submissions</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <HeaderActions />
              {authenticated && (
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-2 rounded-lg border border-card-border hover:border-accent/40 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {!authenticated ? (
          <div className="max-w-md mx-auto rounded-xl border border-card-border bg-card p-6 space-y-4">
            <h2 className="text-lg font-medium">Admin access</h2>
            <p className="text-sm text-muted">Enter your admin secret to view feedback.</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Admin secret"
                className="w-full rounded-lg border border-card-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-accent hover:bg-accent-hover font-medium transition-colors disabled:opacity-50"
              >
                {loading ? "Verifying..." : "View feedback"}
              </button>
            </form>
          </div>
        ) : feedback.length === 0 ? (
          <div className="rounded-xl border border-dashed border-card-border bg-card/30 p-12 text-center text-muted">
            No feedback submissions yet.
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted">{feedback.length} submission(s)</p>

            <div className="hidden md:block overflow-x-auto rounded-xl border border-card-border">
              <table className="w-full text-sm">
                <thead className="bg-card-border/30 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Rating</th>
                    <th className="px-4 py-3 font-medium">Liked</th>
                    <th className="px-4 py-3 font-medium">Confusing</th>
                    <th className="px-4 py-3 font-medium">Feature request</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border">
                  {feedback.map((item) => (
                    <tr key={item.id} className="align-top">
                      <td className="px-4 py-3 whitespace-nowrap text-muted">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Stars rating={item.rating} />
                      </td>
                      <td className="px-4 py-3 text-muted max-w-xs">{item.liked || "—"}</td>
                      <td className="px-4 py-3 text-muted max-w-xs">{item.confusing || "—"}</td>
                      <td className="px-4 py-3 text-muted max-w-xs">{item.feature || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-4">
              {feedback.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border border-card-border bg-card p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Stars rating={item.rating} />
                    <time className="text-xs text-muted">{formatDate(item.createdAt)}</time>
                  </div>
                  {item.liked && (
                    <div>
                      <p className="text-xs font-medium text-muted mb-1">Liked</p>
                      <p className="text-sm">{item.liked}</p>
                    </div>
                  )}
                  {item.confusing && (
                    <div>
                      <p className="text-xs font-medium text-muted mb-1">Confusing</p>
                      <p className="text-sm">{item.confusing}</p>
                    </div>
                  )}
                  {item.feature && (
                    <div>
                      <p className="text-xs font-medium text-muted mb-1">Feature request</p>
                      <p className="text-sm">{item.feature}</p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
