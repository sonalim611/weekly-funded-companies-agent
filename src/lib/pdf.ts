import pdf from "pdf-parse/lib/pdf-parse.js";

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const data = await pdf(buffer);
  const text = data.text?.trim();

  if (!text) {
    throw new Error("Could not extract text from PDF. The file may be scanned or image-based.");
  }

  return text;
}
