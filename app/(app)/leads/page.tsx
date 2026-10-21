import Link from "next/link";
import { createLead, deleteLead, updateLead } from "@/app/actions";
import { ConfirmButton } from "@/components/ConfirmButton";
import { LeadStatus } from "@/components/LeadStatus";
import { SubmitButton } from "@/components/SubmitButton";
import { LEAD_CHANNELS, LEAD_STATUSES } from "@/lib/constants";
import { formatDate, monthStartISO } from "@/lib/dates";
import { requireUser } from "@/lib/supabase/server";
import type { Lead, LeadMagnet, Video } from "@/lib/types";

export default async function LeadsPage() {
  const { supabase } = await requireUser();
  const [{ data: l }, { data: v }, { data: m }] = await Promise.all([
    supabase.from("leads").select("*").order("created_at", { ascending: false }),
    supabase.from("videos").select("id, title, kind, number").order("number", { nullsFirst: false }),
    supabase.from("lead_magnets").select("id, name").order("created_at"),
  ]);
  const leads = (l ?? []) as Lead[];
  const videos = (v ?? []) as Pick<Video, "id" | "title" | "kind" | "number">[];
  const magnets = (m ?? []) as Pick<LeadMagnet, "id" | "name">[];
  const videoTitle = new Map(videos.map((x) => [x.id, x.title]));
  const magnetName = new Map(magnets.map((x) => [x.id, x.name]));

  const monthStart = monthStartISO();
  const thisMonth = leads.filter((x) => x.created_at.slice(0, 10) >= monthStart).length;
  const won = leads.filter((x) => x.status === "won");
  const pipelineValue = leads.filter((x) => ["call_booked", "proposal"].includes(x.status)).reduce((s, x) => s + Number(x.value_gbp ?? 0), 0);
  const wonValue = won.reduce((s, x) => s + Number(x.value_gbp ?? 0), 0);
  const closed = leads.filter((x) => ["won", "lost"].includes(x.status)).length;

  // Which videos bring leads.
  const byVideo = new Map<string, { leads: number; won: number }>();
  for (const x of leads) {
    if (!x.source_video_id) continue;
    const e = byVideo.get(x.source_video_id) ?? { leads: 0, won: 0 };
    e.leads++;
    if (x.status === "won") e.won++;
    byVideo.set(x.source_video_id, e);
  }
  const topVideos = [...byVideo.entries()].sort((a, b) => b[1].leads - a[1].leads).slice(0, 5);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Leads</h1>
          <p className="muted" style={{ margin: 0 }}>Every enquiry, with the video it came from. Ask each one: “How did you find us? Which video?”</p>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 16 }}>
        <div className="card"><div className="stat-label">This month</div><div className="stat-value">{thisMonth}</div><div className="stat-sub">Day-90 target: 8–12</div></div>
        <div className="card"><div className="stat-label">Clients won</div><div className="stat-value">{won.length}</div><div className="stat-sub">{closed ? Math.round((won.length / closed) * 100) : 0}% of closed</div></div>
        <div className="card"><div className="stat-label">Open pipeline</div><div className="stat-value">£{pipelineValue.toLocaleString("en-GB")}</div><div className="stat-sub">Call booked + proposal</div></div>
        <div className="card"><div className="stat-label">Won value</div><div className="stat-value">£{wonValue.toLocaleString("en-GB")}</div></div>
      </div>

      <div className="grid grid-2" style={{ alignItems: "start", marginBottom: 16 }}>
        <form action={createLead} className="card">
          <h2>Add a lead</h2>
          <div className="grid grid-2">
            <div className="field"><label htmlFor="name">Name</label><input id="name" name="name" required /></div>
            <div className="field"><label htmlFor="business">Business</label><input id="business" name="business" /></div>
            <div className="field"><label htmlFor="contact">Contact (email / phone)</label><input id="contact" name="contact" /></div>
            <div className="field">
              <label htmlFor="channel">Came in via</label>
              <select id="channel" name="channel" defaultValue="whatsapp">{LEAD_CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}</select>
            </div>
            <div className="field">
              <label htmlFor="source_video_id">Source video</label>
              <select id="source_video_id" name="source_video_id" defaultValue="">
                <option value="">Unknown / not YouTube</option>
                {videos.map((x) => <option key={x.id} value={x.id}>{x.kind === "short" ? "[Short] " : x.number ? `#${x.number} ` : ""}{x.title}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="lead_magnet_id">Lead magnet</label>
              <select id="lead_magnet_id" name="lead_magnet_id" defaultValue="">
                <option value="">None</option>
                {magnets.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" defaultValue="new">{LEAD_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select>
            </div>
            <div className="field"><label htmlFor="value_gbp">Potential value £</label><input id="value_gbp" name="value_gbp" inputMode="decimal" /></div>
          </div>
          <div className="field"><label htmlFor="notes">Notes</label><textarea id="notes" name="notes" rows={2} /></div>
          <SubmitButton>Add lead</SubmitButton>
          <p className="hint">Store only what you need. Don&apos;t add people to WhatsApp broadcasts or the newsletter without consent (UK GDPR/PECR).</p>
        </form>

        <div className="card">
          <h2>Videos bringing leads</h2>
          {topVideos.length === 0 ? <p className="muted">Attribute leads to a source video to see what converts.</p> : (
            <table>
              <thead><tr><th>Video</th><th className="num">Leads</th><th className="num">Won</th></tr></thead>
              <tbody>
                {topVideos.map(([id, e]) => (
                  <tr key={id}><td><Link href={`/videos/${id}`}>{videoTitle.get(id) ?? "Deleted video"}</Link></td><td className="num">{e.leads}</td><td className="num">{e.won}</td></tr>
                ))}
              </tbody>
            </table>
          )}
          <h3 style={{ marginTop: 16 }}>Funnel</h3>
          {LEAD_STATUSES.map((s) => {
            const n = leads.filter((x) => x.status === s.id).length;
            return (
              <div key={s.id} className="spread small" style={{ padding: "3px 0" }}>
                <span>{s.label}</span>
                <span style={{ flex: 1, margin: "0 10px" }} className="progress"><span style={{ width: `${leads.length ? (n / leads.length) * 100 : 0}%` }} /></span>
                <span>{n}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        {leads.length === 0 ? <div className="empty">No leads yet. They&apos;ll come. Keep shipping.</div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Added</th><th>Lead</th><th>Source</th><th>Status</th><th className="num">Value</th><th>Notes</th><th></th></tr></thead>
              <tbody>
                {leads.map((x) => (
                  <tr key={x.id}>
                    <td className="small">{formatDate(x.created_at.slice(0, 10))}</td>
                    <td><strong>{x.name}</strong>{x.business && <div className="small">{x.business}</div>}{x.contact && <div className="small muted">{x.contact}</div>}</td>
                    <td className="small">
                      {x.channel && <span className="badge">{x.channel}</span>}{" "}
                      {x.source_video_id ? <Link href={`/videos/${x.source_video_id}`}>{videoTitle.get(x.source_video_id) ?? "video"}</Link> : <span className="muted">—</span>}
                      {x.lead_magnet_id && <div className="muted">via {magnetName.get(x.lead_magnet_id)}</div>}
                    </td>
                    <td><LeadStatus id={x.id} status={x.status} /></td>
                    <td className="num">
                      <form action={updateLead.bind(null, x.id)} className="row" style={{ gap: 4, flexWrap: "nowrap", justifyContent: "flex-end" }}>
                        <input name="value_gbp" defaultValue={x.value_gbp ?? ""} inputMode="decimal" aria-label="Value £" style={{ width: 90 }} />
                        <button className="btn-sm" type="submit">✓</button>
                      </form>
                    </td>
                    <td className="small muted" style={{ maxWidth: 260 }}>{x.notes}</td>
                    <td><form action={deleteLead.bind(null, x.id)}><ConfirmButton message="Delete this lead?">✕</ConfirmButton></form></td>
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
