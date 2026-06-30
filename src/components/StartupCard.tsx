"use client";

import type { Startup } from "@/lib/startups";
import { Spinner } from "@/components/Spinner";

const AVATAR_GRADIENTS = [
  "from-cyan-400 to-blue-500",
  "from-violet-400 to-purple-600",
  "from-emerald-400 to-teal-500",
  "from-orange-400 to-rose-500",
  "from-fuchsia-400 to-pink-500",
  "from-amber-400 to-orange-500",
];

function avatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

interface StartupCardProps {
  startup: Startup;
  selected: boolean;
  analyzing?: boolean;
  onSelect: () => void;
  onAnalyze: () => void;
  disabled?: boolean;
}

function SpinnerInline() {
  return <Spinner size={16} />;
}

export function StartupCard({
  startup,
  selected,
  analyzing = false,
  onSelect,
  onAnalyze,
  disabled,
}: StartupCardProps) {
  const gradient = avatarGradient(startup.name);
  const batch = startup.batch ?? startup.fundingAmount.replace("YC ", "").replace(" (pre-seed)", "");

  return (
    <article
      className={`rounded-2xl border bg-card shadow-card overflow-hidden transition-all ${
        selected
          ? "border-accent ring-2 ring-accent/20"
          : "border-card-border hover:shadow-lg hover:border-accent/30"
      }`}
    >
      <button type="button" onClick={onSelect} className="w-full text-left p-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-semibold text-lg shrink-0 shadow-md`}
            >
              {startup.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold truncate">{startup.name}</h3>
              <p className="text-sm text-muted truncate">{startup.industry}</p>
            </div>
          </div>
          <span className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-full gradient-primary text-white shadow-sm">
            {startup.fundingAmount}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-background/60 py-2.5 px-1">
            <p className="text-[10px] uppercase tracking-wide text-muted font-medium">Batch</p>
            <p className="text-sm font-semibold mt-0.5 truncate">{batch}</p>
          </div>
          <div className="rounded-xl bg-background/60 py-2.5 px-1">
            <p className="text-[10px] uppercase tracking-wide text-muted font-medium">Location</p>
            <p className="text-sm font-semibold mt-0.5 truncate">
              {startup.location?.split(",")[0] ?? "—"}
            </p>
          </div>
          <div className="rounded-xl bg-background/60 py-2.5 px-1">
            <p className="text-[10px] uppercase tracking-wide text-muted font-medium">Hiring</p>
            <p
              className={`text-sm font-semibold mt-0.5 ${
                startup.isHiring ? "text-emerald-500" : "text-muted"
              }`}
            >
              {startup.isHiring ? "Yes" : "—"}
            </p>
          </div>
        </div>
      </button>

      <div className="px-5 pb-5">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={disabled || analyzing}
          className="w-full py-2.5 rounded-full gradient-primary text-white text-sm font-medium shadow-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {analyzing ? (
            <span className="flex items-center justify-center gap-2">
              <SpinnerInline />
              Analyzing..
            </span>
          ) : selected ? (
            "Analyze Match"
          ) : (
            "Select & Analyze"
          )}
        </button>
      </div>
    </article>
  );
}
