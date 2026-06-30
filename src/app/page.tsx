import Link from "next/link";
import type { Metadata } from "next";
import { DemoVideo } from "@/components/DemoVideo";

export const metadata: Metadata = {
  title: "StartWithStartup — Land your role at a funded startup",
  description:
    "Match your resume to recently funded YC startups and get a personalized application strategy in minutes.",
};

const valuePoints = [
  "Discover recently funded YC startups hiring this week",
  "Upload your resume and get an AI match score in minutes",
  "Receive a tailored application strategy and outreach talking points",
];

export default function LandingPage() {
  const demoVideoUrl = process.env.NEXT_PUBLIC_DEMO_VIDEO_URL;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white font-bold">
            S
          </div>
          <span className="text-lg font-semibold tracking-tight">StartWithStartup</span>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center space-y-12 sm:space-y-16">
          <section className="space-y-5 pt-4 sm:pt-8">
            <p className="inline-flex items-center rounded-full border border-card-border bg-card px-4 py-1.5 text-sm text-muted shadow-soft">
              Weekly YC startup intelligence for job seekers
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground max-w-4xl">
              Land your next role at a{" "}
              <span className="bg-gradient-to-r from-purple-600 to-violet-500 bg-clip-text text-transparent">
                recently funded startup
              </span>
            </h1>
          </section>

          <section className="space-y-6 max-w-2xl">
            <p className="text-lg sm:text-xl text-muted leading-relaxed">
              StartWithStartup matches your resume to newly launched YC companies and
              generates a personalized strategy to help you stand out and apply with confidence.
            </p>
            <ul className="text-left space-y-3">
              {valuePoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-foreground">
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-accent shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="w-full space-y-4">
            <p className="text-sm font-medium text-muted uppercase tracking-wide">
              See it in action · 30 seconds
            </p>
            <DemoVideo src={demoVideoUrl} />
          </section>

          <section className="space-y-4 pt-2">
            <Link
              href="/app"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full gradient-primary text-white text-lg font-semibold shadow-card hover:opacity-90 transition-opacity"
            >
              Try StartWithStartup
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <p className="text-sm text-muted">No sign-up required · Upload resume and analyze instantly</p>
          </section>
        </div>
      </main>
    </div>
  );
}
