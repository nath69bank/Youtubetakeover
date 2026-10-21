// Channel model: pillars, pipeline stages, checklists and benchmarks from the playbook.

export const PILLARS: Record<number, { name: string; short: string; share: string; lead: string }> = {
  1: { name: "AI That Actually Helps", short: "AI", share: "30%", lead: "AI consulting & implementation" },
  2: { name: "Websites That Win Work", short: "Websites", share: "20%", lead: "Website builds" },
  3: { name: "Get Found on Google (and AI)", short: "Get Found", share: "25%", lead: "SEO & websites" },
  4: { name: "Automate the Boring Bits", short: "Automate", share: "15%", lead: "Automation projects" },
  5: { name: "AI Safely", short: "AI Safely", share: "10%", lead: "Consulting, training, policy work" },
};

export const FORMATS = ["How-to", "Fix It Live", "Teardown", "Honest test", "Opinion", "Short"] as const;

export const STAGES = [
  { id: "idea", label: "Idea" },
  { id: "brief", label: "Brief" },
  { id: "script", label: "Script" },
  { id: "recording", label: "Recording" },
  { id: "editing", label: "Editing" },
  { id: "scheduled", label: "Scheduled" },
  { id: "published", label: "Published" },
] as const;
export type Stage = (typeof STAGES)[number]["id"];

export const IDEA_STATUSES = ["new", "shortlisted", "in_production", "used", "dropped"] as const;

export const LEAD_STATUSES = [
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "call_booked", label: "Call booked" },
  { id: "proposal", label: "Proposal" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
] as const;

export const LEAD_CHANNELS = ["whatsapp", "form", "email", "call", "other"] as const;

export const CONTACT = {
  website: "https://www.wirral.ai",
  whatsapp: "https://wa.me/447368349702",
};

// Pre-publish quality checklist (operations/08-production-workflow.md).
export const CHECKLIST: { group: string; items: { id: string; label: string }[] }[] = [
  {
    group: "Content",
    items: [
      { id: "delivers", label: "Video delivers exactly what the title promises" },
      { id: "hook", label: "Hook states problem + payoff in the first 15 s (no logo intro)" },
      { id: "demo", label: "At least one real example, screen recording or demo" },
      { id: "interrupts", label: "Pattern interrupt roughly every 60–90 s" },
      { id: "facts", label: "Facts checked; prices/laws/tool terms dated or marked 'check current'" },
      { id: "permission", label: "No client named or shown without written permission" },
      { id: "pii", label: "No personal data visible on screen" },
      { id: "honest", label: "Honest about where AI doesn't fit (where relevant)" },
    ],
  },
  {
    group: "Originality rule",
    items: [
      { id: "real_person", label: "Real face and/or real voice (no AI presenter)" },
      { id: "real_experience", label: "Something only Wirral AI could say (client lesson, local example, build)" },
      { id: "real_screen", label: "A genuine demonstration, not just stock footage" },
      { id: "rewritten", label: "AI draft rewritten in my own words before recording" },
      { id: "disclosure", label: "Altered/synthetic content disclosure ticked if any realistic AI visuals" },
    ],
  },
  {
    group: "Technical",
    items: [
      { id: "audio", label: "Audio clear, no echo" },
      { id: "captions", label: "Captions reviewed (place names, tool names)" },
      { id: "thumb", label: "Thumbnail readable at phone size, max 4 words" },
      { id: "title_phrase", label: "Title includes the search phrase near the start" },
    ],
  },
  {
    group: "Funnel",
    items: [
      { id: "one_cta", label: "One CTA, said out loud, matching the topic" },
      { id: "desc_cta", label: "Description line 1 = CTA link with UTM tag" },
      { id: "pinned", label: "Pinned comment posted" },
      { id: "endscreen", label: "End screen → next video + subscribe" },
      { id: "playlist", label: "Added to the right playlist" },
      { id: "related", label: "Related video set on each Short" },
      { id: "tracked", label: "Stats row added after 7 days" },
    ],
  },
];
export const CHECKLIST_TOTAL = CHECKLIST.reduce((n, g) => n + g.items.length, 0);

// Benchmarks for a small specialist B2B channel (operations/10-review-system.md).
export type Rating = "red" | "amber" | "green" | "none";
export function rate(metric: "ctr" | "pct_viewed" | "retention_30s" | "subs_per_1k" | "click_rate", value: number | null | undefined): Rating {
  if (value === null || value === undefined || Number.isNaN(value)) return "none";
  const t = {
    ctr: [3, 6],
    pct_viewed: [25, 40],
    retention_30s: [50, 65],
    subs_per_1k: [3, 8],
    click_rate: [0.5, 2],
  }[metric];
  return value < t[0] ? "red" : value <= t[1] ? "amber" : "green";
}

// 90-day milestones (strategy/01-90-day-plan.md): [day30, day60, day90] as [low, high] ranges.
export const MILESTONES = [
  { key: "long", label: "Long videos published", targets: [[4, 4], [8, 8], [13, 13]] },
  { key: "shorts", label: "Shorts published", targets: [[12, 12], [24, 24], [39, 39]] },
  { key: "enquiries", label: "Enquiries this month", targets: [[1, 2], [3, 6], [8, 12]] },
  { key: "clients", label: "Clients won from YouTube", targets: [[0, 1], [1, 2], [2, 4]] },
] as const;

export function utmLink(campaign: string, medium = "description", base = CONTACT.website) {
  const url = new URL(base);
  url.searchParams.set("utm_source", "youtube");
  url.searchParams.set("utm_medium", medium);
  url.searchParams.set("utm_campaign", campaign);
  return url.toString();
}
