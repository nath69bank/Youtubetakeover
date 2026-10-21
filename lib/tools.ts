// AI tools: the 10 playbook prompts plus per-video production tools.
// Each tool is a small form whose values are turned into a user prompt;
// the channel context (Settings) is always sent as the system prompt.

export type Field = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "select";
  placeholder?: string;
  defaultValue?: string;
  options?: string[];
  rows?: number;
};

export type Tool = {
  id: string;
  step?: number;
  name: string;
  summary: string;
  group: "plan" | "create" | "grow" | "review";
  fields: Field[];
  build: (v: Record<string, string>) => string;
};

const val = (v: Record<string, string>, k: string, fallback = "") => (v[k] ?? "").trim() || fallback;

export const TOOLS: Tool[] = [
  {
    id: "plan-90",
    step: 1,
    group: "plan",
    name: "Build a 90-day plan",
    summary: "Full operating system with milestones at day 30, 60 and 90.",
    fields: [
      { name: "resources", label: "Your resources", defaultValue: "4–6 hours per week, £0–£50/month, phone or webcam, USB mic, screen recorder" },
      { name: "goal", label: "Goal", defaultValue: "10 qualified enquiries per month from YouTube by day 90" },
      { name: "extra", label: "Anything that's changed?", type: "textarea", placeholder: "e.g. we're now focusing on clinics; I can only film on Mondays" },
    ],
    build: (v) => `Act as a world-class YouTube strategist and B2B lead-generation consultant. Build a complete 90-day operating system to take my channel to a reliable source of business enquiries, and on track for YouTube Partner Program eligibility.
My resources are: ${val(v, "resources")}.
My goal is: ${val(v, "goal")}.
${val(v, "extra") ? `Also consider: ${val(v, "extra")}\n` : ""}Create my channel positioning, content pillars, posting schedule, video formats, growth systems, retention framework, lead-generation plan and a week-by-week execution calendar (13 weeks, one long video + 3 Shorts per week). Show the milestones to hit at day 30, 60 and 90 for both channel metrics and leads. Use tables where they help.`,
  },
  {
    id: "niche",
    step: 2,
    group: "plan",
    name: "Pick a niche that can win",
    summary: "Compare 5 niches, choose one, build identity + ranked ideas.",
    fields: [
      { name: "interests", label: "Interests", defaultValue: "practical AI for business, web design, local SEO, automation" },
      { name: "skills", label: "Skills", defaultValue: "AI consulting and implementation, building websites and web apps, SEO, training staff" },
      { name: "count", label: "How many ranked ideas?", type: "select", options: ["25", "50", "100"], defaultValue: "50" },
    ],
    build: (v) => `Act as an elite market researcher and YouTube strategist. Help me choose the best niche and positioning for my channel. My interests are: ${val(v, "interests")}. My skills are: ${val(v, "skills")}. Compare 5 possible niches by audience demand, competition level, search potential, ad friendliness, content longevity, ways to stand out, AND likelihood each viewer becomes a paying client of a UK AI/web consultancy (score 1–5 in a table). Pick the best one and explain why. Then create my channel identity, ideal viewer profile, 5 content categories, and ${val(v, "count", "50")} video ideas ranked by growth potential and lead potential (table: rank, title, pillar, growth H/M/L, lead H/M/L).`,
  },
  {
    id: "competitors",
    step: 3,
    group: "plan",
    name: "Spy on competitors",
    summary: "Channel types to study + 10 content gaps turned into videos.",
    fields: [
      { name: "focus", label: "Focus area", defaultValue: "AI, websites and SEO for UK small business owners" },
      { name: "notes", label: "Your research notes (optional)", type: "textarea", rows: 6, placeholder: "Paste channel names, top video titles, comment complaints you've collected…" },
    ],
    build: (v) => `Act as a YouTube competitor analyst. My niche is: ${val(v, "focus")}. List the 10 types of channel I should study (small, medium and large). For each, tell me what to look for: top videos, title patterns, thumbnail style, video length, upload rhythm and comment complaints. Then find 10 content gaps: topics UK business owners want but nobody covers well (especially UK-specific angles: GDPR, UK tools, local search, UK prices). Turn each gap into a video idea with a title and a reason it can beat existing videos.${val(v, "notes") ? `\n\nHere are my own research notes; use them and prioritise what they show:\n${val(v, "notes")}` : ""}`,
  },
  {
    id: "ideas",
    step: 4,
    group: "create",
    name: "Hooks, titles & thumbnails",
    summary: "Video ideas with 3 titles, a thumbnail, a 15-second hook and a CTA.",
    fields: [
      { name: "count", label: "How many ideas?", type: "select", options: ["5", "10", "20"], defaultValue: "10" },
      { name: "pillar", label: "Pillar", type: "select", options: ["Any", "AI That Actually Helps", "Websites That Win Work", "Get Found on Google (and AI)", "Automate the Boring Bits", "AI Safely"], defaultValue: "Any" },
      { name: "angle", label: "Angle or sector (optional)", placeholder: "e.g. dental practices; Fix It Live; Copilot" },
    ],
    build: (v) => `Act as a top 1% YouTube creator who studies viral videos. For my niche (AI, websites and SEO for UK business owners)${val(v, "pillar") !== "Any" ? `, pillar "${val(v, "pillar")}"` : ""}${val(v, "angle") ? `, angle: ${val(v, "angle")}` : ""}, write ${val(v, "count", "10")} video ideas. For each one give me: 3 title options, 1 thumbnail concept (max 4 words on screen), a hook for the first 15 seconds, a one-line reason someone would click, and which CTA it leads to (free download, free website/Google check, or WhatsApp chat). Use curiosity, a clear promise or a surprise. Do not use fake clickbait. The video must deliver what the title promises.`,
  },
  {
    id: "script",
    step: 5,
    group: "create",
    name: "Script a video people finish",
    summary: "Full retention-focused script with B-roll, text and SFX cues.",
    fields: [
      { name: "idea", label: "Video idea / title", placeholder: "e.g. Why Your Business Doesn't Show Up on Google Maps" },
      { name: "minutes", label: "Length (minutes)", defaultValue: "10" },
      { name: "brief", label: "Brief / notes", type: "textarea", rows: 6, placeholder: "Search phrase, promise, the demo you'll show, the bit only you can say…" },
      { name: "cta", label: "Call to action", placeholder: "e.g. Free Google Business Profile Checklist" },
      { name: "next", label: "Next video for the end screen", placeholder: "optional" },
    ],
    build: (v) => `Act as a YouTube scriptwriter focused on audience retention. Write a full script for this video idea: ${val(v, "idea")}. Length: ${val(v, "minutes", "10")} minutes (about ${Math.round(Number(val(v, "minutes", "10")) * 140) || 1400} spoken words).
${val(v, "brief") ? `Brief:\n${val(v, "brief")}\n` : ""}Use this structure, with timestamps: hook (0–15 s, no logo intro, no "hi guys"), quick proof, story or setup, main points, a pattern interrupt every 60–90 seconds, a mid-video teaser, and a strong ending that leads to ${val(v, "next") ? `my next video "${val(v, "next")}"` : "my next video"} with ONE call to action${val(v, "cta") ? `: ${val(v, "cta")}` : ""}. No "thanks for watching" outro.
Write in simple spoken UK English. Mark where to add **[B-ROLL]**, **[TEXT]** on screen, **[SCREEN]** recordings and **[SFX]** sound effects. Leave [square brackets] for any real example, number or client detail I must fill in — never invent them.
After the script, add a table of the moments viewers might leave and how the script fixes each one, then suggest 3 Shorts to cut from it (timestamp range + hook).`,
  },
  {
    id: "algorithm",
    step: 6,
    group: "grow",
    name: "How the algorithm thinks",
    summary: "Plain-English metrics + a growth strategy for your current size.",
    fields: [
      { name: "subs", label: "Current subscribers", defaultValue: "under 100" },
      { name: "question", label: "Specific question (optional)", type: "textarea", placeholder: "e.g. Why are my impressions dropping on new uploads?" },
    ],
    build: (v) => `Act as a YouTube algorithm expert. Explain in plain English how impressions, click-through rate, average view duration, audience retention, returning viewers, search traffic, browse features and suggested videos work. Then build me a growth strategy for a B2B channel with ${val(v, "subs", "under 100")} subscribers: how often to post, what to test first, how to read the results, how to turn viewers into subscribers, AND how to turn viewers into enquiries. End with 5 common mistakes business channels make at this size.${val(v, "question") ? `\n\nAlso answer this directly: ${val(v, "question")}` : ""}`,
  },
  {
    id: "shorts",
    step: 7,
    group: "create",
    name: "Shorts plan",
    summary: "Shorts ideas with hooks, length and loop/bridge endings.",
    fields: [
      { name: "count", label: "How many Shorts?", type: "select", options: ["10", "20", "30"], defaultValue: "10" },
      { name: "topics", label: "Long videos they should feed", type: "textarea", defaultValue: "practical AI tools, AI policy and risk, websites that convert, local SEO and Google Business Profile, automation" },
    ],
    build: (v) => `Act as a YouTube Shorts strategist. My long videos cover: ${val(v, "topics")}. Give me ${val(v, "count", "10")} Shorts ideas that bring new viewers to my long videos and to wirral.ai. For each: the idea, a hook (the first line, spoken and on screen at the same time), the best length (20–45 s), a loop or bridge ending, and which long video it should link to as its related video. Present as a table. Then explain briefly how to turn any long video into 3 Shorts (tip, mistake, result).`,
  },
  {
    id: "workflow",
    step: 8,
    group: "grow",
    name: "AI production workflow",
    summary: "Weekly workflow, tools, templates and a quality checklist.",
    fields: [
      { name: "volume", label: "Output per week", defaultValue: "1 long video and 3 Shorts" },
      { name: "hours", label: "Hours per week", defaultValue: "5" },
      { name: "setup", label: "Your setup", defaultValue: "I appear on camera and screen-record; phone, USB mic, OBS" },
    ],
    build: (v) => `Act as a professional YouTube production manager. Design an AI-powered workflow so I can publish ${val(v, "volume")} a week in under ${val(v, "hours", "5")} hours. My setup: ${val(v, "setup")}. Cover topic research, scripting, recording, editing, thumbnails, publishing, data review, and repurposing into Shorts, TikTok, Reels and LinkedIn. Recommend free or low-cost tools for each step. Give me templates and a quality checklist. Include a rule to keep my content original and human, so it does not look mass-produced or repetitive (YouTube's inauthentic content policy).`,
  },
  {
    id: "monetise",
    step: 9,
    group: "grow",
    name: "Monetisation & lead plan",
    summary: "Which income streams to add at 0–500, 500–1k and 1k+ subs.",
    fields: [
      { name: "subs", label: "Current subscribers", placeholder: "e.g. 240" },
      { name: "offers", label: "What we sell", defaultValue: "AI consulting, implementation, automation, websites, SEO, training" },
    ],
    build: (v) => `Act as a business strategist for creators who sell services. Design a monetisation plan for my channel where the main income is client work for wirral.ai (${val(v, "offers")}). ${val(v, "subs") ? `I currently have ${val(v, "subs")} subscribers. ` : ""}Include lead magnets, free audits, WhatsApp/booking funnel, email newsletter, YouTube Partner Program and AdSense, affiliate links (only for tools we genuinely use), sponsorships, digital products, paid workshops, and a community. Tell me exactly when to add each: 0–500 subscribers, 500–1,000, and 1,000+. Include a checklist for the YPP application (2-step verification, no strikes, policy compliance, AdSense) and UK GDPR/PECR for collecting leads. Tell me to check YouTube's current thresholds rather than stating them as certain.`,
  },
  {
    id: "review",
    step: 10,
    group: "review",
    name: "Review my numbers",
    summary: "Paste or attach analytics; get the one fix, patterns and rewrites.",
    fields: [
      { name: "period", label: "Period", type: "select", options: ["This week", "This month"], defaultValue: "This week" },
      { name: "data", label: "Analytics", type: "textarea", rows: 10, placeholder: "Paste a YouTube Studio export, or use 'Review with AI' on the Analytics page to attach your tracked data automatically." },
    ],
    build: (v) => `Act as a YouTube data analyst. Here are my YouTube numbers for ${val(v, "period", "this week").toLowerCase()}:

${val(v, "data")}

Benchmarks for my channel size: CTR <3% red, 3–6% amber, >6% green; % viewed <25 red, 25–40 amber, >40 green; retention at 30 s <50% red, 50–65 amber, >65 green; subscribers per 1,000 views <3 red, 3–8 amber, >8 green; description link clicks per view <0.5% red, 0.5–2% amber, >2% green. Fix order: CTR → first 30 s → mid-video pacing → subscribers → lead conversion.

1. Tell me in plain English what the numbers say and what likely caused them.
2. Rate each video red/amber/green on CTR, retention, subscribers per 1k views and leads.
3. Tell me the ONE thing to fix first.
4. Find patterns across my best videos (by leads first, then views).
5. For my 3 weakest videos, give 3 new title options, 2 thumbnail concepts (max 4 words) and a rewritten 15-second hook each.
Don't invent numbers I haven't given you; say when there's too little data to judge.`,
  },
  // Per-video production tools (used from a video's page, also available in the Studio).
  {
    id: "video-titles",
    group: "create",
    name: "Titles, thumbnails & hooks for one video",
    summary: "10 titles, 3 thumbnail concepts and 3 hooks from a brief.",
    fields: [
      { name: "idea", label: "Working title / idea" },
      { name: "brief", label: "Brief", type: "textarea", rows: 5, placeholder: "Search phrase, audience, problem, promise, proof…" },
    ],
    build: (v) => `For my video "${val(v, "idea")}":
${val(v, "brief") ? `\nBrief:\n${val(v, "brief")}\n` : ""}
1. Write 10 title options (under 60 characters; put the search phrase near the start where it fits; mix "How to", "Why your…", number and result-first styles). Mark your top 2 for an A/B test and say why.
2. Give 3 thumbnail concepts: max 4 words of text, the visual, and the facial expression.
3. Write 3 different 15-second hooks (problem-first, result-first, contrarian). No logo intro, no "hi guys".
No clickbait the video can't deliver.`,
  },
  {
    id: "publish-kit",
    group: "create",
    name: "Publish kit",
    summary: "Description, chapters, pinned comment, tags and end-screen line.",
    fields: [
      { name: "title", label: "Final title" },
      { name: "script", label: "Script or outline", type: "textarea", rows: 8 },
      { name: "cta", label: "CTA" },
      { name: "link", label: "CTA link (with UTM)" },
      { name: "next", label: "Watch-next video", placeholder: "optional" },
    ],
    build: (v) => `Write the YouTube publish kit for my video "${val(v, "title")}".
CTA: ${val(v, "cta")} — link: ${val(v, "link")}
${val(v, "next") ? `Watch next: ${val(v, "next")}\n` : ""}Script/outline:
${val(v, "script")}

Give me, in this order:
1. **Description**: line 1 is the CTA with the link; then 2–3 plain-English sentences with the main search phrase in the first sentence; chapters starting at 00:00 (estimate from the script, at least 3); WhatsApp line (https://wa.me/447368349702); one line about wirral.ai and the areas we cover; watch-next line; max 3 hashtags.
2. **Pinned comment**: the CTA link plus one specific question tied to the video.
3. **5 tags/keywords**.
4. **End-screen line** to say over the last 20 seconds.
Use exactly the link given; don't invent other URLs.`,
  },
  {
    id: "shorts-from-video",
    group: "create",
    name: "3 Shorts from a video",
    summary: "Tip, mistake and result Shorts cut from one script.",
    fields: [
      { name: "title", label: "Long video title" },
      { name: "script", label: "Script", type: "textarea", rows: 10 },
    ],
    build: (v) => `Here is the script for my long video "${val(v, "title")}":

${val(v, "script")}

Cut 3 YouTube Shorts from it: A (the tip), B (the mistake), C (the result). For each give: a title, the section to cut (quote its first and last line), the hook (first line on screen + spoken), the full ~30-second Short script tightened for vertical video, the ending (loop or bridge to the full video), and burned-in caption notes.`,
  },
  {
    id: "repurpose",
    group: "grow",
    name: "Repurpose to LinkedIn & email",
    summary: "LinkedIn post, Facebook group post and newsletter snippet.",
    fields: [
      { name: "title", label: "Video title" },
      { name: "link", label: "Video link", placeholder: "https://youtu.be/…" },
      { name: "script", label: "Transcript or script", type: "textarea", rows: 10 },
    ],
    build: (v) => `Here's the transcript of this week's video "${val(v, "title")}"${val(v, "link") ? ` (${val(v, "link")})` : ""}:

${val(v, "script")}

Write: (1) a LinkedIn post (150–200 words, first line is a hook, no hashtag spam, my voice: practical and a bit dry, ends with a question); (2) a 3-sentence Facebook group post for local business groups that offers help without selling; (3) a 60-word newsletter snippet with the video link. Don't invent any facts, numbers or client names that aren't in the transcript.`,
  },
];

export const TOOL_GROUPS: Record<Tool["group"], string> = {
  plan: "Plan",
  create: "Create",
  grow: "Grow & earn",
  review: "Review",
};

export function getTool(id: string) {
  return TOOLS.find((t) => t.id === id);
}
