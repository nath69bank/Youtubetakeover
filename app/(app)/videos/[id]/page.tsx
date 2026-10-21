import Link from "next/link";
import { notFound } from "next/navigation";
import { addStats, createVideo, deleteStats, deleteVideo, updateVideo } from "@/app/actions";
import { AiRunner } from "@/components/AiRunner";
import { Checklist } from "@/components/Checklist";
import { ConfirmButton } from "@/components/ConfirmButton";
import { CopyButton } from "@/components/CopyButton";
import { Markdown } from "@/components/Markdown";
import { StageSelect } from "@/components/StageSelect";
import { SubmitButton } from "@/components/SubmitButton";
import { Tabs } from "@/components/Tabs";
import { FORMATS, PILLARS, rate, utmLink } from "@/lib/constants";
import { formatDate, todayISO } from "@/lib/dates";
import { requireUser } from "@/lib/supabase/server";
import { getTool } from "@/lib/tools";
import type { Generation, LeadMagnet, Video, VideoStats } from "@/lib/types";

function Field({ name, label, value, rows, hint, type = "text" }: { name: string; label: string; value: string | number | null; rows?: number; hint?: string; type?: string }) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      {rows ? (
        <textarea id={name} name={name} rows={rows} defaultValue={value ?? ""} />
      ) : (
        <input id={name} name={name} type={type} defaultValue={value ?? ""} />
      )}
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
}

