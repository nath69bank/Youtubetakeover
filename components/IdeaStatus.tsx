"use client";

import { useTransition } from "react";
import { setIdeaStatus } from "@/app/actions";
import { IDEA_STATUSES } from "@/lib/constants";

export function IdeaStatus({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();
  return (
    <select aria-label="Status" value={status} disabled={pending} style={{ width: "auto", padding: "4px 8px" }}
      onChange={(e) => { const v = e.target.value; start(() => setIdeaStatus(id, v)); }}>
      {IDEA_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
    </select>
  );
}
