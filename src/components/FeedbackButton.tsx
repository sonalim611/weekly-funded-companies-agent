"use client";

import { headerActionButtonClassName } from "@/components/ThemeToggle";

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
