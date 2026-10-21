import Link from "next/link";
import { createIdea, deleteIdea, promoteIdea } from "@/app/actions";
import { AiRunner } from "@/components/AiRunner";
import { ConfirmButton } from "@/components/ConfirmButton";
import { IdeaStatus } from "@/components/IdeaStatus";
import { SubmitButton } from "@/components/SubmitButton";
import { IDEA_STATUSES, PILLARS } from "@/lib/constants";
import { requireUser } from "@/lib/supabase/server";
import type { Idea } from "@/lib/types";

const level = (v: string | null) => <span className={`badge ${v === "H" ? "badge-green" : v === "M" ? "badge-amber" : ""}`}>{v ?? "—"}</span>;

export default async function IdeasPage({ searchParams }: { searchParams: Promise<{ pillar?: string; status?: string; q?: string }> }) {
  const { pillar, status, q } = await searchParams;
  const { supabase } = await requireUser();
  let query = supabase.from("ideas").select("*").order("rank", { nullsFirst: false });
  if (pillar) query = query.eq("pillar", Number(pillar));
  if (status) query = query.eq("status", status);
  else query = query.neq("status", "dropped");
  if (q) query = query.ilike("title", `%${q}%`);
  const { data } = await query;
  const ideas = (data ?? []) as Idea[];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Ideas bank</h1>
          <p className="muted" style={{ margin: 0 }}>Ranked by growth and lead potential. Promote an idea to start producing it.</p>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 16, alignItems: "start" }}>
        <details className="card">
          <summary>+ Add an idea</summary>
          <form action={createIdea} className="stack" style={{ marginTop: 12 }}>
            <div><label htmlFor="title">Title</label><input id="title" name="title" required /></div>
            <div className="grid grid-3">
              <div>
                <label htmlFor="pillar">Pillar</label>
                <select id="pillar" name="pillar" defaultValue="">
                  <option value="">—</option>
                  {Object.entries(PILLARS).map(([n, p]) => <option key={n} value={n}>{n}. {p.short}</option>)}
                </select>
              </div>
              <div><label htmlFor="growth">Growth</label><select id="growth" name="growth" defaultValue="M"><option>H</option><option>M</option><option>L</option></select></div>
              <div><label htmlFor="lead">Lead</label><select id="lead" name="lead" defaultValue="M"><option>H</option><option>M</option><option>L</option></select></div>
            </div>
            <div><label htmlFor="notes">Notes</label><textarea id="notes" name="notes" rows={2} /></div>
            <div><SubmitButton>Add idea</SubmitButton></div>
          </form>
        </details>
        <details className="card">
          <summary>✧ Generate new ideas with AI</summary>
          <div style={{ marginTop: 12 }}><AiRunner toolId="ideas" /></div>
        </details>
      </div>

      <form className="row card" style={{ marginBottom: 16 }}>
        <input name="q" placeholder="Search titles" defaultValue={q ?? ""} style={{ flex: 1, minWidth: 160 }} />
        <select name="pillar" defaultValue={pillar ?? ""} style={{ width: "auto" }} aria-label="Pillar">
          <option value="">All pillars</option>
          {Object.entries(PILLARS).map(([n, p]) => <option key={n} value={n}>{n}. {p.short}</option>)}
        </select>
        <select name="status" defaultValue={status ?? ""} style={{ width: "auto" }} aria-label="Status">
          <option value="">Active (not dropped)</option>
          {IDEA_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
        <button type="submit">Filter</button>
        {(pillar || status || q) && <Link href="/ideas" className="btn btn-ghost">Clear</Link>}
      </form>

      <div className="card">
        {ideas.length === 0 ? <div className="empty">No ideas match.</div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th className="num">#</th><th>Title</th><th>Pillar</th><th>Growth</th><th>Lead</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {ideas.map((i) => (
                  <tr key={i.id}>
                    <td className="num muted">{i.rank}</td>
                    <td>{i.title}{i.notes && <div className="small muted">{i.notes}</div>}</td>
                    <td className="small">{i.pillar ? PILLARS[i.pillar]?.short : "—"}</td>
                    <td>{level(i.growth)}</td>
                    <td>{level(i.lead)}</td>
                    <td><IdeaStatus id={i.id} status={i.status} /></td>
                    <td>
                      <div className="row" style={{ gap: 4, flexWrap: "nowrap" }}>
                        {i.video_id ? (
                          <Link href={`/videos/${i.video_id}`} className="btn btn-sm">Open video</Link>
                        ) : (
                          <form action={promoteIdea.bind(null, i.id)}><SubmitButton className="btn-sm" pendingText="…">Produce →</SubmitButton></form>
                        )}
                        <form action={deleteIdea.bind(null, i.id)}><ConfirmButton message="Delete this idea?">✕</ConfirmButton></form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
