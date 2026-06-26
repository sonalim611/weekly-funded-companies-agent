import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Startup } from "@/lib/startups";
import type { FeedbackInput } from "@/lib/feedback";

export async function recordWeeklyStartupSearch(input: {
  startupsCount: number;
  usedFallback: boolean;
  weekStart: string;
  weekEnd: string;
  source: string;
  userId?: string | null;
}) {
  if (!isSupabaseConfigured()) return null;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("startup_searches")
    .insert({
      user_id: input.userId ?? null,
      search_type: "weekly_list",
      startups_count: input.startupsCount,
      used_fallback: input.usedFallback,
      week_start: input.weekStart,
      week_end: input.weekEnd,
      source: input.source,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to record weekly startup search:", error);
    return null;
  }

  return data.id;
}

export async function recordStartupAnalysisSearch(input: {
  startup: Startup;
  userId?: string | null;
}) {
  if (!isSupabaseConfigured()) return null;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("startup_searches")
    .insert({
      user_id: input.userId ?? null,
      search_type: "startup_analysis",
      startup_id: input.startup.id,
      startup_name: input.startup.name,
      startup_batch: input.startup.batch ?? null,
      startup_industry: input.startup.industry,
      source: "Y Combinator (yc-oss/api)",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to record startup analysis search:", error);
    return null;
  }

  return data.id;
}

export async function recordGeneratedStrategy(input: {
  startup: Startup;
  analysis: string;
  resumeTextLength: number;
  modelUsed: string;
  startupSearchId?: string | null;
  userId?: string | null;
}) {
  if (!isSupabaseConfigured()) return null;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("generated_strategies")
    .insert({
      user_id: input.userId ?? null,
      startup_search_id: input.startupSearchId ?? null,
      startup_id: input.startup.id,
      startup_name: input.startup.name,
      analysis: input.analysis,
      resume_text_length: input.resumeTextLength,
      model_used: input.modelUsed,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to record generated strategy:", error);
    return null;
  }

  return data.id;
}

export async function recordFeedbackSubmission(input: FeedbackInput & { userId?: string | null }) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("feedback_submissions")
    .insert({
      user_id: input.userId ?? null,
      rating: input.rating,
      liked: input.liked ?? null,
      confusing: input.confusing ?? null,
      feature_request: input.feature ?? null,
    })
    .select("id, created_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    createdAt: data.created_at,
  };
}

export async function listFeedbackSubmissions() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("feedback_submissions")
    .select("id, rating, liked, confusing, feature_request, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data.map((item) => ({
    id: item.id,
    rating: item.rating,
    liked: item.liked,
    confusing: item.confusing,
    feature: item.feature_request,
    createdAt: item.created_at,
  }));
}
