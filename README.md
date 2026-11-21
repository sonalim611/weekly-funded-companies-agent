# StartWithStartup

**Find recently launched Y Combinator startups and create a more focused job-application strategy.**

StartWithStartup is an AI-assisted job-search tool for candidates who want to explore early-stage companies. It retrieves recently launched YC companies, lets a candidate upload a PDF resume, and uses Google Gemini to generate a company-specific fit assessment and application strategy.

> **Data note:** The startup directory is sourced from the public [YC OSS API](https://github.com/yc-oss/api). The app uses YC batch information as a proxy for recently launched companies; it does not independently verify funding amounts or job openings.

## What it does

- **Discover startups:** Loads companies from recent YC batches and prioritizes active companies launched in the last seven days.
- **Fallback when the weekly list is small:** If fewer than 10 companies meet the weekly filter, the app shows up to 40 of the most recent active companies from the selected batches.
- **Search and browse:** Search the available companies by name, industry, description, or location. Companies marked as hiring are displayed first.
- **Analyze a resume:** Upload a PDF resume and select a startup to generate a tailored analysis with:
  - Match score (0–100)
  - Reasons the candidate may be a good fit
  - Potential skill or experience gaps
  - Resume improvement suggestions
  - Application strategy
  - A short LinkedIn outreach message for a founder or hiring manager
- **Share product feedback:** Submit a 1–5 rating, what worked, what was confusing, and a feature request. Feedback can be sent to a Google Sheet through an optional Google Apps Script webhook.
- **View a product demo:** The landing page supports an optional demo video.

## How it works

1. The startup API reads YC batch metadata and selects recent batches with a usable company pool.
2. Company records are filtered to active companies and sorted by launch date.
3. The dashboard displays companies launched in the last seven days. If there are fewer than 10, it uses the recent-company fallback.
4. The candidate uploads a PDF resume and selects a company.
5. The server validates the selected company against the recent YC data, extracts text from the PDF, and sends the resume text plus company details to Gemini.
6. Gemini returns a Markdown-formatted candidate/company assessment, which is displayed in the dashboard.

### Main application routes

| Route | Purpose |
| --- | --- |
| `/` | Product landing page |
| `/app` | Startup discovery and resume-analysis dashboard |
| `GET /api/startups` | Fetches the current startup list and date range |
| `POST /api/analyze` | Validates the startup, extracts resume text, and generates the AI analysis |
| `POST /api/feedback` | Validates and forwards feedback to the configured Google Sheets webhook |

## Tech stack

- **Next.js 15** — App Router and server-side API routes
- **React 19** and **TypeScript**
- **Google Gemini** via `@google/generative-ai`
- **YC OSS API** — startup and batch data
- **pdf-parse** — PDF text extraction
- **Tailwind CSS 4** — styling
- **React Markdown** — rendering the generated analysis
- **Google Apps Script + Google Sheets** — optional feedback collection
- **Vercel** — supported deployment target

## Getting started

### Prerequisites

- Node.js (use a current LTS release)
- npm
- A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### 1. Clone the repository

```bash
git clone https://github.com/sonalim611/weekly-funded-companies-agent.git
cd weekly-funded-companies-agent
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a local environment file by copying `.env.example` to `.env.local`.

macOS / Linux:

```bash
cp .env.example .env.local
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Add your Gemini API key to `.env.local`:

```env
GEMINI_API_KEY=your_gemini_api_key
```

The repository's `.env.example` also documents these optional settings:

| Variable | Required? | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | Yes, for AI analysis | Authenticates requests to the Gemini API |
| `GEMINI_MODEL` | No | Sets the preferred Gemini model; the app can fall back to its configured model list |
| `GOOGLE_SHEETS_FEEDBACK_WEBHOOK_URL` | No, but required for feedback submission | Google Apps Script Web App URL ending in `/exec` |
| `NEXT_PUBLIC_SITE_URL` | No | Public site URL used for metadata and social sharing |
| `NEXT_PUBLIC_DEMO_VIDEO_URL` | No | Demo video URL or a path to an MP4 asset |
| `NEXT_PUBLIC_DEMO_VIDEO_POSTER_URL` | No | Optional demo-video poster image |

Do not commit `.env.local` or expose API keys in client-side code.

### 4. Start the development server

```bash
npm run dev
```

Open:

- Landing page: [http://localhost:3000](http://localhost:3000)
- Dashboard: [http://localhost:3000/app](http://localhost:3000/app)

### 5. Create a production build

```bash
npm run build
npm run start
```

## Optional: Configure feedback collection with Google Sheets

The feedback feature forwards submissions to a Google Apps Script Web App. To enable it:

1. Open [Google Apps Script](https://script.google.com/) and create a project.
2. Copy the contents of `scripts/google-apps-script-feedback.js` into the project.
3. Deploy it as a **Web app**. The script's setup comments describe the deployment options and authorization steps.
4. Copy the deployed Web App URL ending in `/exec`.
5. Set `GOOGLE_SHEETS_FEEDBACK_WEBHOOK_URL` to that URL in `.env.local`.
6. Restart the local development server.

On the first valid submission, the script creates a spreadsheet named **StartupFeedback** with a **Feedback** tab.

For a Vercel deployment, add the webhook URL under **Project Settings → Environment Variables** and redeploy. Keep the webhook URL server-side; it should not use a `NEXT_PUBLIC_` prefix.

## Deployment

The project can be deployed to [Vercel](https://vercel.com/):

1. Import the GitHub repository into Vercel.
2. Add `GEMINI_API_KEY` in the project's environment variables.
3. Add `GOOGLE_SHEETS_FEEDBACK_WEBHOOK_URL` if you want to collect feedback.
4. Set `NEXT_PUBLIC_SITE_URL` to the deployed public URL.
5. Add demo-video variables if required.
6. Deploy.

The application uses Next.js App Router route handlers, so Vercel can build and serve the frontend and API routes together.

## Project structure

```text
.
├── public/                         # Static assets
├── scripts/
│   └── google-apps-script-feedback.js
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze/route.ts    # Resume-to-startup analysis endpoint
│   │   │   ├── feedback/route.ts   # Feedback webhook endpoint
│   │   │   └── startups/route.ts   # Startup discovery endpoint
│   │   ├── app/
│   │   │   └── page.tsx            # Main dashboard
│   │   ├── page.tsx                # Landing page
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/                 # Dashboard, startup cards, feedback and demo UI
│   ├── lib/
│   │   ├── gemini.ts               # Gemini model calls, retries and fallback
│   │   ├── pdf.ts                  # PDF text extraction
│   │   ├── prompt.ts               # Resume-analysis prompt
│   │   ├── startups.ts             # Startup data types
│   │   └── yc.ts                   # YC data retrieval and filtering
│   └── types/
└── package.json
```

## Important implementation details

- The startup feed is limited to companies available in the selected recent YC batch APIs; it is not a complete directory of every funded startup.
- The weekly filter uses a rolling seven-day launch window. When fewer than 10 active companies match, the app falls back to up to 40 recent active companies.
- The displayed `fundingAmount` is derived from the YC batch label (for example, `YC Winter 2026 (pre-seed)`). It should not be interpreted as a verified funding amount.
- The `isHiring` indicator comes from the YC company record. It is a discovery signal, not a guarantee that a suitable vacancy is currently open.
- Resume analysis depends on text being extractable from the PDF. Scanned or image-only PDFs may not work.
- Gemini model availability can change. The integration retries transient errors and tries configured fallback models.
- AI-generated match scores and recommendations are guidance, not guarantees of hiring outcomes. Candidates should verify company details and open roles before applying.

## License

No license file is currently included in this repository. Unless a license is added, the default copyright terms apply and reuse is not automatically granted.
