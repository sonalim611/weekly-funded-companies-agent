"use client";

import { useEffect, useState } from "react";

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

interface FeedbackPayload {
  rating: number;
  liked: string;
  confusing: string;
  feature: string;
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= (hovered || value);
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            className="p-1 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star)}
          >
            <svg
              className={`w-8 h-8 sm:w-9 sm:h-9 ${active ? "text-amber-400" : "text-muted/40"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

export function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [liked, setLiked] = useState("");
  const [confusing, setConfusing] = useState("");
  const [feature, setFeature] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, submitting]);

  useEffect(() => {
    if (!open) {
      setRating(0);
      setLiked("");
      setConfusing("");
      setFeature("");
      setSubmitting(false);
      setSubmitted(false);
      setError(null);
    }
  }, [open]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (rating < 1) {
      setError("Please select a star rating.");
      return;
    }

    const payload: FeedbackPayload = {
      rating,
      liked: liked.trim(),
      confusing: confusing.trim(),
      feature: feature.trim(),
    };

    setSubmitting(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit feedback");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close feedback modal"
      />

      <div className="relative w-full sm:max-w-lg max-h-[92vh] sm:max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-card-border bg-card shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between gap-3 border-b border-card-border bg-card px-4 sm:px-6 py-4">
          <h2 id="feedback-title" className="text-lg font-semibold">
            {submitted ? "Thank you!" : "Share your feedback"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-card-border/50 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {submitted ? (
          <div className="px-4 sm:px-6 py-8 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/20 text-accent">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-foreground text-base sm:text-lg">
              Thanks for your feedback. We have saved it.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white font-medium transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-5 space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Rating</label>
              <StarRating value={rating} onChange={setRating} />
            </div>

            <div className="space-y-2">
              <label htmlFor="liked" className="block text-sm font-medium">
                What did you like?
              </label>
              <textarea
                id="liked"
                value={liked}
                onChange={(e) => setLiked(e.target.value)}
                rows={3}
                placeholder="Tell us what worked well..."
                className="w-full rounded-lg border border-card-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/50 resize-y min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confusing" className="block text-sm font-medium">
                What was confusing?
              </label>
              <textarea
                id="confusing"
                value={confusing}
                onChange={(e) => setConfusing(e.target.value)}
                rows={3}
                placeholder="Anything unclear or frustrating?"
                className="w-full rounded-lg border border-card-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/50 resize-y min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="feature" className="block text-sm font-medium">
                What feature should we add next?
              </label>
              <textarea
                id="feature"
                value={feature}
                onChange={(e) => setFeature(e.target.value)}
                rows={3}
                placeholder="What would make this more useful?"
                className="w-full rounded-lg border border-card-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/50 resize-y min-h-[80px]"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg bg-accent hover:bg-accent-hover text-white disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {submitting ? "Submitting..." : "Submit feedback"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
