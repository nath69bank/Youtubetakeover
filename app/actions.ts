"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import seed from "@/lib/seed-data.json";
import { DEFAULT_CONTEXT } from "@/lib/default-context";
import { createClient, requireUser } from "@/lib/supabase/server";

const text = (f: FormData, k: string) => {
  const v = f.get(k);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
};
const num = (f: FormData, k: string) => {
  const v = text(f, k);
  if (v === null) return null;
  const n = Number(v.replace(/[,%£]/g, ""));
  return Number.isFinite(n) ? n : null;
};
function fail(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}
function must<T>({ data, error }: { data: T; error: { message: string } | null }): NonNullable<T> {
  if (error) throw new Error(error.message);
  if (data === null || data === undefined) throw new Error("Not found");
  return data;
}

// ---------- Auth ----------

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// ---------- Settings ----------

export async function saveSettings(formData: FormData) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("channel_settings").upsert({
    owner_id: user.id,
    channel_name: text(formData, "channel_name") ?? "Wirral AI",
    context: text(formData, "context") ?? DEFAULT_CONTEXT,
    start_date: text(formData, "start_date") ?? new Date().toISOString().slice(0, 10),
    weekly_hours: num(formData, "weekly_hours") ?? 5,
    goal: text(formData, "goal") ?? "",
    updated_at: new Date().toISOString(),
  });
  fail(error);
  revalidatePath("/", "layout");
}

// ---------- Starter kit ----------

// Next Tuesday on or after the given date (long videos go out on Tuesdays).
function tuesdayOnOrAfter(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + ((2 - d.getUTCDay() + 7) % 7));
  return d;
}
const iso = (d: Date) => d.toISOString().slice(0, 10);
const unquote = (s: string | null) => (s ?? "").replace(/^"|"$/g, "");

export async function seedStarterKit() {
  const { supabase, user } = await requireUser();

  const { count } = await supabase.from("videos").select("id", { count: "exact", head: true });
  if ((count ?? 0) > 0) return;

  const today = new Date();
  const { data: existing } = await supabase.from("channel_settings").select("start_date").maybeSingle();
  if (!existing) {
    fail((await supabase.from("channel_settings").insert({ owner_id: user.id, context: DEFAULT_CONTEXT, start_date: iso(today) })).error);
  }
  const start = existing?.start_date ? new Date(existing.start_date) : today;
  const firstTuesday = tuesdayOnOrAfter(start);

  // Idea rank for each concept (concept 20 is idea 21 in the ranked list).
  const rankOf = (concept: number) => (concept === 20 ? 21 : concept);
  const ideaByRank = new Map(seed.ideas.map((i) => [i.rank, i]));
  const weekOfRank = new Map(seed.calendar.map((c) => [c.ref, c.week]));
  const publishDate = (rank: number) => {
    const week = weekOfRank.get(rank);
    if (!week) return null;
    const d = new Date(firstTuesday);
    d.setUTCDate(d.getUTCDate() + 7 * (week - 1));
    return iso(d);
  };

  const longVideos: Record<string, unknown>[] = seed.concepts.map((c) => {
    const rank = rankOf(c.number);
    const isFirst = c.number === 1;
    return {
      kind: "long",
      number: rank,
      title: c.title,
      pillar: c.pillar,
      format: /Fix It Live/i.test(c.title_options) ? "Fix It Live" : /tested|test|week/i.test(c.title) ? "Honest test" : "How-to",
      stage: isFirst ? "script" : "idea",
      publish_date: publishDate(rank),
      title_options: c.title_options,
      thumbnail_ideas: c.thumbnail_ideas,
      hook: unquote(c.hook),
      cta: c.cta,
      notes: c.why_click ? `Why click: ${c.why_click}` : null,
      script: isFirst ? seed.script001 : null,
      search_phrase: isFirst ? "ai for small business uk" : null,
    };
  });

  // Week 12 is the first sector episode (idea 33).
  const sector = ideaByRank.get(33);
  if (sector) {
    longVideos.push({
      kind: "long",
      number: 33,
      title: sector.title,
      pillar: sector.pillar,
      format: "How-to",
      stage: "idea",
      publish_date: publishDate(33),
      title_options: sector.title,
      thumbnail_ideas: null,
      hook: "",
      cta: "Free first conversation",
      notes: "First 'AI for [Sector]' episode: swap the sector for your best-converting one.",
      script: null,
      search_phrase: null,
    });
  }

  const { data: inserted, error: vErr } = await supabase.from("videos").insert(longVideos).select("id, number");
  fail(vErr);
  const videoByRank = new Map((inserted ?? []).map((v) => [v.number as number, v.id as string]));

  // Shorts, linked to their long video where it exists.
  const shorts = seed.shorts.map((s) => ({
    kind: "short",
    title: s.title,
    stage: "idea",
    hook: s.hook,
    format: "Short",
    parent_id: videoByRank.get(s.links_to) ?? null,
    notes: `${s.length} · ${s.ending}${videoByRank.has(s.links_to) ? "" : ` · links to idea #${s.links_to}`}`,
  }));
  fail((await supabase.from("videos").insert(shorts)).error);

  const ideas = seed.ideas.map((i) => ({
    rank: i.rank,
    title: i.title,
    pillar: i.pillar,
    growth: i.growth,
    lead: i.lead,
    status: videoByRank.has(i.rank) ? "in_production" : i.starred ? "shortlisted" : "new",
    video_id: videoByRank.get(i.rank) ?? null,
  }));
  fail((await supabase.from("ideas").insert(ideas)).error);

  fail((await supabase.from("lead_magnets").insert(seed.leadMagnets)).error);

  revalidatePath("/", "layout");
}

