import type { Startup } from "./startups";

const PROMPT_TEMPLATE = `You are an expert startup career advisor.

Startup Details:
{Name}
{Funding Amount}
{Description}
{Industry}

Candidate Resume:
{Resume Text}

Analyze the candidate for this startup.

Return:
1. Match Score (0-100)
2. Why the candidate is a strong fit
3. Potential gaps
4. Resume improvements tailored to this startup
5. Application strategy
6. A short LinkedIn outreach message to the founder or hiring manager

Format the response using markdown.`;

export function buildAnalysisPrompt(startup: Startup, resumeText: string): string {
  return PROMPT_TEMPLATE.replace("{Name}", startup.name)
    .replace("{Funding Amount}", startup.fundingAmount)
    .replace("{Description}", startup.description)
    .replace("{Industry}", startup.industry)
    .replace("{Resume Text}", resumeText);
}
