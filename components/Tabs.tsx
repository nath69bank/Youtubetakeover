"use client";

import { useEffect, useState } from "react";

// Tabbed panels; the open tab is kept in the URL hash so reloads and links land on it.
export function Tabs({ tabs }: { tabs: { id: string; label: string; content: React.ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0].id);
  useEffect(() => {
    const fromHash = window.location.hash.slice(1);
    if (tabs.some((t) => t.id === fromHash)) setActive(fromHash);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- read the hash once on mount
  const select = (id: string) => {
    setActive(id);
    history.replaceState(null, "", `#${id}`);
  };
  return (
    <>
      <div className="tabs" role="tablist">
        {tabs.map((t) => (
          <button key={t.id} role="tab" aria-selected={active === t.id} className={`tab${active === t.id ? " active" : ""}`} onClick={() => select(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div key={t.id} role="tabpanel" hidden={active !== t.id}>{t.content}</div>
      ))}
    </>
  );
}
