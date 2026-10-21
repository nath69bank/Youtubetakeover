"use client";

import { useTransition } from "react";
import { updateLead } from "@/app/actions";
import { LEAD_STATUSES } from "@/lib/constants";

export function LeadStatus({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();
  return (
    <select aria-label="Status" value={status} disabled={pending} style={{ width: "auto", padding: "4px 8px" }}
      onChange={(e) => {
        const fd = new FormData();
        fd.set("status", e.target.value);
        start(() => updateLead(id, fd));
      }}>
      {LEAD_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
    </select>
  );
}
