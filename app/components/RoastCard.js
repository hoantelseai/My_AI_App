"use client";
import { useLanguage } from "../lib/LanguageContext";

export default function RoastCard({ roast }) {
  const { t, lang } = useLanguage();

  const roastText = lang === "en" ? (roast.roastTextEn || roast.roastText)
                  : lang === "ja" ? (roast.roastTextJa || roast.roastText)
                  : roast.roastText;

  const tips = lang === "en" ? (roast.tipsEn || roast.tips)
             : lang === "ja" ? (roast.tipsJa || roast.tips)
             : roast.tips;

  return (
    <div className="border border-orange-100 bg-orange-50 rounded-2xl p-4
                    space-y-3 mt-2">
      <div>
        <p className="text-xs font-medium text-orange-400 mb-1">{t.roastLabel}</p>
        <p className="text-sm text-gray-800 leading-relaxed">{roastText}</p>
      </div>
      <div className="border-t border-orange-100 pt-3">
        <p className="text-xs font-medium text-teal-600 mb-2">{t.tipsLabel}</p>
        <ul className="space-y-1">
          {tips.map((tip, i) => (
            <li key={i} className="text-sm text-gray-700 flex gap-2">
              <span className="text-teal-400 font-medium mt-0.5">•</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}