import Link from "next/link";
import { ScheduleInput } from "@/components/ScheduleInput";
import { PILLARS } from "@/lib/constants";
import { addDays, formatDate, todayISO, weekStart } from "@/lib/dates";
import { requireUser } from "@/lib/supabase/server";
import type { Video } from "@/lib/types";

// "Other task" column of the 13-week plan (strategy/01-90-day-plan.md).
const WEEK_TASKS = [
  "Channel setup, trailer",
  "Lead magnet #1 live (AI Readiness Checklist)",
  "Join 5 local business FB/LinkedIn groups",
  "Day-30 review · lead magnet #2 (Website Check)",
  "Start newsletter (monthly)",
  "Ask the featured business to share",
  "Embed videos on matching wirral.ai pages",
  "Day-60 review · retitle weakest 3 videos",
  "First sector video planned",
  "Lead magnet #3 (AI Policy Template)",
  "First live Q&A or LinkedIn Live",
  "Plan the next 90 days",
  "Day-90 review",
];

export default async function CalendarPage() {
  const { supabase } = await requireUser();
  const [{ data: settings }, { data }] = await Promise.all([
    supabase.from("channel_settings").select("start_date").maybeSingle(),
    supabase.from("videos").select("id, kind, title, stage, publish_date, pillar, number").order("publish_date", { nullsFirst: false }),
  ]);
  const videos = (data ?? []) as Video[];
  const today = todayISO();
  const firstWeek = weekStart(settings?.start_date ?? today);
  const thisWeek = weekStart(today);
  const planEnd = addDays(firstWeek, 13 * 7);

  const weeks = Array.from({ length: 13 }, (_, i) => {
    const from = addDays(firstWeek, i * 7);
    const to = addDays(from, 7);
    return { n: i + 1, from, items: videos.filter((v) => v.publish_date && v.publish_date >= from && v.publish_date < to) };
  });
  const later = videos.filter((v) => v.publish_date && v.publish_date >= planEnd);
  const unscheduled = videos.filter((v) => !v.publish_date && v.stage !== "published");

  const item = (v: Video) => (
    <div key={v.id} className="spread" style={{ padding: "3px 0" }}>
      <span>
        <span className={`badge ${v.kind === "short" ? "" : "badge-accent"}`} style={{ marginRight: 6 }}>{v.kind === "short" ? "Short" : "Long"}</span>
        <Link href={`/videos/${v.id}`}>{v.title}</Link>
        <span className="small muted"> · {formatDate(v.publish_date, { weekday: "short", day: "numeric" })}</span>
      </span>
      <span className={`badge ${v.stage === "published" ? "badge-green" : v.publish_date! < today ? "badge-red" : ""}`}>{v.stage}</span>
    </div>
  );

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Calendar</h1>
          <p className="muted" style={{ margin: 0 }}>The 13-week plan. Long video every Tuesday, Shorts Wed/Fri/Sun. Change the start date in Settings.</p>
        </div>
      </div>
      <div className="card">
        {weeks.map((w) => (
          <div key={w.n} className={`cal-week${w.from === thisWeek ? " current" : ""}`}>
            <div>
              <strong>Week {w.n}</strong>
              <div className="small muted">{formatDate(w.from)}</div>
            </div>
            <div>
              {w.items.length === 0 ? <div className="small muted">Nothing scheduled</div> : w.items.map(item)}
              <div className="small muted" style={{ marginTop: 4 }}>☐ {WEEK_TASKS[w.n - 1]}</div>
            </div>
          </div>
        ))}
      </div>

      {later.length > 0 && (
        <div className="card">
          <h2>After week 13</h2>
          {later.map(item)}
        </div>
      )}

      <div className="card">
        <h2>Unscheduled ({unscheduled.length})</h2>
        {unscheduled.length === 0 ? <p className="muted">Everything has a date.</p> : (
          <div className="table-wrap">
            <table>
              <tbody>
                {unscheduled.map((v) => (
                  <tr key={v.id}>
                    <td><span className="badge">{v.kind === "short" ? "Short" : "Long"}</span></td>
                    <td><Link href={`/videos/${v.id}`}>{v.number ? `#${v.number} ` : ""}{v.title}</Link></td>
                    <td className="small muted">{v.pillar ? PILLARS[v.pillar]?.short : ""}</td>
                    <td><ScheduleInput videoId={v.id} value={v.publish_date} /></td>
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
