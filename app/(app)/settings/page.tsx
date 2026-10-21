import { saveSettings, seedStarterKit } from "@/app/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { DEFAULT_CONTEXT } from "@/lib/default-context";
import { todayISO } from "@/lib/dates";
import { requireUser } from "@/lib/supabase/server";
import { MODEL } from "@/lib/ai";

export default async function SettingsPage() {
  const { supabase } = await requireUser();
  const [{ data: settings }, { count }] = await Promise.all([
    supabase.from("channel_settings").select("*").maybeSingle(),
    supabase.from("videos").select("id", { count: "exact", head: true }),
  ]);
  const hasKey = !!process.env.ANTHROPIC_API_KEY;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Settings</h1>
          <p className="muted" style={{ margin: 0 }}>Channel details and the context every AI tool uses.</p>
        </div>
      </div>

      <form action={saveSettings} className="card">
        <div className="grid grid-3">
          <div className="field"><label htmlFor="channel_name">Channel name</label><input id="channel_name" name="channel_name" defaultValue={settings?.channel_name ?? "Wirral AI"} /></div>
          <div className="field">
            <label htmlFor="start_date">90-day plan start</label>
            <input id="start_date" name="start_date" type="date" defaultValue={settings?.start_date ?? todayISO()} />
            <div className="hint">Drives the calendar weeks and day count.</div>
          </div>
          <div className="field"><label htmlFor="weekly_hours">Hours per week</label><input id="weekly_hours" name="weekly_hours" type="number" defaultValue={settings?.weekly_hours ?? 5} /></div>
        </div>
        <div className="field"><label htmlFor="goal">Goal</label><input id="goal" name="goal" defaultValue={settings?.goal ?? "10 qualified enquiries per month from YouTube by day 90"} /></div>
        <div className="field">
          <label htmlFor="context">Channel context (sent to the AI with every request)</label>
          <textarea id="context" name="context" rows={18} defaultValue={settings?.context || DEFAULT_CONTEXT} />
          <div className="hint">Update this when your offer, audience, CTAs or tone change; every tool picks it up.</div>
        </div>
        <SubmitButton>Save settings</SubmitButton>
      </form>

      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <h2>AI</h2>
          <p className="small">
            Model: <code>{MODEL}</code><br />
            API key: {hasKey ? <span className="badge badge-green">set</span> : <span className="badge badge-red">missing: add ANTHROPIC_API_KEY in Vercel</span>}
          </p>
        </div>
        <div className="card">
          <h2>Starter kit</h2>
          {(count ?? 0) > 0 ? (
            <p className="small muted">Loaded. To reload it, delete all videos first.</p>
          ) : (
            <form action={seedStarterKit}><SubmitButton pendingText="Loading…">Load the Wirral AI starter kit</SubmitButton></form>
          )}
        </div>
      </div>
    </>
  );
}
