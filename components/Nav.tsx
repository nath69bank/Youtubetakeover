"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/app/actions";

const LINKS = [
  { href: "/", label: "Dashboard", icon: "◧" },
  { href: "/videos", label: "Videos", icon: "▶" },
  { href: "/calendar", label: "Calendar", icon: "▦" },
  { href: "/ideas", label: "Ideas bank", icon: "✦" },
  { href: "/studio", label: "AI Studio", icon: "✧" },
  { href: "/analytics", label: "Analytics", icon: "↗" },
  { href: "/leads", label: "Leads", icon: "◎" },
  { href: "/funnel", label: "Funnel", icon: "⌄" },
  { href: "/reviews", label: "Reviews", icon: "☑" },
  { href: "/playbook", label: "Playbook", icon: "❐" },
  { href: "/settings", label: "Settings", icon: "⚙" },
];

export function Nav({ channelName, email }: { channelName: string; email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <div className="topbar">
        <button className="btn-sm" onClick={() => setOpen(true)} aria-label="Open menu">☰</button>
        <strong>{channelName}</strong>
      </div>
      <aside className={`sidebar${open ? " open" : ""}`}>
        <div className="spread">
          <div className="brand">{channelName}</div>
          {open && <button className="btn-sm btn-ghost" onClick={() => setOpen(false)} aria-label="Close menu">✕</button>}
        </div>
        <div className="brand-sub">YouTube studio</div>
        <nav>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={`nav-link${active(l.href) ? " active" : ""}`} onClick={() => setOpen(false)}>
              <span className="nav-icon" aria-hidden>{l.icon}</span>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="small muted" style={{ padding: "0 8px 8px", overflowWrap: "anywhere" }}>{email}</div>
          <form action={signOut}>
            <button className="btn-sm btn-ghost" type="submit">Sign out</button>
          </form>
        </div>
      </aside>
    </>
  );
}
