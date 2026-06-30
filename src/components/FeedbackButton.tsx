"use client";

const headerActionButtonClassName =
  "inline-flex items-center justify-center gap-2 w-9 h-9 sm:w-auto sm:px-3 sm:py-2 rounded-full border border-card-border bg-card shadow-soft text-sm font-medium text-muted hover:text-foreground hover:border-accent/40 transition-colors";

interface FeedbackButtonProps {
  onClick: () => void;
}

export function FeedbackButton({ onClick }: FeedbackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={headerActionButtonClassName}
      aria-label="Open feedback form"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M7 8h10M7 12h6m-6 8l-2 4 4-2h8a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12z"
        />
      </svg>
      <span className="hidden sm:inline">Feedback</span>
    </button>
  );
}
