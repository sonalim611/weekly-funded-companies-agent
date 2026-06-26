"use client";

import { FeedbackButton } from "@/components/FeedbackWidget";
import { ThemeToggle } from "@/components/ThemeToggle";

export function HeaderActions() {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <ThemeToggle />
      <FeedbackButton />
    </div>
  );
}
