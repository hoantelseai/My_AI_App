"use client";
import { useState } from "react";
import RoastCard from "./RoastCard";

const CATEGORIES = ["Design / UI", "Code", "Bài viết", "CV", "Pitch deck"];
const FIRE_LEVELS = [
  { label: "Nhẹ nhàng 😊", value: "gentle" },
  { label: "Trung bình 🔥", value: "medium" },
  { label: "Thiêu rụi 💀", value: "savage" },
];

export default function RoastForm() {
  const [category, setCategory] = useState("Design / UI");
  const [content, setContent]   = useState("");
  const [fireLevel, setFireLevel] = useState("medium");
  const [loading, setLoading]   = useState(false);
  const [roast, setRoast]       = useState(null);

async function handleSubmit() {
  if (!content.trim()) return;
  setLoading(true);
  setRoast(null);

  try {
    const res = await fetch("/api/roast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, category, fireLevel }),
    });

    if (!res.ok) throw new Error("API lỗi");

    const data = await res.json();
    setRoast(data);
  } catch (err) {
    alert("Có lỗi xảy ra, thử lại nhé!");
    console.error(err);
  } finally {
    setLoading(false);
  }
}
  return (
    <div className="space-y-4">
      {/* Category */}
      <div>
        <label className="text-sm text-gray-500 mb-1 block">Loại work</label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2
                     text-sm bg-white focus:outline-none focus:ring-2
                     focus:ring-orange-200"
        >
          {CATEGORIES.map(c => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      <div>
        <label className="text-sm text-gray-500 mb-1 block">Nội dung cần roast</label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Paste link, mô tả, hoặc dán code của bạn vào đây..."
          rows={5}
          className="w-full border border-gray-200 rounded-xl px-3 py-2
                     text-sm bg-white focus:outline-none focus:ring-2
                     focus:ring-orange-200 resize-none"
        />
      </div>

      {/* Fire level */}
      <div>
        <label className="text-sm text-gray-500 mb-1 block">Mức độ tàn nhẫn</label>
        <div className="flex gap-2">
          {FIRE_LEVELS.map(f => (
            <button
              key={f.value}
              onClick={() => setFireLevel(f.value)}
              className={`flex-1 py-2 text-xs rounded-xl border transition-colors
                ${fireLevel === f.value
                  ? "bg-orange-50 border-orange-300 text-orange-800 font-medium"
                  : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading || !content.trim()}
        className="w-full py-3 rounded-xl bg-orange-500 text-white font-medium
                   text-sm hover:bg-orange-600 disabled:opacity-40
                   disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Đang roast..." : "Roast ngay! 🔥"}
      </button>

      {/* Result */}
      {roast && (
        <RoastCard roast={roast} />
      )}
    </div>
  );
}