"use client";

import { useOptimistic, useTransition } from "react";
import { toggleChecklist } from "@/app/actions";
import { CHECKLIST, CHECKLIST_TOTAL } from "@/lib/constants";

export function Checklist({ videoId, checked }: { videoId: string; checked: Record<string, boolean> }) {
  const [state, setState] = useOptimistic(checked, (s, [k, v]: [string, boolean]) => ({ ...s, [k]: v }));
  const [, start] = useTransition();
  const done = Object.values(state).filter(Boolean).length;

  return (
    <div>
      <div className="spread" style={{ marginBottom: 8 }}>
        <strong>Pre-publish checklist</strong>
        <span className={`badge ${done === CHECKLIST_TOTAL ? "badge-green" : ""}`}>{done}/{CHECKLIST_TOTAL}</span>
      </div>
      <div className="progress" style={{ marginBottom: 12 }}><span style={{ width: `${(done / CHECKLIST_TOTAL) * 100}%` }} /></div>
      <div className="grid grid-2">
        {CHECKLIST.map((g) => (
          <div key={g.group}>
            <h3>{g.group}</h3>
            {g.items.map((item) => (
              <label key={item.id} className="check-row">
                <input
                  type="checkbox"
                  checked={!!state[item.id]}
                  onChange={(e) => {
                    const v = e.target.checked;
                    start(async () => {
                      setState([item.id, v]);
                      await toggleChecklist(videoId, item.id, v);
                    });
                  }}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
