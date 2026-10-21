// Builds lib/seed-data.json (the Wirral AI starter kit) from the playbook markdown.
// Run: node scripts/build-seed.mjs
import fs from "node:fs";

const read = (p) => fs.readFileSync(new URL(`../playbook/${p}`, import.meta.url), "utf8");
const cells = (line) => line.split("|").slice(1, -1).map((c) => c.trim());

// 100 ranked ideas
const ideas = read("strategy/02-niche-and-positioning.md")
  .split("\n")
  .filter((l) => /^\| \d+( ⭐)? \|/.test(l))
  .map((l) => {
    const [rank, title, pillar, growth, lead] = cells(l);
    return { rank: parseInt(rank), starred: rank.includes("⭐"), title, pillar: +pillar, growth, lead };
  });

// 20 video concepts
const conceptText = read("content/04-video-ideas.md");
const concepts = conceptText.split(/\n### /).slice(1).map((block) => {
  const num = parseInt(block);
  const field = (name) => {
    const m = block.match(new RegExp(`- \\*\\*${name}:\\*\\* (.+)`));
    return m ? m[1].trim() : null;
  };
  const titles = field("Titles").split(/[①②③]/).map((t) => t.trim()).filter(Boolean);
  return {
    number: num,
    title: titles[0],
    title_options: titles.join("\n"),
    thumbnail_ideas: field("Thumbnail"),
    hook: field("Hook \\(0–15 s\\)") ?? field("Hook"),
    why_click: field("Why click"),
    cta: field("CTA"),
  };
});

// Concept number -> idea rank (they match 1–19; concept 20 is idea 21)
const conceptToRank = (n) => (n === 20 ? 21 : n);
for (const c of concepts) {
  const idea = ideas.find((i) => i.rank === conceptToRank(c.number));
  c.pillar = idea?.pillar ?? null;
}

// 13-week calendar: week -> concept number (week 12 is the first sector episode, idea 33+)
const calendar = read("strategy/01-90-day-plan.md")
  .split("\n")
  .filter((l) => /^\| \d+ \| #/.test(l))
  .map((l) => {
    const [week, video] = cells(l);
    const m = video.match(/^#(\d+)/);
    return { week: +week, ref: +m[1], label: video.replace(/^#[\d–]+ /, "") };
  });

// 30 Shorts
const shorts = read("content/07-shorts-plan.md")
  .split("\n")
  .filter((l) => /^\| \d+ \| /.test(l))
  .map((l) => {
    const [n, idea, hook, length, ending, links] = cells(l);
    return { number: +n, title: idea, hook: hook.replace(/^"|"$/g, ""), length, ending, links_to: parseInt(links.replace("#", "")) };
  });

// Script 001
const script001 = read("content/scripts/001-ai-for-small-business.md");

const leadMagnets = [
  { name: "AI Readiness Checklist", format: "1-page PDF with score box", status: "building",
    description: "8 questions, 5 minutes. Built from wirral.ai/insights/ai-readiness-checklist.",
    cta_line: "Free AI Readiness Checklist: eight questions, five minutes. First link in the description.",
    url: "https://www.wirral.ai/insights/ai-readiness-checklist" },
  { name: "Website & Google Check", format: "Done-for-you: 3 fixes sent back", status: "planned",
    description: "Viewer sends website or Google Business Profile; we reply within 2 working days with 3 specific fixes. Cap ~10/week.",
    cta_line: "Send us your website on WhatsApp and we'll send back three fixes. Free, no sales call.",
    url: "https://wa.me/447368349702" },
  { name: "One-Page AI Policy Template", format: "Editable Google Doc / Word", status: "planned",
    description: "Never-share data list, human-check rule, approved tools, who to ask.",
    cta_line: "Download our one-page AI policy template free. Link's in the description.",
    url: "https://www.wirral.ai/insights/ai-policy-uk-smes" },
  { name: "10 AI Prompts for UK Business Owners", format: "1–2 page PDF", status: "planned",
    description: "Quotes, complaints, reviews, job ads, policies, content plans. Full text in the playbook.",
    cta_line: "All ten prompts are in a free one-page download. First link in the description.", url: null },
  { name: "Google Business Profile Checklist", format: "1-page checklist", status: "planned",
    description: "Categories, services, description, photos, reviews, posts, Q&A, hours, NAP consistency.",
    cta_line: "Grab the free Google Business Profile checklist, linked in the description.", url: null },
];

const out = { ideas, concepts, calendar, shorts, script001, leadMagnets };
fs.writeFileSync(new URL("../lib/seed-data.json", import.meta.url), JSON.stringify(out, null, 1));
console.log({ ideas: ideas.length, concepts: concepts.length, calendar: calendar.length, shorts: shorts.length });
