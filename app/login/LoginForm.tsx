"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const supabase = createClient();
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else {
        router.replace("/");
        router.refresh();
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) setMessage(error.message);
      else if (data.session) {
        router.replace("/");
        router.refresh();
      } else setMessage("Check your email to confirm your account, then sign in.");
    }
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="stack" style={{ marginTop: 12 }}>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input id="password" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} required minLength={8}
          value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {message && <p className="small" style={{ margin: 0 }}>{message}</p>}
      <button className="btn-primary" type="submit" disabled={busy}>
        {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
      </button>
      <button type="button" className="btn-ghost btn-sm" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
        {mode === "signin" ? "First time? Create your account" : "Have an account? Sign in"}
      </button>
    </form>
  );
}
