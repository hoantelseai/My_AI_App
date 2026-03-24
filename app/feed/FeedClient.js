"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import { useLanguage } from "../lib/LanguageContext";
import { useTheme } from "../lib/ThemeContext";

export default function FeedClient({ roasts: initial }) {
  const { t, lang, setLang } = useLanguage();
  const { theme, changeTheme } = useTheme();
  const [roasts, setRoasts] = useState(initial);

  async function handleVote(id, currentVotes) {
    const key = `voted_${id}`;
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, "1");
    setRoasts((r) =>
      r.map((item) =>
        item.id === id ? { ...item, votes: item.votes + 1 } : item
      )
    );
    await supabase
      .from("roasts")
      .update({ votes: currentVotes + 1 })
      .eq("id", id);
  }

  const LEVEL_LABEL = {
    gentle: t.gentle,
    medium: t.medium,
    savage: t.savage,
  };

  const voteLabel = lang === "en" ? "fires" : lang === "ja" ? "火" : "lửa";

  return (
    <div>
      {/* Header */}
      <header className="border-b px-4 py-3"
        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center
                            justify-center text-sm">🔥</div>
            <span className="font-medium" style={{ color: "var(--text)" }}>
              {t.appName}
            </span>
          </div>
          <Link href="/" className="text-sm text-orange-500 hover:underline">
            {t.newRoast}
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium" style={{ color: "var(--text)" }}>{t.feedTitle}</h2>
          <div className="flex items-center gap-2">
            {/* Nút chọn theme */}
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
                    theme === th.key ? "bg-orange-100 text-orange-700 font-medium" : ""
                  }`}
                  style={theme !== th.key ? { color: "var(--text-muted)" } : {}}
                >
                  {th.icon}
                </button>
              ))}
            </div>
            {/* Nút chọn ngôn ngữ */}
            <div className="flex gap-1">
              {["vi", "en", "ja"].map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                    lang === l ? "bg-orange-100 text-orange-700 font-medium" : ""
                  }`}
                  style={lang !== l ? { color: "var(--text-muted)" } : {}}
                >
                  {l === "vi" ? "VN" : l === "en" ? "EN" : "JP"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {roasts.length === 0 && (
          <p className="text-sm text-center py-10" style={{ color: "var(--text-muted)" }}>
            {t.emptyFeed}
          </p>
        )}

        {roasts.map((r) => {
          const roastText = lang === "en" ? (r.roast_text_en || r.roast_text)
                          : lang === "ja" ? (r.roast_text_ja || r.roast_text)
                          : r.roast_text;
          const tips = lang === "en" ? (r.tips_en || r.tips)
                     : lang === "ja" ? (r.tips_ja || r.tips)
                     : r.tips;
          return (
            <div key={r.id}
              className="border rounded-2xl p-4 space-y-3"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs bg-orange-50 text-orange-600
                                 border border-orange-100 rounded-full px-2 py-0.5">
                  {r.category}
                </span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {LEVEL_LABEL[r.fire_level]}
                </span>
                <span className="text-xs ml-auto" style={{ color: "var(--text-muted)" }}>
                  {new Date(r.created_at).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                {roastText}
              </p>
              <ul className="space-y-1">
                {tips.map((tip, i) => (
                  <li key={i} className="text-xs flex gap-2" style={{ color: "var(--text-muted)" }}>
                    <span className="text-teal-400">•</span>{tip}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleVote(r.id, r.votes)}
                className="flex items-center gap-1.5 text-xs hover:text-orange-500 transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                🔥 <span>{r.votes} {voteLabel}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}