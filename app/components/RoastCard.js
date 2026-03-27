"use client";
import { useLanguage } from "../lib/LanguageContext";
import RoastChat from "./RoastChat";

export default function RoastCard({ roast, category, originalContent }) {
  const { t, lang } = useLanguage();

  const roastText = lang === "en" ? (roast.roastTextEn || roast.roastText)
                  : lang === "ja" ? (roast.roastTextJa || roast.roastText)
                  : roast.roastText;

  const tips = lang === "en" ? (roast.tipsEn || roast.tips)
             : lang === "ja" ? (roast.tipsJa || roast.tips)
             : roast.tips;

  return (
    <div className="space-y-2 mt-2">
      <div className="border rounded-2xl p-4 space-y-3"
        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
        <div>
          <p className="text-xs font-medium text-orange-400 mb-1">{t.roastLabel}</p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>{roastText}</p>
        </div>
        <div className="border-t pt-3" style={{ borderColor: "var(--border)" }}>
          <p className="text-xs font-medium text-teal-500 mb-2">{t.tipsLabel}</p>
          <ul className="space-y-1">
            {tips.map((tip, i) => (
              <li key={i} className="text-sm flex gap-2" style={{ color: "var(--text-muted)" }}>
                <span className="text-teal-400 font-medium mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Chat follow-up */}
      <RoastChat
        roast={{ ...roast, roastText, tips }}  
        category={category}
        originalContent={originalContent}
      />
    </div>
  );
}