import { LoginForm } from "./LoginForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 16 }}>
      <div className="card" style={{ width: "100%", maxWidth: 380 }}>
        <h1>YouTube Takeover</h1>
        <p className="muted">Sign in to your channel studio.</p>
        {error && <p className="notice notice-warn">{error}</p>}
        <LoginForm />
      </div>
    </div>
  );
}
