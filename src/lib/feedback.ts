export interface FeedbackInput {
  rating: number;
  liked?: string;
  confusing?: string;
  feature?: string;
}

export interface FeedbackRecord extends FeedbackInput {
  id: string;
  createdAt: string;
}

export function validateFeedbackInput(body: unknown): FeedbackInput | null {
  if (!body || typeof body !== "object") return null;

  const { rating, liked, confusing, feature } = body as Record<string, unknown>;

  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return null;
  }

  const toOptionalString = (value: unknown): string | undefined => {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  };

  return {
    rating,
    liked: toOptionalString(liked),
    confusing: toOptionalString(confusing),
    feature: toOptionalString(feature),
  };
}