// ---------- Ideas ----------

export async function createIdea(formData: FormData) {
  const { supabase } = await requireUser();
  const { data: last } = await supabase.from("ideas").select("rank").order("rank", { ascending: false, nullsFirst: false }).limit(1).maybeSingle();
  fail(
    (
      await supabase.from("ideas").insert({
        title: text(formData, "title") ?? "Untitled idea",
        pillar: num(formData, "pillar"),
        growth: text(formData, "growth"),
        lead: text(formData, "lead"),
        notes: text(formData, "notes"),
        rank: (last?.rank ?? 0) + 1,
      })
    ).error,
  );
  revalidatePath("/ideas");
}

export async function setIdeaStatus(id: string, status: string) {
  const { supabase } = await requireUser();
  fail((await supabase.from("ideas").update({ status }).eq("id", id)).error);
  revalidatePath("/ideas");
}

export async function deleteIdea(id: string) {
  const { supabase } = await requireUser();
  fail((await supabase.from("ideas").delete().eq("id", id)).error);
  revalidatePath("/ideas");
}

export async function promoteIdea(id: string) {
  const { supabase } = await requireUser();
  const idea = must(await supabase.from("ideas").select("*").eq("id", id).single());
  const video = must(
    await supabase
      .from("videos")
      .insert({ title: idea.title, pillar: idea.pillar, number: idea.rank, notes: idea.notes, stage: "brief" })
      .select("id")
      .single(),
  );
  fail((await supabase.from("ideas").update({ status: "in_production", video_id: video.id }).eq("id", id)).error);
  redirect(`/videos/${video.id}`);
}

// ---------- Videos ----------

export async function createVideo(formData: FormData) {
  const { supabase } = await requireUser();
  const data = must(
    await supabase
      .from("videos")
      .insert({
        title: text(formData, "title") ?? "Untitled video",
        kind: text(formData, "kind") ?? "long",
        pillar: num(formData, "pillar"),
        parent_id: text(formData, "parent_id"),
        stage: "brief",
      })
      .select("id")
      .single(),
  );
  redirect(`/videos/${data.id}`);
}

const VIDEO_FIELDS = [
  "title", "format", "stage", "publish_date", "search_phrase", "audience", "problem", "promise", "proof",
  "unique_angle", "cta", "next_video", "title_options", "thumbnail_ideas", "hook", "script", "description",
  "pinned_comment", "youtube_url", "notes", "kind", "parent_id",
] as const;

export async function updateVideo(id: string, formData: FormData) {
  const { supabase } = await requireUser();
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const k of VIDEO_FIELDS) if (formData.has(k)) patch[k] = text(formData, k);
  if (formData.has("pillar")) patch.pillar = num(formData, "pillar");
  if (formData.has("number")) patch.number = num(formData, "number");
  fail((await supabase.from("videos").update(patch).eq("id", id)).error);
  revalidatePath(`/videos/${id}`);
  revalidatePath("/videos");
}

export async function setVideoField(id: string, field: (typeof VIDEO_FIELDS)[number], value: string | null) {
  if (!VIDEO_FIELDS.includes(field)) throw new Error("Unknown field");
  const { supabase } = await requireUser();
  fail((await supabase.from("videos").update({ [field]: value, updated_at: new Date().toISOString() }).eq("id", id)).error);
  revalidatePath(`/videos/${id}`);
  revalidatePath("/videos");
  revalidatePath("/calendar");
}

export async function toggleChecklist(id: string, key: string, done: boolean) {
  const { supabase } = await requireUser();
  const data = must(await supabase.from("videos").select("checklist").eq("id", id).single());
  const checklist = { ...(data.checklist as Record<string, boolean>), [key]: done };
  fail((await supabase.from("videos").update({ checklist }).eq("id", id)).error);
  revalidatePath(`/videos/${id}`);
}

