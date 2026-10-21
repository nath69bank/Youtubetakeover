import Link from "next/link";
import { seedStarterKit } from "@/app/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { MILESTONES, PILLARS, STAGES, rate } from "@/lib/constants";
import { addDays, daysBetween, formatDate, monthStartISO, todayISO, weekStart } from "@/lib/dates";
import { requireUser } from "@/lib/supabase/server";
import type { Lead, Video, VideoStats } from "@/lib/types";

export default async function Dashboard() {
  const { supabase } = await requireUser();
  const [{ data: settings }, { data: videosData }, { data: leadsData }, { data: statsData }] = await Promise.all([
    supabase.from("channel_settings").select("start_date, goal").maybeSingle(),
    supabase.from("videos").select("id, kind, title, stage, publish_date, pillar, number, parent_id, checklist"),
    supabase.from("leads").select("id, status, value_gbp, created_at, source_video_id"),
    supabase.from("video_stats").select("video_id, period_end, views, ctr, pct_viewed, subs_gained, link_clicks").order("period_end", { ascending: false }),
  ]);
  const videos = (videosData ?? []) as Video[];
  const leads = (leadsData ?? []) as Lead[];
  const stats = (statsData ?? []) as VideoStats[];

  if (videos.length === 0) {
    return (
      <div className="card" style={{ maxWidth: 680, margin: "40px auto" }}>
        <h1>Welcome to your YouTube studio</h1>
        <p className="muted">
          Load the Wirral AI starter kit to fill the studio with everything from the playbook: 100 ranked ideas, 20 video concepts with titles,
          thumbnails and hooks, the 13-week calendar, 30 Shorts, the first full script and 5 lead magnets.
        </p>
        <form action={seedStarterKit} className="row" style={{ marginTop: 16 }}>
          <SubmitButton pendingText="Loading starter kit…">Load the starter kit</SubmitButton>
          <Link href="/settings" className="btn btn-ghost">Edit settings first</Link>
        </form>
      </div>
    );
  }

  const today = todayISO();
  const start = settings?.start_date ?? today;
  const day = Math.max(1, daysBetween(start, today) + 1);
  const phase = day <= 30 ? 0 : day <= 60 ? 1 : 2;
  const phaseLabel = ["Day 30", "Day 60", "Day 90"][phase];

  const longPublished = videos.filter((v) => v.kind === "long" && v.stage === "published").length;
  const shortsPublished = videos.filter((v) => v.kind === "short" && v.stage === "published").length;
  const monthStart = monthStartISO(today);
  const enquiriesThisMonth = leads.filter((l) => l.created_at.slice(0, 10) >= monthStart).length;
  const won = leads.filter((l) => l.status === "won");
  const revenue = won.reduce((s, l) => s + Number(l.value_gbp ?? 0), 0);
  const actual: Record<string, number> = { long: longPublished, shorts: shortsPublished, enquiries: enquiriesThisMonth, clients: won.length };

  const thisWeek = weekStart(today);
  const nextWeek = addDays(thisWeek, 7);
  const dueThisWeek = videos
    .filter((v) => v.publish_date && v.publish_date >= thisWeek && v.publish_date < nextWeek)
    .sort((a, b) => (a.publish_date! < b.publish_date! ? -1 : 1));
  const upcoming = videos
    .filter((v) => v.kind === "long" && v.stage !== "published" && v.publish_date && v.publish_date >= nextWeek)
    .sort((a, b) => (a.publish_date! < b.publish_date! ? -1 : 1))
    .slice(0, 4);
  const overdue = videos.filter((v) => v.stage !== "published" && v.publish_date && v.publish_date < today);

  // Latest stats row per video.
  const latest = new Map<string, VideoStats>();
  for (const s of stats) if (!latest.has(s.video_id)) latest.set(s.video_id, s);
  const latestRows = [...latest.values()];
  const totalViews = latestRows.reduce((s, r) => s + (r.views ?? 0), 0);
  const ctrs = latestRows.map((r) => r.ctr).filter((x): x is number => x !== null).map(Number);
  const avgCtr = ctrs.length ? ctrs.reduce((a, b) => a + b, 0) / ctrs.length : null;

  const longVideos = videos.filter((v) => v.kind === "long");
  const stageCounts = STAGES.map((s) => ({ ...s, count: longVideos.filter((v) => v.stage === s.id).length }));

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p className="muted" style={{ margin: 0 }}>
            Day {day} of 90{day > 90 ? " (plan complete: time for the next 90)" : ""} · Goal: {settings?.goal}
          </p>
        </div>
        <div className="row">
          <Link className="btn" href="/leads">+ Lead</Link>
          <Link className="btn btn-primary" href="/studio">✧ AI Studio</Link>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="spread" style={{ marginBottom: 8 }}>
          <strong>90-day progress</strong>
          <span className="small muted">Week {Math.min(13, Math.ceil(day / 7))} of 13</span>
        </div>
        <div className="progress"><span style={{ width: `${Math.min(100, (day / 90) * 100)}%` }} /></div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 16 }}>
        {MILESTONES.map((m) => {
          const [lo, hi] = m.targets[phase];
          const value = actual[m.key];
          // Judge progress pro-rata: by day 15 of a 30-day phase, half the target is on track.
          // Monthly metrics (enquiries) are judged against the month so far.
          const phaseEnd = (phase + 1) * 30;
          const share = m.key === "enquiries" ? Number(today.slice(8, 10)) / 30 : Math.min(1, day / phaseEnd);
          const expected = Math.floor(lo * share);
          const tone = value >= expected ? "green" : value >= expected * 0.5 ? "amber" : "red";
          return (
            <div className="card" key={m.key}>
              <div className="stat-label">{m.label}</div>
              <div className="stat-value">{value}</div>
              <div className="stat-sub">
                <span className={`dot dot-${tone}`} />
                {phaseLabel} target: {lo === hi ? lo : `${lo}–${hi}`}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h2>This week</h2>
          {overdue.length > 0 && (
            <p className="notice notice-warn small">
              {overdue.length} video{overdue.length > 1 ? "s are" : " is"} past the publish date and not marked published.{" "}
              <Link href="/calendar">Open calendar</Link>
            </p>
          )}
          {dueThisWeek.length === 0 ? (
            <p className="muted">Nothing scheduled this week. <Link href="/calendar">Schedule a video</Link>.</p>
          ) : (
            <div className="stack" style={{ gap: 8 }}>
              {dueThisWeek.map((v) => (
                <Link key={v.id} href={`/videos/${v.id}`} className="vcard" style={{ margin: 0 }}>
                  <div className="spread">
                    <span className="vcard-title" style={{ margin: 0 }}>{v.title}</span>
                    <span className={`badge ${v.stage === "published" ? "badge-green" : "badge-accent"}`}>{v.stage}</span>
                  </div>
                  <div className="small muted">{v.kind === "short" ? "Short" : "Long video"} · {formatDate(v.publish_date, { weekday: "short", day: "numeric", month: "short" })}</div>
                </Link>
              ))}
            </div>
          )}
          <h3 style={{ marginTop: 18 }}>Weekly rhythm</h3>
          <table className="small">
            <tbody>
              <tr><td>Mon</td><td>Brief + script · 15-min weekly review</td></tr>
              <tr><td>Tue</td><td>Record, edit, publish long video at 12:00</td></tr>
              <tr><td>Wed</td><td>Cut 3 Shorts · Short #1 at 07:30</td></tr>
              <tr><td>Thu</td><td>Repurpose to LinkedIn, Facebook groups, newsletter</td></tr>
              <tr><td>Fri / Sun</td><td>Short #2 at 12:00 · Short #3 at 19:00</td></tr>
            </tbody>
          </table>
        </div>

        <div className="stack">
          <div className="card">
            <h2>Coming up</h2>
            {upcoming.length === 0 ? (
              <p className="muted">No future videos scheduled.</p>
            ) : (
              <table>
                <tbody>
                  {upcoming.map((v) => (
                    <tr key={v.id}>
                      <td className="small muted" style={{ whiteSpace: "nowrap" }}>{formatDate(v.publish_date)}</td>
                      <td><Link href={`/videos/${v.id}`}>{v.title}</Link></td>
                      <td><span className="badge">{v.stage}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="card">
            <h2>Pipeline</h2>
            <div className="row" style={{ gap: 6 }}>
              {stageCounts.map((s) => (
                <Link key={s.id} href="/videos" className="badge" style={{ textDecoration: "none" }}>
                  {s.label}: {s.count}
                </Link>
              ))}
            </div>
          </div>
          <div className="card">
            <h2>Results so far</h2>
            <div className="grid grid-3">
              <div><div className="stat-label">Views tracked</div><div className="stat-value">{totalViews.toLocaleString("en-GB")}</div></div>
              <div>
                <div className="stat-label">Avg CTR</div>
                <div className="stat-value"><span className={`dot dot-${rate("ctr", avgCtr)}`} />{avgCtr === null ? "—" : `${avgCtr.toFixed(1)}%`}</div>
              </div>
              <div><div className="stat-label">Revenue won</div><div className="stat-value">£{revenue.toLocaleString("en-GB")}</div></div>
            </div>
            <p className="small muted" style={{ marginTop: 10, marginBottom: 0 }}>
              Fix order when behind: CTR → first 30 seconds → pacing → subscribers → lead conversion. <Link href="/analytics">Analytics</Link>
            </p>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2>Pillar mix (long videos)</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Pillar</th><th className="num">Target</th><th className="num">Planned</th><th className="num">Published</th><th>Leads to</th></tr></thead>
            <tbody>
              {Object.entries(PILLARS).map(([n, p]) => (
                <tr key={n}>
                  <td>{n}. {p.name}</td>
                  <td className="num">{p.share}</td>
                  <td className="num">{longVideos.filter((v) => v.pillar === Number(n)).length}</td>
                  <td className="num">{longVideos.filter((v) => v.pillar === Number(n) && v.stage === "published").length}</td>
                  <td className="small muted">{p.lead}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
