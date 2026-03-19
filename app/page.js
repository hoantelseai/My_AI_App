"use client";
import Link from "next/link";
import RoastForm from "./components/RoastForm";
import { useLanguage } from "./lib/LanguageContext";

export default function Home() {
  const { t, lang, setLang } = useLanguage();

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center
                            justify-center text-sm">🔥</div>
            <span className="font-medium text-gray-900">{t.appName}</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Nút chọn ngôn ngữ */}
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
                  {l === "vi" ? "🇻🇳" : l === "en" ? "🇬🇧" : "🇯🇵"}
                </button>
              ))}
            </div>
            <Link href="/feed" className="text-sm text-orange-500 hover:underline">
              {t.viewFeed}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-xl mx-auto px-4 pt-10 pb-6 text-center">
        <h1 className="text-2xl font-medium text-gray-900 mb-2">{t.hero}</h1>
        <p className="text-gray-500 text-sm">{t.heroSub}</p>
      </section>

      {/* Form */}
      <section className="max-w-xl mx-auto px-4 pb-10">
        <RoastForm />
      </section>
    </main>
  );
}