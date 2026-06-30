# Start With Startup

A weekly AI agent that finds recently funded startups and creates a personalized application strategy.

## Features

- Landing page with headline, value proposition, demo video, and CTA
- Upload a resume PDF
- Select from YC startups launched in the past 7 days, with a fallback to recent launches when the weekly list is thin
- AI-powered analysis including:
  - Match score (0–100)
  - Fit analysis
  - Potential gaps
  - Resume improvement recommendations
  - Application strategy
  - LinkedIn outreach message
- In-app feedback form (rating + what worked + what was confusing + requested feature)

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

To store feedback in Google Sheets, also set `GOOGLE_SHEETS_FEEDBACK_WEBHOOK_URL` in `.env.local`.
This should point to your Google Apps Script Web App URL.

Feedback is saved to a spreadsheet named **`StartupFeedback`** in your Google Drive (tab: `Feedback`).
Use the script in `scripts/google-apps-script-feedback.js` — it creates that spreadsheet automatically on the first submission.

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the landing page, or go directly to [http://localhost:3000/app](http://localhost:3000/app) for the dashboard.

## Tech Stack

- **Next.js 15** (App Router)
- **Gemini 2.5 Flash** via `@google/generative-ai`
- **pdf-parse** for PDF text extraction
- **Tailwind CSS** for styling
