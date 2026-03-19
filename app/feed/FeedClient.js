"use client";
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function FeedClient({ roasts: initial }) {
  const [roasts, setRoasts] = useState(initial);

  async function handleVote(id, currentVotes) {
    const key = `voted_${id}`;
    if (localStorage.getItem(key)) return; // đã vote rồi

    localStorage.setItem(key, "1");
    setRoasts(r =>
      r.map(item =>
        item.id === id ? { ...item, votes: item.votes + 1 } : item
      )
    );
    await supabase
      .from("roasts")
      .update({ votes: currentVotes + 1 })
      .eq("id", id);
  }

  const LEVEL_LABEL = {
    gentle: "Nhẹ nhàng 😊",
    medium: "Trung bình 🔥",
    savage: "Thiêu rụi 💀",
  };

  return (
    <div className="space-y-4">
      {roasts.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-10">
          Chưa có roast nào. Hãy là người đầu tiên! 🔥
        </p>
      )}
      {roasts.map(r => (
        <div key={r.id}
          className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs bg-orange-50 text-orange-600
                             border border-orange-100 rounded-full px-2 py-0.5">
              {r.category}
            </span>
            <span className="text-xs text-gray-400">
              {LEVEL_LABEL[r.fire_level]}
            </span>
            <span className="text-xs text-gray-300 ml-auto">
              {new Date(r.created_at).toLocaleDateString("vi-VN")}
            </span>
          </div>

          <p className="text-sm text-gray-700 leading-relaxed">
            {r.roast_text}
          </p>

          <ul className="space-y-1">
            {r.tips.map((tip, i) => (
              <li key={i} className="text-xs text-gray-500 flex gap-2">
                <span className="text-teal-400">•</span>{tip}
              </li>
            ))}
          </ul>

          <button
            onClick={() => handleVote(r.id, r.votes)}
            className="flex items-center gap-1.5 text-xs text-gray-400
                       hover:text-orange-500 transition-colors"
          >
            🔥 <span>{r.votes} lửa</span>
          </button>
        </div>
      ))}
    </div>
  );
}