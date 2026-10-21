export default function SetupPage() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 16 }}>
      <div className="card" style={{ maxWidth: 560 }}>
        <h1>Almost there</h1>
        <p className="muted">The studio needs its environment variables before it can start.</p>
        <ol>
          <li>Create a free project at <a href="https://supabase.com">supabase.com</a>.</li>
          <li>In Supabase → SQL Editor, run <code>supabase/migrations/0001_init.sql</code> from the repo.</li>
          <li>In Vercel → Project → Settings → Environment Variables, add <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, <code>ANTHROPIC_API_KEY</code> and <code>ALLOWED_EMAILS</code>.</li>
          <li>Redeploy.</li>
        </ol>
        <p className="small muted">Full steps are in the repo README.</p>
      </div>
    </div>
  );
}
