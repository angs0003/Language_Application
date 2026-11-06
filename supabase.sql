-- Language Steps database. Run once in Supabase: SQL Editor > New query > paste > Run.
-- Safe to run again: it only creates what is missing and resets the security rules.

-- 1. Learning content (uploaded by tools/upload-content.js with the private service key).
create table if not exists public.content (
  key text primary key,          -- for example "ja:theme:20", "zh:chapter:3", "meta:version"
  lang text not null,            -- "zh", "ja", or "*" for shared rows
  kind text not null,            -- theme, chapter, grammar, trip, meta
  ord int not null default 0,    -- order within its kind and language
  level int,                     -- level number, when it applies
  part int,                      -- part number within the language, when it applies
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- 2. One row per user and word: review timing and saved words (My words).
create table if not exists public.word_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  lang text not null,
  word text not null,
  box int not null default 0,
  due timestamptz,
  saved boolean not null default false,
  reading text, meaning text, sentence text, source text,
  saved_box int not null default 0,
  saved_due timestamptz,
  saved_at timestamptz,
  sentence_tokens jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, lang, word)
);

alter table public.word_progress add column if not exists sentence_tokens jsonb;

-- 3. One row per finished item: chapter, trip, trip_open, podcast, grammar.
create table if not exists public.activity (
  user_id uuid not null references auth.users (id) on delete cascade,
  lang text not null,
  kind text not null,
  key text not null,
  done_at timestamptz not null default now(),
  primary key (user_id, lang, kind, key)
);

-- 4. One row per user: settings and other progress details.
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- Security rules (row level security).
alter table public.content enable row level security;
alter table public.word_progress enable row level security;
alter table public.activity enable row level security;
alter table public.user_settings enable row level security;

drop policy if exists "signed-in users read content" on public.content;
create policy "signed-in users read content" on public.content for select to authenticated using (true);

drop policy if exists "own word progress" on public.word_progress;
create policy "own word progress" on public.word_progress for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own activity" on public.activity;
create policy "own activity" on public.activity for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own settings" on public.user_settings;
create policy "own settings" on public.user_settings for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Remove the table from the first version of this app, if it exists.
drop table if exists public.progress;
