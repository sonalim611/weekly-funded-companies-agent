# Start With Startup

A weekly AI agent that finds recently funded startups and creates a personalized application strategy.

## Features

- Upload a resume PDF
- Select from YC startups launched in the past 7 days, with a fallback to recent launches when the weekly list is thin
- AI-powered analysis including:
  - Match score (0–100)
  - Fit analysis
  - Potential gaps
  - Resume improvement recommendations
  - Application strategy
  - LinkedIn outreach message

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment file and add your Gemini API key:

```bash
cp .env.example .env.local
```

Get an API key from [Google AI Studio](https://aistudio.google.com/apikey).

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- **Next.js 15** (App Router)
- **Supabase** (PostgreSQL + Auth-ready schema)
- **Gemini 2.5 Flash** via `@google/generative-ai`
- **PostHog** for product analytics
- **pdf-parse** for PDF text extraction
- **Tailwind CSS** for styling

## Database (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. Run the SQL in `supabase/migrations/001_initial_schema.sql` in the Supabase SQL editor.
3. Add these env vars to `.env.local` and Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only — never expose to the client)

### Tables

| Table | Purpose |
|-------|---------|
| `users` | Profile rows synced from Supabase Auth |
| `startup_searches` | Weekly list fetches and startup analysis selections |
| `generated_strategies` | Gemini analysis results |
| `feedback_submissions` | In-app feedback form submissions |

Login is optional today. When you add Supabase Auth, `user_id` will be populated automatically via the `users` profile trigger.

## Feedback & Admin

- Floating **Feedback** button on all pages (rating + open-ended questions)
- PostHog events: `feedback_modal_opened`, `feedback_submitted`, `rating_value`
- Admin dashboard: `/admin/feedback` (protected by `ADMIN_SECRET`)
