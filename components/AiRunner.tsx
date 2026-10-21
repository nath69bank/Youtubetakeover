"use client";

import { useRef, useState } from "react";
import { setVideoField } from "@/app/actions";
import { getTool } from "@/lib/tools";
import { Markdown } from "./Markdown";

type SaveTarget = { label: string; field: Parameters<typeof setVideoField>[1] };

export function AiRunner({
  toolId,
  initialValues = {},
  videoId = null,
  saveTargets = [],
  hideFields = [],
  onOutput,
}: {
  toolId: string;
  initialValues?: Record<string, string>;
  videoId?: string | null;
  saveTargets?: SaveTarget[];
  hideFields?: string[];
  onOutput?: (text: string) => void;
}) {
  const tool = getTool(toolId)!;
  const [values, setValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    for (const f of tool.fields) v[f.name] = initialValues[f.name] ?? f.defaultValue ?? "";
    return v;
  });
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Hidden fields always use the latest value from the page (e.g. the saved script).
  const inputs = () => ({ ...values, ...Object.fromEntries(hideFields.map((f) => [f, initialValues[f] ?? ""])) });

  async function run() {
    setRunning(true);
    setOutput("");
    setStatus("Thinking…");
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: tool.id, inputs: inputs(), videoId }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: `Request failed (${res.status})` }));
        setStatus(null);
        setOutput(`> ⚠️ ${err.error}`);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setOutput(text);
        setStatus(null);
      }
      onOutput?.(text);
      setStatus("Saved to AI history.");
    } catch (e) {
      setStatus(e instanceof DOMException && e.name === "AbortError" ? "Stopped." : "Something went wrong. Try again.");
    } finally {
      setRunning(false);
      abortRef.current = null;
    }
  }

  async function copy(text: string, what: string) {
    await navigator.clipboard.writeText(text);
    setStatus(`${what} copied.`);
  }

  async function save(target: SaveTarget) {
    if (!videoId) return;
    await setVideoField(videoId, target.field, output);
    setStatus(`Saved to ${target.label.toLowerCase()}.`);
  }

  const visible = tool.fields.filter((f) => !hideFields.includes(f.name));

  return (
    <div className="stack">
      {visible.length > 0 && (
        <div className="grid grid-2">
          {visible.map((f) => (
            <div key={f.name} className="field" style={{ gridColumn: f.type === "textarea" ? "1 / -1" : undefined, marginBottom: 0 }}>
              <label htmlFor={`${tool.id}-${f.name}`}>{f.label}</label>
              {f.type === "textarea" ? (
                <textarea id={`${tool.id}-${f.name}`} rows={f.rows ?? 3} value={values[f.name]} placeholder={f.placeholder}
                  onChange={(e) => setValues({ ...values, [f.name]: e.target.value })} />
              ) : f.type === "select" ? (
                <select id={`${tool.id}-${f.name}`} value={values[f.name]} onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}>
                  {f.options!.map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input id={`${tool.id}-${f.name}`} value={values[f.name]} placeholder={f.placeholder}
                  onChange={(e) => setValues({ ...values, [f.name]: e.target.value })} />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="row">
        {running ? (
          <button onClick={() => abortRef.current?.abort()}>Stop</button>
        ) : (
          <button className="btn-primary" onClick={run}>✧ Generate</button>
        )}
        <button className="btn-ghost" onClick={() => copy(tool.build(inputs()), "Prompt")} title="Copy the prompt to use in Claude yourself">
          Copy prompt
        </button>
        {status && <span className="small muted">{status}</span>}
      </div>

      {output && (
        <>
          <div className="ai-output"><Markdown source={output} /></div>
          {!running && (
            <div className="row">
              <button className="btn-sm" onClick={() => copy(output, "Output")}>Copy output</button>
              {videoId && saveTargets.map((t) => (
                <button key={t.field} className="btn-sm" onClick={() => save(t)}>Save to {t.label}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
