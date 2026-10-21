"use client";

import { useTransition } from "react";
import { setVideoField } from "@/app/actions";
import { STAGES } from "@/lib/constants";

export function StageSelect({ videoId, stage }: { videoId: string; stage: string }) {
  const [pending, start] = useTransition();
  return (
    <select
      aria-label="Stage"
      value={stage}
      disabled={pending}
      style={{ width: "auto" }}
      onChange={(e) => {
        const v = e.target.value;
        start(() => setVideoField(videoId, "stage", v));
      }}
    >
      {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
    </select>
  );
}
