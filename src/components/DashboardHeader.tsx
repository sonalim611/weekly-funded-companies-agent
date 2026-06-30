"use client";

import { FeedbackButton } from "@/components/FeedbackButton";

interface DashboardHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  onOpenFeedback: () => void;
}

export function DashboardHeader({
  search,
  onSearchChange,
  onOpenFeedback,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-card-border">
      <div className="flex items-center gap-4 px-4 sm:px-6 lg:px-8 py-4">
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
          S
        </div>

        <h1 className="text-lg sm:text-xl font-semibold tracking-tight shrink-0">
          StartWithStartup <span className="text-muted font-normal hidden sm:inline">| Dashboard</span>
        </h1>

        <div className="flex-1 max-w-md mx-auto hidden sm:block">
          <div className="relative">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="search"
              placeholder="Search startups..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-card-border bg-card shadow-soft text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-shadow"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
          <FeedbackButton onClick={onOpenFeedback} />
        </div>
      </div>

      <div className="px-4 pb-3 sm:hidden">
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="search"
            placeholder="Search startups..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-card-border bg-card shadow-soft text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
      </div>
    </header>
  );
}
