import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildAnalysisPrompt } from "./prompt";
import type { Startup } from "./startups";

const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

function isRetryableError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /503|429|500|UNAVAILABLE|RESOURCE_EXHAUSTED|high demand|overloaded/i.test(
    message
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function retryDelay(attempt: number): number {
  const jitter = Math.random() * 500;
  return BASE_DELAY_MS * 2 ** attempt + jitter;
}

async function generateWithModel(
  genAI: GoogleGenerativeAI,
  modelName: string,
  prompt: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: modelName });

  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      if (!text) {
        throw new Error("No response from Gemini");
      }

      return text;
    } catch (error) {
      lastError = error;

      if (!isRetryableError(error) || attempt === MAX_RETRIES - 1) {
        throw error;
      }

      await delay(retryDelay(attempt));
    }
  }

  throw lastError;
}

export async function analyzeResumeForStartup(
  startup: Startup,
  resumeText: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const prompt = buildAnalysisPrompt(startup, resumeText);
  const models = process.env.GEMINI_MODEL
    ? [process.env.GEMINI_MODEL, ...MODELS.filter((m) => m !== process.env.GEMINI_MODEL)]
    : MODELS;

  let lastError: unknown;

  for (const modelName of models) {
    try {
      return await generateWithModel(genAI, modelName, prompt);
    } catch (error) {
      lastError = error;

      if (!isRetryableError(error)) {
        throw error;
      }

      console.warn(`Gemini model ${modelName} unavailable, trying next model...`);
    }
  }

  const message =
    lastError instanceof Error ? lastError.message : "Gemini API is temporarily unavailable";
  throw new Error(
    `${message}. All models are busy — please wait a moment and try again.`
  );
}
