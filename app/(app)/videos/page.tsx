import Link from "next/link";
import { createVideo } from "@/app/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { CHECKLIST_TOTAL, PILLARS, STAGES } from "@/lib/constants";
import { formatDate } from "@/lib/dates";
import { requireUser } from "@/lib/supabase/server";
import type { Video } from "@/lib/types";

export default async function VideosPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const { kind = "long" } = await searchParams;
  const { supabase } = await requireUser();
  const { data } = await supabase
    .from("videos")
    .select("id, kind, title, stage, publish_date, pillar, number, format, checklist, parent_id")
    .eq("kind", kind === "short" ? "short" : "long")
    .order("publish_date", { ascending: true, nullsFirst: false })
    .order("number", { ascending: true, nullsFirst: false });
  const videos = (data ?? []) as Video[];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Videos</h1>
          <p className="muted" style={{ margin: 0 }}>Every video from idea to published. Click a card to brief, script, publish and track it.</p>
        </div>
        <div className="row">
          <Link href="/videos?kind=long" className={`btn ${kind !== "short" ? "btn-primary" : ""}`}>Long videos</Link>
          <Link href="/videos?kind=short" className={`btn ${kind === "short" ? "btn-primary" : ""}`}>Shorts</Link>
        </div>
      </div>

      <details className="card" style={{ marginBottom: 16 }}>
        <summary>+ New {kind === "short" ? "Short" : "video"}</summary>
        <form action={createVideo} className="grid grid-3" style={{ marginTop: 12, alignItems: "end" }}>
          <input type="hidden" name="kind" value={kind === "short" ? "short" : "long"} />
          <div><label htmlFor="title">Working title</label><input id="title" name="title" required /></div>
          <div>
            <label htmlFor="pillar">Pillar</label>
            <select id="pillar" name="pillar" defaultValue="">
              <option value="">—</option>
              {Object.entries(PILLARS).map(([n, p]) => <option key={n} value={n}>{n}. {p.name}</option>)}
            </select>
          </div>
          <div><SubmitButton pendingText="Creating…">Create</SubmitButton></div>
        </form>
      </details>

      <div className="board">
        {STAGES.map((s) => {
          const items = videos.filter((v) => v.stage === s.id);
          return (
            <div className="column" key={s.id}>
              <div className="column-head"><span>{s.label}</span><span>{items.length}</span></div>
              {items.map((v) => {
                const done = Object.values(v.checklist ?? {}).filter(Boolean).length;
                return (
                  <Link key={v.id} href={`/videos/${v.id}`} className="vcard">
                    <div className="vcard-title">{v.number ? `#${v.number} ` : ""}{v.title}</div>
                    <div className="row" style={{ gap: 4 }}>
                      {v.pillar && <span className="badge">{PILLARS[v.pillar]?.short}</span>}
                      {v.publish_date && <span className="badge badge-accent">{formatDate(v.publish_date)}</span>}
                      {done > 0 && <span className="badge">{done}/{CHECKLIST_TOTAL} ✓</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>
    </>
  );
}
