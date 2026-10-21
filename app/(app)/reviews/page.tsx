import Link from "next/link";
import { createReview, deleteReview } from "@/app/actions";
import { ConfirmButton } from "@/components/ConfirmButton";
import { Markdown } from "@/components/Markdown";
import { SubmitButton } from "@/components/SubmitButton";
import { formatDate, todayISO, weekStart } from "@/lib/dates";
import { requireUser } from "@/lib/supabase/server";
import type { Review } from "@/lib/types";

export default async function ReviewsPage() {
  const { supabase } = await requireUser();
  const { data } = await supabase.from("reviews").select("*").order("period_start", { ascending: false }).order("created_at", { ascending: false });
  const reviews = (data ?? []) as Review[];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Reviews</h1>
          <p className="muted" style={{ margin: 0 }}>Weekly: 15 minutes every Monday. Monthly: 45 minutes, first Monday. Small fixes add up.</p>
        </div>
        <Link href="/analytics" className="btn btn-primary">✧ AI review of my numbers</Link>
      </div>

      <form action={createReview} className="card">
        <h2>New review</h2>
        <div className="grid grid-3">
          <div className="field">
            <label htmlFor="kind">Type</label>
            <select id="kind" name="kind" defaultValue="weekly"><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select>
          </div>
          <div className="field"><label htmlFor="period_start">Week / month starting</label><input id="period_start" name="period_start" type="date" defaultValue={weekStart(todayISO())} /></div>
        </div>
        <div className="grid grid-2">
          <div className="field">
            <label htmlFor="fix_this">One thing to fix</label>
            <textarea id="fix_this" name="fix_this" rows={3} placeholder="First red in this order: CTR → first 30 s → pacing → subscribers → leads" />
          </div>
          <div className="field"><label htmlFor="repeat_this">One thing to repeat</label><textarea id="repeat_this" name="repeat_this" rows={3} /></div>
        </div>
        <div className="field">
          <label htmlFor="notes">Notes</label>
          <textarea id="notes" name="notes" rows={4} placeholder={"Biggest drop-off and why · best comment (future video?) · thumbnail test result\nMonthly: top 3 by leads, the pattern, 2 more like it next month, bottom 3 fixes, stop/start/keep"} />
        </div>
        <div className="field"><label htmlFor="ai_analysis">AI analysis (paste from Analytics → Review with AI)</label><textarea id="ai_analysis" name="ai_analysis" rows={3} /></div>
        <SubmitButton>Save review</SubmitButton>
      </form>

      {reviews.length === 0 ? <div className="card empty">No reviews yet. Do the first one next Monday.</div> : reviews.map((r) => (
        <details key={r.id} className="card">
          <summary>
            <span className={`badge ${r.kind === "monthly" ? "badge-accent" : ""}`}>{r.kind}</span>{" "}
            {formatDate(r.period_start, { day: "numeric", month: "long", year: "numeric" })}
            {r.fix_this && <span className="muted small"> · Fix: {r.fix_this.slice(0, 80)}</span>}
          </summary>
          <div className="grid grid-2" style={{ marginTop: 12 }}>
            <div><h3>Fix</h3><p>{r.fix_this ?? "—"}</p></div>
            <div><h3>Repeat</h3><p>{r.repeat_this ?? "—"}</p></div>
          </div>
          {r.notes && <><h3>Notes</h3><p style={{ whiteSpace: "pre-wrap" }}>{r.notes}</p></>}
          {r.ai_analysis && <><h3>AI analysis</h3><Markdown source={r.ai_analysis} /></>}
          <form action={deleteReview.bind(null, r.id)}><ConfirmButton message="Delete this review?">Delete</ConfirmButton></form>
        </details>
      ))}
    </>
  );
}