const pct = (n: number | null) => (n === null ? "—" : `${Number(n).toFixed(1)}%`);
const avd = (s: number | null) => (s === null ? "—" : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`);

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireUser();
  const { data } = await supabase.from("videos").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const video = data as Video;

  const [{ data: statsData }, { data: childData }, { data: genData }, { data: magnetData }, { data: longData }, { data: parentData }, { count: leadCount }] =
    await Promise.all([
      supabase.from("video_stats").select("*").eq("video_id", id).order("period_end", { ascending: false }),
      supabase.from("videos").select("id, title, stage, hook, publish_date").eq("parent_id", id).order("created_at"),
      supabase.from("generations").select("*").eq("video_id", id).order("created_at", { ascending: false }).limit(20),
      supabase.from("lead_magnets").select("id, name, cta_line, url").order("created_at"),
      supabase.from("videos").select("id, title, number").eq("kind", "long").neq("id", id).order("number", { nullsFirst: false }),
      video.parent_id ? supabase.from("videos").select("id, title").eq("id", video.parent_id).maybeSingle() : Promise.resolve({ data: null }),
      supabase.from("leads").select("id", { count: "exact", head: true }).eq("source_video_id", id),
    ]);
  const stats = (statsData ?? []) as VideoStats[];
  const shorts = (childData ?? []) as Pick<Video, "id" | "title" | "stage" | "hook" | "publish_date">[];
  const generations = (genData ?? []) as Generation[];
  const magnets = (magnetData ?? []) as Pick<LeadMagnet, "id" | "name" | "cta_line" | "url">[];
  const longVideos = (longData ?? []) as Pick<Video, "id" | "title" | "number">[];
  const parent = parentData as { id: string; title: string } | null;

  const campaign = `v${String(video.number ?? video.id.slice(0, 6)).padStart(3, "0")}${video.kind === "short" ? "-s" : ""}`;
  const descLink = utmLink(campaign, "description");
  const pinnedLink = utmLink(campaign, "pinned");
  const save = updateVideo.bind(null, id);
  const isLong = video.kind === "long";
  const brief = [
    video.search_phrase && `Search phrase: ${video.search_phrase}`,
    video.audience && `Audience: ${video.audience}`,
    video.problem && `Problem: ${video.problem}`,
    video.promise && `Promise: ${video.promise}`,
    video.proof && `Proof/demo: ${video.proof}`,
    video.unique_angle && `Only-we-could-say: ${video.unique_angle}`,
    video.hook && `Hook draft: ${video.hook}`,
  ].filter(Boolean).join("\n");

  const briefTab = (
    <form action={save} className="card">
      <div className="grid grid-3">
        <Field name="title" label="Working title" value={video.title} />
        <Field name="number" label="Number" value={video.number} type="number" />
        <div className="field">
          <label htmlFor="pillar">Pillar</label>
          <select id="pillar" name="pillar" defaultValue={video.pillar ?? ""}>
            <option value="">—</option>
            {Object.entries(PILLARS).map(([n, p]) => <option key={n} value={n}>{n}. {p.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="format">Format</label>
          <select id="format" name="format" defaultValue={video.format ?? ""}>
            <option value="">—</option>
            {FORMATS.map((f) => <option key={f}>{f}</option>)}
          </select>
        </div>
        <Field name="publish_date" label="Publish date" value={video.publish_date} type="date" hint={isLong ? "Long videos go out Tuesdays 12:00" : "Shorts: Wed 07:30, Fri 12:00, Sun 19:00"} />
        <Field name="search_phrase" label="Search phrase" value={video.search_phrase} hint="Exact words people type (check YouTube autocomplete)" />
      </div>
      <div className="grid grid-2">
        <Field name="audience" label="Who is it for?" value={video.audience} rows={2} />
        <Field name="problem" label="The problem, in their words" value={video.problem} rows={2} />
        <Field name="promise" label="The promise: what they can do after" value={video.promise} rows={2} />
        <Field name="proof" label="Proof / demo we'll show" value={video.proof} rows={2} />
        <Field name="unique_angle" label="The bit only Wirral AI could say" value={video.unique_angle} rows={2} />
        <Field name="notes" label="Notes" value={video.notes} rows={2} />
      </div>
      <div className="grid grid-2">
        <div className="field">
          <label htmlFor="cta">Call to action (one only)</label>
          <input id="cta" name="cta" list="cta-options" defaultValue={video.cta ?? ""} />
          <datalist id="cta-options">
            {magnets.map((m) => <option key={m.id} value={m.name} />)}
            <option value="Free Website & Google Check (WhatsApp)" />
            <option value="Free first conversation" />
          </datalist>
        </div>
        <div className="field">
          <label htmlFor="next_video">Next video (end screen)</label>
          <input id="next_video" name="next_video" list="next-options" defaultValue={video.next_video ?? ""} />
          <datalist id="next-options">{longVideos.map((v) => <option key={v.id} value={v.title} />)}</datalist>
        </div>
      </div>
      <div className="spread">
        <SubmitButton>Save brief</SubmitButton>
        <span className="small muted">UTM campaign: <code>{campaign}</code></span>
      </div>
    </form>
  );

  const titlesTab = (
    <div className="grid grid-2" style={{ alignItems: "start" }}>
      <form action={save} className="card">
        <Field name="title_options" label="Title options (one per line)" value={video.title_options} rows={5} hint="Test the top 2–3 with YouTube's Test & Compare" />
        <Field name="thumbnail_ideas" label="Thumbnail concepts (max 4 words)" value={video.thumbnail_ideas} rows={3} />
        <Field name="hook" label="Hook (first 15 seconds)" value={video.hook} rows={4} />
        <SubmitButton>Save</SubmitButton>
      </form>
      <div className="card">
        <h2>✧ Generate titles, thumbnails & hooks</h2>
        <AiRunner toolId="video-titles" videoId={id} initialValues={{ idea: video.title, brief }} saveTargets={[{ label: "title options", field: "title_options" }]} />
      </div>
    </div>
  );

  const scriptTab = (
    <div className="stack">
      <div className="card">
        <h2>✧ Write the script</h2>
        <p className="small muted">Drafts are a starting point: rewrite them out loud in your own words before recording (the originality rule).</p>
        <AiRunner
          toolId="script"
          videoId={id}
          initialValues={{
            idea: video.title,
            minutes: isLong ? "10" : "0.5",
            brief,
            cta: video.cta ?? "",
            next: video.next_video ?? "",
          }}
          saveTargets={[{ label: "script", field: "script" }]}
        />
      </div>
      <form action={save} className="card">
        <div className="spread"><h2 style={{ margin: 0 }}>Script</h2>{video.script && <CopyButton text={video.script} />}</div>
        <div className="field" style={{ marginTop: 10 }}>
          <textarea name="script" className="code" rows={24} defaultValue={video.script ?? ""} aria-label="Script" />
        </div>
        <SubmitButton>Save script</SubmitButton>
      </form>
      {video.script && (
        <details className="card">
          <summary>Preview script</summary>
          <div style={{ marginTop: 12 }}><Markdown source={video.script} /></div>
        </details>
      )}
    </div>
  );

  const shortsTab = (
    <div className="grid grid-2" style={{ alignItems: "start" }}>
      <div className="card">
        <h2>Shorts from this video</h2>
        {shorts.length === 0 ? <p className="muted">No Shorts linked yet.</p> : (
          <table>
            <tbody>
              {shorts.map((s) => (
                <tr key={s.id}>
                  <td><Link href={`/videos/${s.id}`}>{s.title}</Link>{s.hook && <div className="small muted">“{s.hook}”</div>}</td>
                  <td><span className="badge">{s.stage}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <form action={createVideo} className="row" style={{ marginTop: 12 }}>
          <input type="hidden" name="kind" value="short" />
          <input type="hidden" name="parent_id" value={id} />
          <input type="hidden" name="pillar" value={video.pillar ?? ""} />
          <input name="title" placeholder="New Short title" required style={{ flex: 1, minWidth: 160 }} />
          <SubmitButton pendingText="Adding…">Add Short</SubmitButton>
        </form>
        <p className="small muted" style={{ marginTop: 10 }}>Formula: A = the tip · B = the mistake · C = the result. Set each Short&apos;s related video to this one.</p>
      </div>
      <div className="card">
        <h2>✧ Cut 3 Shorts from the script</h2>
        {video.script ? (
          <AiRunner toolId="shorts-from-video" videoId={id} initialValues={{ title: video.title, script: video.script }} hideFields={["script"]} />
        ) : (
          <p className="muted">Write or save the script first.</p>
        )}
      </div>
    </div>
  );

  const publishTab = (
    <div className="stack">
      <div className="grid grid-2" style={{ alignItems: "start" }}>
        <form action={save} className="card">
          <div className="field">
            <label>Tracked links</label>
            <div className="small" style={{ overflowWrap: "anywhere" }}><code>{descLink}</code> <CopyButton text={descLink} /></div>
            <div className="small" style={{ overflowWrap: "anywhere", marginTop: 6 }}><code>{pinnedLink}</code> <CopyButton text={pinnedLink} label="Copy pinned link" /></div>
          </div>
          <Field name="description" label="Description" value={video.description} rows={12} />
          <Field name="pinned_comment" label="Pinned comment" value={video.pinned_comment} rows={3} />
          <Field name="youtube_url" label="YouTube URL (once live)" value={video.youtube_url} />
          <SubmitButton>Save</SubmitButton>
        </form>
        <div className="card">
          <h2>✧ Generate the publish kit</h2>
          <AiRunner
            toolId="publish-kit"
            videoId={id}
            initialValues={{ title: video.title, script: video.script ?? brief, cta: video.cta ?? "", link: descLink, next: video.next_video ?? "" }}
            hideFields={["script"]}
            saveTargets={[{ label: "description", field: "description" }]}
          />
        </div>
      </div>
      <div className="card"><Checklist videoId={id} checked={video.checklist ?? {}} /></div>
    </div>
  );

  const addStatsForVideo = addStats.bind(null, id);
  const statsTab = (
    <div className="stack">
      <form action={addStatsForVideo} className="card">
        <h2>Add stats snapshot</h2>
        <p className="small muted">YouTube Studio → this video → Analytics → Advanced mode. Add a row at 7 days and 28 days.</p>
        <div className="grid grid-4">
          <Field name="period_end" label="As of" value={todayISO()} type="date" />
          <Field name="views" label="Views" value={null} type="number" />
          <Field name="impressions" label="Impressions" value={null} type="number" />
          <Field name="ctr" label="CTR %" value={null} />
          <Field name="avd" label="Avg view duration (m:ss)" value={null} />
          <Field name="pct_viewed" label="Avg % viewed" value={null} />
          <Field name="retention_30s" label="Retention at 30 s %" value={null} />
          <Field name="subs_gained" label="Subscribers gained" value={null} type="number" />
          <Field name="search_pct" label="Search traffic %" value={null} />
          <Field name="browse_pct" label="Browse + suggested %" value={null} />
          <Field name="link_clicks" label="Link clicks (UTM)" value={null} type="number" />
          <Field name="downloads" label="Lead magnet downloads" value={null} type="number" />
          <Field name="whatsapp_chats" label="WhatsApp chats" value={null} type="number" />
          <Field name="calls_booked" label="Calls booked" value={null} type="number" />
          <Field name="clients_won" label="Clients won" value={null} type="number" />
          <Field name="revenue_gbp" label="Revenue £" value={null} />
        </div>
        <Field name="notes" label="What changed? (e.g. new thumbnail on 12 Nov)" value={null} />
        <SubmitButton>Add snapshot</SubmitButton>
      </form>
      <div className="card">
        <h2>History</h2>
        {stats.length === 0 ? <p className="muted">No stats yet.</p> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>As of</th><th className="num">Views</th><th className="num">CTR</th><th className="num">AVD</th><th className="num">% viewed</th><th className="num">30 s</th><th className="num">Subs</th><th className="num">Subs/1k</th><th className="num">Clicks</th><th className="num">Leads</th><th>Notes</th><th></th></tr>
              </thead>
              <tbody>
                {stats.map((s) => {
                  const subsPer1k = s.views ? ((s.subs_gained ?? 0) / s.views) * 1000 : null;
                  const leads = (s.downloads ?? 0) + (s.whatsapp_chats ?? 0) + (s.calls_booked ?? 0);
                  return (
                    <tr key={s.id}>
                      <td>{formatDate(s.period_end)}</td>
                      <td className="num">{s.views?.toLocaleString("en-GB") ?? "—"}</td>
                      <td className="num"><span className={`dot dot-${rate("ctr", s.ctr)}`} />{pct(s.ctr)}</td>
                      <td className="num">{avd(s.avd_seconds)}</td>
                      <td className="num"><span className={`dot dot-${rate("pct_viewed", s.pct_viewed)}`} />{pct(s.pct_viewed)}</td>
                      <td className="num"><span className={`dot dot-${rate("retention_30s", s.retention_30s)}`} />{pct(s.retention_30s)}</td>
                      <td className="num">{s.subs_gained ?? "—"}</td>
                      <td className="num"><span className={`dot dot-${rate("subs_per_1k", subsPer1k)}`} />{subsPer1k === null ? "—" : subsPer1k.toFixed(1)}</td>
                      <td className="num">{s.link_clicks ?? "—"}</td>
                      <td className="num">{leads}</td>
                      <td className="small muted">{s.notes}</td>
                      <td>
                        <form action={deleteStats.bind(null, s.id, id)}><button className="btn-sm btn-ghost btn-danger" aria-label="Delete row">✕</button></form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="small muted" style={{ marginTop: 10, marginBottom: 0 }}>
          Leads attributed in the CRM: <strong>{leadCount ?? 0}</strong>. Benchmarks: CTR 3–6% ok, &gt;6% good · % viewed 25–40 ok · 30 s retention 50–65 ok · subs/1k 3–8 ok.
        </p>
      </div>
    </div>
  );

  const repurposeTab = (
    <div className="card">
      <h2>✧ Repurpose to LinkedIn, Facebook groups & newsletter</h2>
      {video.script ? (
        <AiRunner toolId="repurpose" videoId={id} initialValues={{ title: video.title, link: video.youtube_url ?? "", script: video.script }} hideFields={["script"]} />
      ) : (
        <p className="muted">Save the script (or paste the transcript into it) first.</p>
      )}
    </div>
  );

  const historyTab = (
    <div className="stack">
      {generations.length === 0 ? <div className="card empty">No AI output for this video yet.</div> : generations.map((g) => (
        <details key={g.id} className="card">
          <summary>{getTool(g.tool)?.name ?? g.tool} · <span className="muted small">{new Date(g.created_at).toLocaleString("en-GB")}</span></summary>
          <div className="row" style={{ marginTop: 10 }}><CopyButton text={g.output} label="Copy output" /></div>
          <div style={{ marginTop: 10 }}><Markdown source={g.output} /></div>
        </details>
      ))}
    </div>
  );

  const tabs = [
    { id: "brief", label: "Brief", content: briefTab },
    { id: "titles", label: "Titles & hook", content: titlesTab },
    { id: "script", label: "Script", content: scriptTab },
    ...(isLong ? [{ id: "shorts", label: `Shorts (${shorts.length})`, content: shortsTab }] : []),
    { id: "publish", label: "Publish", content: publishTab },
    { id: "stats", label: "Stats", content: statsTab },
    ...(isLong ? [{ id: "repurpose", label: "Repurpose", content: repurposeTab }] : []),
    { id: "history", label: `AI history (${generations.length})`, content: historyTab },
  ];

  return (
    <>
      <div className="page-head">
        <div style={{ minWidth: 0 }}>
          <div className="small muted">
            <Link href={`/videos${isLong ? "" : "?kind=short"}`}>← {isLong ? "Videos" : "Shorts"}</Link>
            {parent && <> · Short from <Link href={`/videos/${parent.id}`}>{parent.title}</Link></>}
          </div>
          <h1>{video.number ? `#${video.number} ` : ""}{video.title}</h1>
          <div className="row small muted" style={{ gap: 6 }}>
            {video.pillar && <span className="badge">{PILLARS[video.pillar]?.name}</span>}
            {video.format && <span className="badge">{video.format}</span>}
            <span>Publish: {formatDate(video.publish_date, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span>
            {video.youtube_url && <a href={video.youtube_url} target="_blank" rel="noopener noreferrer">Watch ↗</a>}
          </div>
        </div>
        <div className="row">
          <StageSelect videoId={id} stage={video.stage} />
          <form action={deleteVideo.bind(null, id)}>
            <ConfirmButton message="Delete this video and its stats?">Delete</ConfirmButton>
          </form>
        </div>
      </div>
      <Tabs tabs={tabs} />
    </>
  );
}
