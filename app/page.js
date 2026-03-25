"use client";
import Link from "next/link";
import RoastForm from "./components/RoastForm";
import { useLanguage } from "./lib/LanguageContext";
import { useTheme } from "./lib/ThemeContext";

export default function Home() {
  const { t, lang, setLang } = useLanguage();
  const { theme, changeTheme, mounted } = useTheme();

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <header
        className="border-b px-4 py-3"
        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center
                            justify-center text-sm">🔥</div>
            <span className="font-medium" style={{ color: "var(--text)" }}>
              {t.appName}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {mounted && (
              <div className="flex gap-1">
                {[
                  { key: "light", icon: "☀️" },
                  { key: "grey", icon: "🌥️" },
                  { key: "dark", icon: "🌙" },
                ].map((th) => (
                  <button
                    key={th.key}
                    onClick={() => changeTheme(th.key)}
                    className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                      theme === th.key
                        ? "bg-orange-100 text-orange-700 font-medium"
                        : ""
                    }`}
                    style={theme !== th.key ? { color: "var(--text-muted)" } : {}}
                  >
                    {th.icon}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-1">
              {["vi", "en", "ja"].map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                    lang === l
                      ? "bg-orange-100 text-orange-700 font-medium"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {l === "vi" ? "VN" : l === "en" ? "EN" : "JP"}
                </button>
              ))}
            </div>
            <Link href="/feed" className="text-sm text-orange-500 hover:underline">
              {t.viewFeed}
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-xl mx-auto px-4 pt-10 pb-6 text-center">
        <h1 className="text-2xl font-medium mb-2" style={{ color: "var(--text)" }}>
          {t.hero}
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {t.heroSub}
        </p>
      </section>

      <section className="max-w-xl mx-auto px-4 pb-10">
        <RoastForm />
      </section>
    </main>
  );
}