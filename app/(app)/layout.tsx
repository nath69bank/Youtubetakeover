import { Nav } from "@/components/Nav";
import { requireUser } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireUser();
  const { data: settings } = await supabase.from("channel_settings").select("channel_name").maybeSingle();
  return (
    <div className="shell">
      <Nav channelName={settings?.channel_name ?? "Wirral AI"} email={user.email ?? ""} />
      <main className="main">
        <div className="page">{children}</div>
      </main>
    </div>
  );
}
