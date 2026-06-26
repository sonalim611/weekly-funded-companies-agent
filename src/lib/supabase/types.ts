export type SearchType = "weekly_list" | "startup_analysis";

export interface User {
  id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface StartupSearch {
  id: string;
  user_id: string | null;
  search_type: SearchType;
  startup_id: string | null;
  startup_name: string | null;
  startup_batch: string | null;
  startup_industry: string | null;
  startups_count: number | null;
  used_fallback: boolean | null;
  week_start: string | null;
  week_end: string | null;
  source: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface GeneratedStrategy {
  id: string;
  user_id: string | null;
  startup_search_id: string | null;
  startup_id: string;
  startup_name: string;
  analysis: string;
  resume_text_length: number | null;
  model_used: string | null;
  created_at: string;
}

export interface FeedbackSubmission {
  id: string;
  user_id: string | null;
  rating: number;
  liked: string | null;
  confusing: string | null;
  feature_request: string | null;
  created_at: string;
}

type StartupSearchInsert = {
  id?: string;
  user_id?: string | null;
  search_type: SearchType;
  startup_id?: string | null;
  startup_name?: string | null;
  startup_batch?: string | null;
  startup_industry?: string | null;
  startups_count?: number | null;
  used_fallback?: boolean | null;
  week_start?: string | null;
  week_end?: string | null;
  source?: string | null;
  metadata?: Record<string, unknown>;
  created_at?: string;
};

type GeneratedStrategyInsert = {
  id?: string;
  user_id?: string | null;
  startup_search_id?: string | null;
  startup_id: string;
  startup_name: string;
  analysis: string;
  resume_text_length?: number | null;
  model_used?: string | null;
  created_at?: string;
};

type FeedbackSubmissionInsert = {
  id?: string;
  user_id?: string | null;
  rating: number;
  liked?: string | null;
  confusing?: string | null;
  feature_request?: string | null;
  created_at?: string;
};

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
        Relationships: [];
      };
      startup_searches: {
        Row: StartupSearch;
        Insert: StartupSearchInsert;
        Update: Partial<StartupSearchInsert>;
        Relationships: [];
      };
      generated_strategies: {
        Row: GeneratedStrategy;
        Insert: GeneratedStrategyInsert;
        Update: Partial<GeneratedStrategyInsert>;
        Relationships: [];
      };
      feedback_submissions: {
        Row: FeedbackSubmission;
        Insert: FeedbackSubmissionInsert;
        Update: Partial<FeedbackSubmissionInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
