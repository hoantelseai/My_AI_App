"use client";
import { useState, useRef } from "react";
import RoastCard from "./RoastCard";
import { useLanguage } from "../lib/LanguageContext";
import { readDocx, readXlsx, readPdf } from "../lib/fileReaders";

export default function RoastForm() {
  const { t, lang } = useLanguage();
  const [category, setCategory] = useState("Design / UI");
  const [content, setContent] = useState("");
  const [fireLevel, setFireLevel] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [roast, setRoast] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [csvName, setCsvName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const CATEGORIES = {
    vi: ["Design / UI", "Code", "Bài viết", "CV", "Pitch deck", "CSV Data"],
    en: ["Design / UI", "Code", "Article", "CV", "Pitch deck", "CSV Data"],
    ja: ["Design / UI", "Code", "記事", "履歴書", "ピッチデック", "CSV Data"],
  }[lang] ?? ["Design / UI", "Code", "Bài viết", "CV", "Pitch deck", "CSV Data"];

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
      const maxSize = 800;
      let w = img.width;
      let h = img.height;
      if (w > maxSize || h > maxSize) {
        if (w > h) { h = (h / w) * maxSize; w = maxSize; }
        else { w = (w / h) * maxSize; h = maxSize; }
      }
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);
      const resized = canvas.toDataURL("image/jpeg", 0.7);
      setImagePreview(resized);
      setImage(resized.split(",")[1]);
    };
    img.src = URL.createObjectURL(file);
  }

  async function handleFile(file) {
    if (!file) return;
    setCsvName(file.name);
    try {
      let text = "";
      if (file.name.endsWith(".csv")) {
        const raw = await file.text();
        text = raw.split("\n").slice(0, 50).join("\n");
      } else if (file.name.endsWith(".docx")) {
        text = await readDocx(file);
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        text = await readXlsx(file);
      } else if (file.name.endsWith(".pdf")) {
        text = await readPdf(file);
      } else {
        alert("Định dạng file chưa được hỗ trợ!");
        return;
      }
      setCsvData(text);
      setContent(text);
    } catch (err) {
      alert("Không đọc được file, thử lại nhé!");
      console.error(err);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }

  async function handleSubmit() {
    if (!content.trim() && !image && !csvData) return;
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
        <label className="text-sm mb-1 block" style={{ color: "var(--text-muted)" }}>
          {t.labelCategory}
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none
                     focus:ring-2 focus:ring-orange-200"
          style={{ backgroundColor: "var(--bg-card)", color: "var(--text)", borderColor: "var(--border)" }}
        >
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* File Upload (CSV, Excel, Word, PDF) */}
      <div>
        <label className="text-sm mb-1 block" style={{ color: "var(--text-muted)" }}>
          Upload file (tuỳ chọn)
        </label>
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed rounded-xl p-4 text-center
                     transition-colors cursor-pointer"
          style={{
            borderColor: isDragging ? "#f97316" : "var(--border)",
            backgroundColor: isDragging ? "#fff7ed" : "var(--bg-card)",
          }}
        >
          {csvName ? (
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                📄 {csvName}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                {csvData?.split("\n").length} dòng đã load
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCsvData(null);
                  setCsvName("");
                  setContent("");
                }}
                className="text-xs text-red-400 hover:text-red-500 mt-1"
              >
                Xoá file
              </button>
            </div>
          ) : (
            <div>
              <p className="text-2xl mb-1">📊</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Kéo thả hoặc click — CSV, Excel, Word, PDF
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,.docx,.pdf"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>
      </div>

      {/* Upload ảnh */}
      <div>
        <label className="text-sm mb-1 block" style={{ color: "var(--text-muted)" }}>
          {t.labelImage}
        </label>
        <label
          className="flex flex-col items-center justify-center w-full
                     h-28 border-2 border-dashed rounded-xl cursor-pointer
                     hover:border-orange-300 transition-colors"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
        >
          {imagePreview ? (
            <img src={imagePreview} alt="preview"
                 className="h-full w-full object-contain rounded-xl p-1" />
          ) : (
            <div className="text-center">
              <p className="text-2xl mb-1">🖼️</p>
              <p className="text-xs text-gray-400">{t.clickImage}</p>
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </label>
        {imagePreview && (
          <button
            onClick={() => { setImage(null); setImagePreview(null); }}
            className="text-xs text-gray-400 hover:text-red-400 mt-1"
          >
            {t.removeImage}
          </button>
        )}
      </div>

      {/* Content */}
      <div>
        <label className="text-sm mb-1 block" style={{ color: "var(--text-muted)" }}>
          {t.labelContent}
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t.placeholder}
          rows={5}
          className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none
                     focus:ring-2 focus:ring-orange-200 resize-none"
          style={{ backgroundColor: "var(--bg-card)", color: "var(--text)", borderColor: "var(--border)" }}
        />
      </div>

      {/* Fire level */}
      <div>
        <label className="text-sm mb-1 block" style={{ color: "var(--text-muted)" }}>
          {t.labelFireLevel}
        </label>
        <div className="flex gap-2">
          {FIRE_LEVELS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFireLevel(f.value)}
              className={`flex-1 py-2 text-xs rounded-xl border transition-colors ${
                fireLevel === f.value ? "border-orange-300 text-orange-800 font-medium" : ""
              }`}
              style={fireLevel === f.value
                ? { backgroundColor: "var(--bg-card)", borderColor: "#f97316" }
                : { borderColor: "var(--border)", color: "var(--text-muted)" }
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading || (!content.trim() && !image && !csvData)}
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