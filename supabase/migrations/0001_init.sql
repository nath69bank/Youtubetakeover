-- YouTube Takeover studio schema.
-- Every row belongs to the signed-in user (owner_id) and row-level security
-- keeps each user's data private, so the app can host more accounts later.

create extension if not exists pgcrypto;

create table public.channel_settings (
  owner_id      uuid primary key default auth.uid() references auth.users on delete cascade,
  channel_name  text not null default 'Wirral AI',
  context       text not null default '',
  start_date    date not null default current_date,
  weekly_hours  int  not null default 5,
  goal          text not null default '10 qualified enquiries per month from YouTube by day 90',
  updated_at    timestamptz not null default now()
);

create table public.videos (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null default auth.uid() references auth.users on delete cascade,
  kind            text not null default 'long' check (kind in ('long', 'short')),
  parent_id       uuid references public.videos on delete set null,
  number          int,
  title           text not null,
  pillar          smallint check (pillar between 1 and 5),
  format          text,
  stage           text not null default 'idea'
                  check (stage in ('idea', 'brief', 'script', 'recording', 'editing', 'scheduled', 'published')),
  publish_date    date,
  search_phrase   text,
  audience        text,
  problem         text,
  promise         text,
  proof           text,
  unique_angle    text,
  cta             text,
  next_video      text,
  title_options   text,
  thumbnail_ideas text,
  hook            text,
  script          text,
  description     text,
  pinned_comment  text,
  youtube_url     text,
  checklist       jsonb not null default '{}'::jsonb,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index videos_owner_stage on public.videos (owner_id, stage);
create index videos_owner_publish on public.videos (owner_id, publish_date);

create table public.ideas (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid() references auth.users on delete cascade,
  rank        int,
  title       text not null,
  pillar      smallint check (pillar between 1 and 5),
  growth      text check (growth in ('H', 'M', 'L')),
  lead        text check (lead in ('H', 'M', 'L')),
  status      text not null default 'new'
              check (status in ('new', 'shortlisted', 'in_production', 'used', 'dropped')),
  notes       text,
  video_id    uuid references public.videos on delete set null,
  created_at  timestamptz not null default now()
);
create index ideas_owner_rank on public.ideas (owner_id, rank);

create table public.video_stats (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null default auth.uid() references auth.users on delete cascade,
  video_id        uuid not null references public.videos on delete cascade,
  period_end      date not null default current_date,
  views           int,
  impressions     int,
  ctr             numeric(5, 2),
  avd_seconds     int,
  pct_viewed      numeric(5, 2),
  retention_30s   numeric(5, 2),
  subs_gained     int,
  search_pct      numeric(5, 2),
  browse_pct      numeric(5, 2),
  link_clicks     int,
  downloads       int,
  whatsapp_chats  int,
  calls_booked    int,
  clients_won     int,
  revenue_gbp     numeric(10, 2),
  notes           text,
  created_at      timestamptz not null default now()
);
create index video_stats_video on public.video_stats (video_id, period_end desc);

create table public.lead_magnets (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid() references auth.users on delete cascade,
  name        text not null,
  format      text,
  description text,
  cta_line    text,
  url         text,
  status      text not null default 'planned' check (status in ('planned', 'building', 'live')),
  created_at  timestamptz not null default now()
);

create table public.leads (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null default auth.uid() references auth.users on delete cascade,
  name             text not null,
  business         text,
  contact          text,
  channel          text check (channel in ('whatsapp', 'form', 'email', 'call', 'other')),
  source_video_id  uuid references public.videos on delete set null,
  lead_magnet_id   uuid references public.lead_magnets on delete set null,
  status           text not null default 'new'
                   check (status in ('new', 'contacted', 'call_booked', 'proposal', 'won', 'lost')),
  value_gbp        numeric(10, 2),
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index leads_owner_created on public.leads (owner_id, created_at desc);

create table public.reviews (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null default auth.uid() references auth.users on delete cascade,
  kind          text not null check (kind in ('weekly', 'monthly')),
  period_start  date not null default current_date,
  fix_this      text,
  repeat_this   text,
  notes         text,
  ai_analysis   text,
  created_at    timestamptz not null default now()
);

create table public.generations (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null default auth.uid() references auth.users on delete cascade,
  tool        text not null,
  input       jsonb not null default '{}'::jsonb,
  output      text not null,
  video_id    uuid references public.videos on delete set null,
  created_at  timestamptz not null default now()
);
create index generations_owner_created on public.generations (owner_id, created_at desc);

-- Row-level security: each user sees and changes only their own rows.
do $$
declare t text;
begin
  foreach t in array array['channel_settings', 'videos', 'ideas', 'video_stats',
                           'lead_magnets', 'leads', 'reviews', 'generations']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "owner access" on public.%I for all to authenticated
         using (owner_id = auth.uid()) with check (owner_id = auth.uid())', t);
  end loop;
end $$;
