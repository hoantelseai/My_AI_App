import { supabase } from "../lib/supabase";
import FeedClient from "./FeedClient";
import Link from "next/link";

export const revalidate = 0;

export default async function FeedPage() {
  const { data: roasts } = await supabase
    .from("roasts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <header className="border-b px-4 py-3"
        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center
                            justify-center text-sm">
              🔥
            </div>
            <span className="font-medium" style={{ color: "var(--text)" }}>
              Roast My Work
            </span>
          </div>
          <Link href="/" className="text-sm text-orange-500 hover:underline">
            + Roast mới
          </Link>
        </div>
      </header>

      <section className="max-w-xl mx-auto px-4 py-6">
        <FeedClient roasts={roasts ?? []} />
      </section>
    </main>
  );
}