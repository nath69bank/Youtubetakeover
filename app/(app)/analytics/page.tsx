import Link from "next/link";
import { AiRunner } from "@/components/AiRunner";
import { PILLARS, rate } from "@/lib/constants";
import { formatDate } from "@/lib/dates";
import { requireUser } from "@/lib/supabase/server";
import type { Lead, Video, VideoStats } from "@/lib/types";

const pct = (n: number | null | undefined) => (n === null || n === undefined ? "—" : `${Number(n).toFixed(1)}%`);
const avd = (s: number | null) => (s === null ? "—" : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`);

export default async function AnalyticsPage() {
  const { supabase } = await requireUser();
  const [{ data: v }, { data: s }, { data: l }] = await Promise.all([
    supabase.from("videos").select("id, kind, title, pillar, format, number, publish_date, stage"),
    supabase.from("video_stats").select("*").order("period_end", { ascending: false }),
    supabase.from("leads").select("id, source_video_id, status, value_gbp"),
  ]);
  const videos = (v ?? []) as Video[];
  const stats = (s ?? []) as VideoStats[];
  const leads = (l ?? []) as Lead[];

  const latest = new Map<string, VideoStats>();
  for (const row of stats) if (!latest.has(row.video_id)) latest.set(row.video_id, row);

  const rows = videos
    .filter((x) => latest.has(x.id))
    .map((x) => {
      const st = latest.get(x.id)!;
      const crmLeads = leads.filter((ld) => ld.source_video_id === x.id);
      const subsPer1k = st.views ? ((st.subs_gained ?? 0) / st.views) * 1000 : null;
      const clickRate = st.views && st.link_clicks !== null ? (st.link_clicks / st.views) * 100 : null;
      const leadsTotal = Math.max(crmLeads.length, (st.whatsapp_chats ?? 0) + (st.calls_booked ?? 0) + (st.downloads ?? 0));
      return { video: x, st, subsPer1k, clickRate, leadsTotal, won: crmLeads.filter((ld) => ld.status === "won").length };
    })
    .sort((a, b) => b.leadsTotal - a.leadsTotal || (b.st.views ?? 0) - (a.st.views ?? 0));

  // Text summary handed to the AI review tool.
  const summary = rows.length === 0 ? "" : [
    "video | kind | pillar | format | published | as of | views | impressions | CTR % | AVD | % viewed | 30s retention % | subs | subs/1k | search % | browse+suggested % | link clicks | click rate % | leads | clients won",
    ...rows.map(({ video: x, st, subsPer1k, clickRate, leadsTotal, won }) =>
      [x.title, x.kind, x.pillar ? PILLARS[x.pillar].short : "", x.format ?? "", x.publish_date ?? "", st.period_end, st.views ?? "", st.impressions ?? "", st.ctr ?? "",
        avd(st.avd_seconds), st.pct_viewed ?? "", st.retention_30s ?? "", st.subs_gained ?? "", subsPer1k?.toFixed(1) ?? "", st.search_pct ?? "", st.browse_pct ?? "",
        st.link_clicks ?? "", clickRate?.toFixed(2) ?? "", leadsTotal, won].join(" | ")),
  ].join("\n");

  const total = (k: keyof VideoStats) => rows.reduce((sum, r) => sum + Number(r.st[k] ?? 0), 0);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Analytics</h1>
          <p className="muted" style={{ margin: 0 }}>Latest snapshot per video, sorted by leads then views. Add snapshots on each video&apos;s Stats tab.</p>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 16 }}>
        <div className="card"><div className="stat-label">Views</div><div className="stat-value">{total("views").toLocaleString("en-GB")}</div></div>
        <div className="card"><div className="stat-label">Subscribers gained</div><div className="stat-value">{total("subs_gained")}</div></div>
        <div className="card"><div className="stat-label">Link clicks</div><div className="stat-value">{total("link_clicks")}</div></div>
        <div className="card"><div className="stat-label">Leads in CRM</div><div className="stat-value">{leads.length}</div><div className="stat-sub">{leads.filter((x) => x.status === "won").length} won</div></div>
      </div>

      <div className="card">
        {rows.length === 0 ? (
          <div className="empty">No stats yet. Open a published video → Stats tab → add a snapshot at 7 days.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Video</th><th>As of</th><th className="num">Views</th><th className="num">CTR</th><th className="num">AVD</th><th className="num">% viewed</th><th className="num">30 s</th><th className="num">Subs/1k</th><th className="num">Search</th><th className="num">Click rate</th><th className="num">Leads</th></tr>
              </thead>
              <tbody>
                {rows.map(({ video: x, st, subsPer1k, clickRate, leadsTotal }) => (
                  <tr key={x.id}>
                    <td><Link href={`/videos/${x.id}#stats`}>{x.title}</Link><div className="small muted">{x.kind === "short" ? "Short" : x.pillar ? PILLARS[x.pillar].short : ""}</div></td>
                    <td className="small">{formatDate(st.period_end)}</td>
                    <td className="num">{st.views?.toLocaleString("en-GB") ?? "—"}</td>
                    <td className="num"><span className={`dot dot-${rate("ctr", st.ctr)}`} />{pct(st.ctr)}</td>
                    <td className="num">{avd(st.avd_seconds)}</td>
                    <td className="num"><span className={`dot dot-${rate("pct_viewed", st.pct_viewed)}`} />{pct(st.pct_viewed)}</td>
                    <td className="num"><span className={`dot dot-${rate("retention_30s", st.retention_30s)}`} />{pct(st.retention_30s)}</td>
                    <td className="num"><span className={`dot dot-${rate("subs_per_1k", subsPer1k)}`} />{subsPer1k === null ? "—" : subsPer1k.toFixed(1)}</td>
                    <td className="num">{pct(st.search_pct)}</td>
                    <td className="num"><span className={`dot dot-${rate("click_rate", clickRate)}`} />{clickRate === null ? "—" : `${clickRate.toFixed(2)}%`}</td>
                    <td className="num"><strong>{leadsTotal}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="small muted" style={{ marginTop: 12, marginBottom: 0 }}>
          <span className="dot dot-red" />fix it <span className="dot dot-amber" style={{ marginLeft: 10 }} />ok <span className="dot dot-green" style={{ marginLeft: 10 }} />good.
          Fix in order: CTR → first 30 s → pacing → subscribers → lead conversion. With under ~1,000 views per video, judge trends across 3–4 videos, not one.
        </p>
      </div>

      <div className="card">
        <h2>✧ Review with AI</h2>
        <p className="small muted">Your tracked data is attached below. Add anything else (e.g. retention graph notes) before generating.</p>
        <AiRunner key={summary.length} toolId="review" initialValues={{ data: summary || "No stats tracked yet." }} />
      </div>
    </>
  );
}
