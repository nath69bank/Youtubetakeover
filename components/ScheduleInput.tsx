"use client";

import { useTransition } from "react";
import { setVideoField } from "@/app/actions";

export function ScheduleInput({ videoId, value }: { videoId: string; value: string | null }) {
  const [pending, start] = useTransition();
  return (
    <input
      type="date"
      aria-label="Publish date"
      defaultValue={value ?? ""}
      disabled={pending}
      style={{ width: "auto" }}
      onChange={(e) => {
        const v = e.target.value || null;
        start(() => setVideoField(videoId, "publish_date", v));
      }}
    />
  );
}