export async function deleteVideo(id: string) {
  const { supabase } = await requireUser();
  fail((await supabase.from("videos").delete().eq("id", id)).error);
  revalidatePath("/videos");
  redirect("/videos");
}

// ---------- Stats ----------

const STAT_FIELDS = [
  "views", "impressions", "ctr", "avd_seconds", "pct_viewed", "retention_30s", "subs_gained", "search_pct",
  "browse_pct", "link_clicks", "downloads", "whatsapp_chats", "calls_booked", "clients_won", "revenue_gbp",
] as const;

export async function addStats(videoId: string, formData: FormData) {
  const { supabase } = await requireUser();
  const row: Record<string, unknown> = {
    video_id: videoId,
    period_end: text(formData, "period_end") ?? new Date().toISOString().slice(0, 10),
    notes: text(formData, "notes"),
  };
  // AVD can be typed as m:ss.
  const avd = text(formData, "avd");
  if (avd) {
    const [m, s] = avd.includes(":") ? avd.split(":").map(Number) : [0, Number(avd)];
    row.avd_seconds = Math.round(m * 60 + s);
  }
  for (const k of STAT_FIELDS) if (k !== "avd_seconds") row[k] = num(formData, k);
  fail((await supabase.from("video_stats").insert(row)).error);
  revalidatePath(`/videos/${videoId}`);
  revalidatePath("/analytics");
  revalidatePath("/");
}

export async function deleteStats(id: string, videoId: string) {
  const { supabase } = await requireUser();
  fail((await supabase.from("video_stats").delete().eq("id", id)).error);
  revalidatePath(`/videos/${videoId}`);
  revalidatePath("/analytics");
}

// ---------- Leads ----------

export async function createLead(formData: FormData) {
  const { supabase } = await requireUser();
  fail(
    (
      await supabase.from("leads").insert({
        name: text(formData, "name") ?? "Unnamed",
        business: text(formData, "business"),
        contact: text(formData, "contact"),
        channel: text(formData, "channel"),
        source_video_id: text(formData, "source_video_id"),
        lead_magnet_id: text(formData, "lead_magnet_id"),
        status: text(formData, "status") ?? "new",
        value_gbp: num(formData, "value_gbp"),
        notes: text(formData, "notes"),
      })
    ).error,
  );
  revalidatePath("/leads");
  revalidatePath("/");
}

export async function updateLead(id: string, formData: FormData) {
  const { supabase } = await requireUser();
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const k of ["status", "notes", "contact", "business"]) if (formData.has(k)) patch[k] = text(formData, k);
  if (formData.has("value_gbp")) patch.value_gbp = num(formData, "value_gbp");
  fail((await supabase.from("leads").update(patch).eq("id", id)).error);
  revalidatePath("/leads");
  revalidatePath("/");
}

export async function deleteLead(id: string) {
  const { supabase } = await requireUser();
  fail((await supabase.from("leads").delete().eq("id", id)).error);
  revalidatePath("/leads");
}

// ---------- Lead magnets ----------

export async function saveMagnet(id: string | null, formData: FormData) {
  const { supabase } = await requireUser();
  const row = {
    name: text(formData, "name") ?? "Untitled",
    format: text(formData, "format"),
    description: text(formData, "description"),
    cta_line: text(formData, "cta_line"),
    url: text(formData, "url"),
    status: text(formData, "status") ?? "planned",
  };
  fail((id ? await supabase.from("lead_magnets").update(row).eq("id", id) : await supabase.from("lead_magnets").insert(row)).error);
  revalidatePath("/funnel");
}

export async function deleteMagnet(id: string) {
  const { supabase } = await requireUser();
  fail((await supabase.from("lead_magnets").delete().eq("id", id)).error);
  revalidatePath("/funnel");
}

// ---------- Reviews ----------

export async function createReview(formData: FormData) {
  const { supabase } = await requireUser();
  fail(
    (
      await supabase.from("reviews").insert({
        kind: text(formData, "kind") ?? "weekly",
        period_start: text(formData, "period_start") ?? new Date().toISOString().slice(0, 10),
        fix_this: text(formData, "fix_this"),
        repeat_this: text(formData, "repeat_this"),
        notes: text(formData, "notes"),
        ai_analysis: text(formData, "ai_analysis"),
      })
    ).error,
  );
  revalidatePath("/reviews");
}

export async function deleteReview(id: string) {
  const { supabase } = await requireUser();
  fail((await supabase.from("reviews").delete().eq("id", id)).error);
  revalidatePath("/reviews");
}

// ---------- Generations ----------

export async function deleteGeneration(id: string) {
  const { supabase } = await requireUser();
  fail((await supabase.from("generations").delete().eq("id", id)).error);
  revalidatePath("/studio");
}
