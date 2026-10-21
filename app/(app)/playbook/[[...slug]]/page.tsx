import Link from "next/link";
import { notFound } from "next/navigation";
import { renderMarkdown } from "@/components/Markdown";
import { PLAYBOOK, readPlaybook, resolvePlaybookLink } from "@/lib/playbook";

// GitHub-style heading ids so in-doc anchors keep working.
const slugify = (t: string) => t.replace(/<[^>]+>/g, "").replace(/&[a-z#0-9]+;/gi, "").trim().toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s/g, "-");

export default async function PlaybookPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const docPath = slug ? `${slug.map(decodeURIComponent).join("/")}.md` : "README.md";
  const source = await readPlaybook(docPath);
  if (source === null) notFound();

  const seen = new Map<string, number>();
  const html = renderMarkdown(source)
    .replace(/<(h[1-4])>(.*?)<\/\1>/g, (_, tag, inner) => {
      let id = slugify(inner);
      const n = seen.get(id) ?? 0;
      seen.set(id, n + 1);
      if (n) id = `${id}-${n}`;
      return `<${tag} id="${id}">${inner}</${tag}>`;
    })
    .replace(/<a href="([^"]+)"/g, (m, href) => {
      if (/^https?:/i.test(href)) return m;
      const target = resolvePlaybookLink(docPath, href.replace(/&amp;/g, "&"));
      return target ? `<a href="${target}"` : `<a`;
    });

  return (
    <div className="grid split">
      <nav className="card" style={{ padding: 10 }}>
        {PLAYBOOK.map((s) => (
          <div key={s.section} style={{ marginBottom: 8 }}>
            <div className="stat-label" style={{ padding: "6px 8px" }}>{s.section}</div>
            {s.docs.map((d) => (
              <Link key={d.path} href={`/playbook/${d.path.replace(/\.md$/, "")}`} className={`nav-link${d.path === docPath ? " active" : ""}`}>
                {d.title}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <article className="card md" style={{ minWidth: 0 }} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
