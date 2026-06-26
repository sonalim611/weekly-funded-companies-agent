-- StartWithStartup initial schema for Supabase PostgreSQL

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.startup_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete set null,
  search_type text not null check (search_type in ('weekly_list', 'startup_analysis')),
  startup_id text,
  startup_name text,
  startup_batch text,
  startup_industry text,
  startups_count integer,
  used_fallback boolean,
  week_start date,
  week_end date,
  source text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.generated_strategies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete set null,
  startup_search_id uuid references public.startup_searches (id) on delete set null,
  startup_id text not null,
  startup_name text not null,
  analysis text not null,
  resume_text_length integer,
  model_used text,
  created_at timestamptz not null default now()
);

create table public.feedback_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete set null,
  rating integer not null check (rating >= 1 and rating <= 5),
  liked text,
  confusing text,
  feature_request text,
  created_at timestamptz not null default now()
);

create index startup_searches_created_at_idx on public.startup_searches (created_at desc);
create index startup_searches_search_type_idx on public.startup_searches (search_type);
create index generated_strategies_created_at_idx on public.generated_strategies (created_at desc);
create index feedback_submissions_created_at_idx on public.feedback_submissions (created_at desc);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at
before update on public.users
for each row execute function public.handle_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.users enable row level security;
alter table public.startup_searches enable row level security;
alter table public.generated_strategies enable row level security;
alter table public.feedback_submissions enable row level security;

create policy "Users can view own profile"
on public.users for select
using (auth.uid() = id);

create policy "Users can update own profile"
on public.users for update
using (auth.uid() = id);

create policy "Anyone can submit feedback"
on public.feedback_submissions for insert
with check (true);

create policy "Users can view own feedback"
on public.feedback_submissions for select
using (auth.uid() = user_id);

create policy "Users can view own startup searches"
on public.startup_searches for select
using (auth.uid() = user_id);

create policy "Users can view own generated strategies"
on public.generated_strategies for select
using (auth.uid() = user_id);
