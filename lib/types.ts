export type Video = {
  id: string;
  kind: "long" | "short";
  parent_id: string | null;
  number: number | null;
  title: string;
  pillar: number | null;
  format: string | null;
  stage: string;
  publish_date: string | null;
  search_phrase: string | null;
  audience: string | null;
  problem: string | null;
  promise: string | null;
  proof: string | null;
  unique_angle: string | null;
  cta: string | null;
  next_video: string | null;
  title_options: string | null;
  thumbnail_ideas: string | null;
  hook: string | null;
  script: string | null;
  description: string | null;
  pinned_comment: string | null;
  youtube_url: string | null;
  checklist: Record<string, boolean>;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type VideoStats = {
  id: string;
  video_id: string;
  period_end: string;
  views: number | null;
  impressions: number | null;
  ctr: number | null;
  avd_seconds: number | null;
  pct_viewed: number | null;
  retention_30s: number | null;
  subs_gained: number | null;
  search_pct: number | null;
  browse_pct: number | null;
  link_clicks: number | null;
  downloads: number | null;
  whatsapp_chats: number | null;
  calls_booked: number | null;
  clients_won: number | null;
  revenue_gbp: number | null;
  notes: string | null;
};

export type Idea = {
  id: string;
  rank: number | null;
  title: string;
  pillar: number | null;
  growth: string | null;
  lead: string | null;
  status: string;
  notes: string | null;
  video_id: string | null;
};

export type Lead = {
  id: string;
  name: string;
  business: string | null;
  contact: string | null;
  channel: string | null;
  source_video_id: string | null;
  lead_magnet_id: string | null;
  status: string;
  value_gbp: number | null;
  notes: string | null;
  created_at: string;
};

export type LeadMagnet = {
  id: string;
  name: string;
  format: string | null;
  description: string | null;
  cta_line: string | null;
  url: string | null;
  status: string;
};

export type Review = {
  id: string;
  kind: "weekly" | "monthly";
  period_start: string;
  fix_this: string | null;
  repeat_this: string | null;
  notes: string | null;
  ai_analysis: string | null;
  created_at: string;
};

export type Generation = {
  id: string;
  tool: string;
  input: Record<string, string>;
  output: string;
  video_id: string | null;
  created_at: string;
};

export type Settings = {
  channel_name: string;
  context: string;
  start_date: string;
  weekly_hours: number;
  goal: string;
};
