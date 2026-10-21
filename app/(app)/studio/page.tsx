import Link from "next/link";
import { deleteGeneration } from "@/app/actions";
import { AiRunner } from "@/components/AiRunner";
import { ConfirmButton } from "@/components/ConfirmButton";
import { CopyButton } from "@/components/CopyButton";
import { Markdown } from "@/components/Markdown";
import { requireUser } from "@/lib/supabase/server";
import { TOOLS, TOOL_GROUPS, getTool } from "@/lib/tools";
import type { Generation } from "@/lib/types";

export default async function StudioPage({ searchParams }: { searchParams: Promise<{ tool?: string }> }) {
  const { tool: toolId } = await searchParams;
  const tool = getTool(toolId ?? "") ?? TOOLS[0];
  const { supabase } = await requireUser();
  const { data } = await supabase.from("generations").select("*").order("created_at", { ascending: false }).limit(25);
  const generations = (data ?? []) as Generation[];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>AI Studio</h1>
          <p className="muted" style={{ margin: 0 }}>The 10 playbook prompts plus production tools. Your channel context (Settings) is sent with every request.</p>
        </div>
      </div>

      <div className="grid split">
        <div className="card" style={{ padding: 10 }}>
          {(Object.keys(TOOL_GROUPS) as (keyof typeof TOOL_GROUPS)[]).map((g) => (
            <div key={g} style={{ marginBottom: 8 }}>
              <div className="stat-label" style={{ padding: "6px 8px" }}>{TOOL_GROUPS[g]}</div>
              {TOOLS.filter((t) => t.group === g).map((t) => (
                <Link key={t.id} href={`/studio?tool=${t.id}`} className={`nav-link${t.id === tool.id ? " active" : ""}`}>
                  {t.step ? <span className="badge" style={{ minWidth: 26, textAlign: "center" }}>{t.step}</span> : <span className="nav-icon">✧</span>}
                  <span>{t.name}</span>
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="stack" style={{ minWidth: 0 }}>
          <div className="card">
            <h2>{tool.step ? `${tool.step}. ` : ""}{tool.name}</h2>
            <p className="muted">{tool.summary}</p>
            <AiRunner key={tool.id} toolId={tool.id} />
          </div>

          <div className="card">
            <h2>Recent output</h2>
            {generations.length === 0 ? <p className="muted">Nothing generated yet.</p> : (
              <div className="stack" style={{ gap: 8 }}>
                {generations.map((g) => (
                  <details key={g.id}>
                    <summary>
                      {getTool(g.tool)?.name ?? g.tool}{" "}
                      <span className="small muted">· {new Date(g.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</span>
                      {g.video_id && <> · <Link href={`/videos/${g.video_id}#history`} className="small">video</Link></>}
                    </summary>
                    <div className="row" style={{ margin: "8px 0" }}>
                      <CopyButton text={g.output} label="Copy output" />
                      <form action={deleteGeneration.bind(null, g.id)}><ConfirmButton message="Delete this output?">Delete</ConfirmButton></form>
                    </div>
                    <div className="ai-output"><Markdown source={g.output} /></div>
                  </details>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
