"use client";

import { useState } from "react";
import { CONTACT, utmLink } from "@/lib/constants";
import { CopyButton } from "./CopyButton";

export function UtmBuilder() {
  const [base, setBase] = useState(CONTACT.website);
  const [campaign, setCampaign] = useState("v001");
  const [medium, setMedium] = useState("description");
  let link = "";
  try {
    link = utmLink(campaign || "v000", medium, base);
  } catch {
    link = "Enter a full URL starting with https://";
  }
  return (
    <div className="stack">
      <div className="grid grid-3">
        <div><label htmlFor="utm-base">Page</label><input id="utm-base" value={base} onChange={(e) => setBase(e.target.value)} /></div>
        <div><label htmlFor="utm-campaign">Campaign (video)</label><input id="utm-campaign" value={campaign} onChange={(e) => setCampaign(e.target.value)} /></div>
        <div>
          <label htmlFor="utm-medium">Placement</label>
          <select id="utm-medium" value={medium} onChange={(e) => setMedium(e.target.value)}>
            <option value="description">Description</option>
            <option value="pinned">Pinned comment</option>
            <option value="card">Card</option>
            <option value="short">Short</option>
            <option value="channel">Channel page</option>
          </select>
        </div>
      </div>
      <div className="row small" style={{ overflowWrap: "anywhere" }}><code style={{ flex: 1 }}>{link}</code><CopyButton text={link} /></div>
    </div>
  );
}
