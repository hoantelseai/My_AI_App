"use client";
import { useState } from "react";
import RoastCard from "./RoastCard";
import { useLanguage } from "../lib/LanguageContext";

export default function RoastForm() {
  const { t, lang } = useLanguage();
  const [category, setCategory] = useState("Design / UI");
  const [content, setContent] = useState("");
  const [fireLevel, setFireLevel] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [roast, setRoast] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const CATEGORIES = {
    vi: ["Design / UI", "Code", "Bài viết", "CV", "Pitch deck"],
    en: ["Design / UI", "Code", "Article", "CV", "Pitch deck"],
    ja: ["Design / UI", "Code", "記事", "履歴書", "ピッチデック"],
  }[lang] ?? ["Design / UI", "Code", "Bài viết", "CV", "Pitch deck"];
  const FIRE_LEVELS = [
    { label: t.gentle, value: "gentle" },
    { label: t.medium, value: "medium" },
    { label: t.savage, value: "savage" },
  ];

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Giới hạn tối đa 800px
      const maxSize = 800;
      let w = img.width;
      let h = img.height;
      if (w > maxSize || h > maxSize) {
        if (w > h) {
          h = (h / w) * maxSize;
          w = maxSize;
        } else {
          w = (w / h) * maxSize;
          h = maxSize;
        }
      }
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);

      const resized = canvas.toDataURL("image/jpeg", 0.7); // nén 70%
      setImagePreview(resized);
      setImage(resized.split(",")[1]);
    };

    img.src = URL.createObjectURL(file);
  }

  async function handleSubmit() {
    if (!content.trim() && !image) return;
    setLoading(true);
    setRoast(null);

    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, category, fireLevel, image, lang }),
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
        <label className="text-sm text-gray-500 mb-1 block">
          {t.labelCategory}
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2
                     text-sm bg-white focus:outline-none focus:ring-2
                     focus:ring-orange-200"
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Upload ảnh */}
      <div>
        <label className="text-sm text-gray-500 mb-1 block">
          {t.labelImage}
        </label>
        <label
          className="flex flex-col items-center justify-center w-full
                           h-28 border-2 border-dashed border-gray-200
                           rounded-xl cursor-pointer hover:border-orange-300
                           hover:bg-orange-50 transition-colors"
        >
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="preview"
              className="h-full w-full object-contain rounded-xl p-1"
            />
          ) : (
            <div className="text-center">
              <p className="text-2xl mb-1">🖼️</p>
              <p className="text-xs text-gray-400">{t.clickImage}</p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>
        {imagePreview && (
          <button
            onClick={() => {
              setImage(null);
              setImagePreview(null);
            }}
            className="text-xs text-gray-400 hover:text-red-400 mt-1"
          >
            {t.removeImage}
          </button>
        )}
      </div>

      {/* Content */}
      <div>
        <label className="text-sm text-gray-500 mb-1 block">
          {t.labelContent}
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t.placeholder}
          rows={5}
          className="w-full border border-gray-200 rounded-xl px-3 py-2
                     text-sm bg-white focus:outline-none focus:ring-2
                     focus:ring-orange-200 resize-none"
        />
      </div>

      {/* Fire level */}
      <div>
        <label className="text-sm text-gray-500 mb-1 block">
          {t.labelFireLevel}
        </label>
        <div className="flex gap-2">
          {FIRE_LEVELS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFireLevel(f.value)}
              className={`flex-1 py-2 text-xs rounded-xl border transition-colors ${
                fireLevel === f.value
                  ? "bg-orange-50 border-orange-300 text-orange-800 font-medium"
                  : "border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading || (!content.trim() && !image)}
        className="w-full py-3 rounded-xl bg-orange-500 text-white font-medium
                   text-sm hover:bg-orange-600 disabled:opacity-40
                   disabled:cursor-not-allowed transition-colors"
      >
        {loading ? t.loading : t.submit}
      </button>

      {roast && <RoastCard roast={roast} />}
    </div>
  );
}
