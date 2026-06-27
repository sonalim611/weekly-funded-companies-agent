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
- Light and dark mode

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
- **Gemini 2.5 Flash** via `@google/generative-ai`
- **pdf-parse** for PDF text extraction
- **Tailwind CSS** for styling
