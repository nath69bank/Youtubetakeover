import { deleteMagnet, saveMagnet } from "@/app/actions";
import { ConfirmButton } from "@/components/ConfirmButton";
import { CopyButton } from "@/components/CopyButton";
import { Markdown } from "@/components/Markdown";
import { SubmitButton } from "@/components/SubmitButton";
import { UtmBuilder } from "@/components/UtmBuilder";
import { readPlaybook } from "@/lib/playbook";
import { requireUser } from "@/lib/supabase/server";
import type { LeadMagnet } from "@/lib/types";

function MagnetForm({ magnet }: { magnet?: LeadMagnet }) {
  return (
    <form action={saveMagnet.bind(null, magnet?.id ?? null)} className="stack" style={{ marginTop: 10 }}>
      <div className="grid grid-3">
        <div><label>Name</label><input name="name" defaultValue={magnet?.name} required /></div>
        <div><label>Format</label><input name="format" defaultValue={magnet?.format ?? ""} /></div>
        <div>
          <label>Status</label>
          <select name="status" defaultValue={magnet?.status ?? "planned"}>
            <option value="planned">Planned</option><option value="building">Building</option><option value="live">Live</option>
          </select>
        </div>
      </div>
      <div><label>Landing page / link</label><input name="url" defaultValue={magnet?.url ?? ""} placeholder="https://www.wirral.ai/free/…" /></div>
      <div><label>Description</label><textarea name="description" rows={2} defaultValue={magnet?.description ?? ""} /></div>
      <div><label>CTA line to say on camera</label><textarea name="cta_line" rows={2} defaultValue={magnet?.cta_line ?? ""} /></div>
      <div><SubmitButton>{magnet ? "Save" : "Add lead magnet"}</SubmitButton></div>
    </form>
  );
}

export default async function FunnelPage() {
  const { supabase } = await requireUser();
  const [{ data }, { data: leadRows }, ctaDoc, descDoc] = await Promise.all([
    supabase.from("lead_magnets").select("*").order("created_at"),
    supabase.from("leads").select("lead_magnet_id"),
    readPlaybook("funnel/cta-scripts.md"),
    readPlaybook("funnel/description-template.md"),
  ]);
  const magnets = (data ?? []) as LeadMagnet[];
  const leadsBy = new Map<string, number>();
  for (const r of leadRows ?? []) if (r.lead_magnet_id) leadsBy.set(r.lead_magnet_id, (leadsBy.get(r.lead_magnet_id) ?? 0) + 1);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Funnel</h1>
          <p className="muted" style={{ margin: 0 }}>Video → free resource or check → newsletter/WhatsApp → free conversation → fixed-price first piece of work.</p>
        </div>
      </div>

      <div className="card">
        <h2>Lead magnets</h2>
        <div className="stack">
          {magnets.map((m) => (
            <details key={m.id} className="card" style={{ margin: 0 }}>
              <summary>
                {m.name}{" "}
                <span className={`badge ${m.status === "live" ? "badge-green" : m.status === "building" ? "badge-amber" : ""}`}>{m.status}</span>{" "}
                <span className="small muted">· {leadsBy.get(m.id) ?? 0} leads</span>
              </summary>
              {m.cta_line && <div className="row small" style={{ marginTop: 10 }}><em style={{ flex: 1 }}>“{m.cta_line}”</em><CopyButton text={m.cta_line} label="Copy CTA" /></div>}
              <MagnetForm magnet={m} />
              <form action={deleteMagnet.bind(null, m.id)} style={{ marginTop: 8 }}><ConfirmButton message="Delete this lead magnet?">Delete</ConfirmButton></form>
            </details>
          ))}
          <details className="card" style={{ margin: 0 }}>
            <summary>+ New lead magnet</summary>
            <MagnetForm />
          </details>
        </div>
      </div>

      <div className="card">
        <h2>Tracked link builder</h2>
        <UtmBuilder />
      </div>

      <div className="grid grid-2" style={{ alignItems: "start", marginTop: 16 }}>
        <details className="card" open>
          <summary>CTA scripts</summary>
          {ctaDoc && <div style={{ marginTop: 10 }}><Markdown source={ctaDoc} /></div>}
        </details>
        <details className="card" open>
          <summary>Description & pinned comment template</summary>
          {descDoc && <div style={{ marginTop: 10 }}><Markdown source={descDoc} /></div>}
        </details>
      </div>
    </>
  );
}
