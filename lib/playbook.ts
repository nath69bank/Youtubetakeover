import fs from "node:fs/promises";
import path from "node:path";

// The playbook markdown files, in reading order. Only these paths can be read.
export const PLAYBOOK: { section: string; docs: { path: string; title: string }[] }[] = [
  { section: "Start", docs: [{ path: "README.md", title: "Overview & first 7 days" }, { path: "prompts/README.md", title: "The 10 prompts" }] },
  {
    section: "Strategy",
    docs: [
      { path: "strategy/01-90-day-plan.md", title: "1. 90-day plan" },
      { path: "strategy/02-niche-and-positioning.md", title: "2. Niche & positioning" },
      { path: "strategy/03-competitor-research.md", title: "3. Competitor research" },
      { path: "strategy/06-algorithm-playbook.md", title: "6. Algorithm playbook" },
      { path: "strategy/09-monetisation-and-leads.md", title: "9. Monetisation & leads" },
    ],
  },
  {
    section: "Content",
    docs: [
      { path: "content/04-video-ideas.md", title: "4. 20 video ideas" },
      { path: "content/scripts/001-ai-for-small-business.md", title: "5. Script 001" },
      { path: "content/07-shorts-plan.md", title: "7. Shorts plan" },
    ],
  },
  {
    section: "Operations",
    docs: [
      { path: "operations/08-production-workflow.md", title: "8. Production workflow" },
      { path: "operations/10-review-system.md", title: "10. Review system" },
    ],
  },
  {
    section: "Funnel",
    docs: [
      { path: "funnel/lead-magnets.md", title: "Lead magnets" },
      { path: "funnel/description-template.md", title: "Description template" },
      { path: "funnel/cta-scripts.md", title: "CTA scripts" },
    ],
  },
  {
    section: "Templates",
    docs: [
      { path: "templates/video-brief.md", title: "Video brief" },
      { path: "templates/weekly-review.md", title: "Weekly review" },
      { path: "templates/monthly-review.md", title: "Monthly review" },
    ],
  },
];

const ALLOWED = new Set(PLAYBOOK.flatMap((s) => s.docs.map((d) => d.path)));

export async function readPlaybook(docPath: string): Promise<string | null> {
  if (!ALLOWED.has(docPath)) return null;
  return fs.readFile(path.join(process.cwd(), "playbook", docPath), "utf8");
}

// Turns a link inside a playbook doc into an app URL.
export function resolvePlaybookLink(fromDoc: string, href: string) {
  if (/^[a-z]+:/i.test(href) || href.startsWith("#")) return href;
  const [file, hash] = href.split("#");
  const parts = fromDoc.split("/").slice(0, -1);
  for (const seg of file.split("/")) {
    if (seg === "..") parts.pop();
    else if (seg && seg !== ".") parts.push(seg);
  }
  let target = parts.join("/");
  if (!target.endsWith(".md")) target = target ? `${target}/README.md` : "README.md";
  if (target === "content/scripts/README.md") target = "content/scripts/001-ai-for-small-business.md";
  if (!ALLOWED.has(target)) return null;
  return `/playbook/${target.replace(/\.md$/, "")}${hash ? `#${hash}` : ""}`;
}
