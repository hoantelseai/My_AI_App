"use client";
import { useState, useRef } from "react";
import RoastCard from "./RoastCard";
import { useLanguage } from "../lib/LanguageContext";
import { readDocx, readXlsx, pdfToImage } from "../lib/fileReaders";

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

  function handleImageFromFile(file) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      const maxSize = 800;
      let w = img.width, h = img.height;
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
      setCsvName("");
      setCsvData(null);
      setContent("");
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
        text = raw.split("\n").slice(0, 100).join("\n");
      } else if (file.name.endsWith(".docx")) {
        text = await readDocx(file);
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        text = await readXlsx(file);
      } else if (file.name.endsWith(".pdf")) {
        const base64 = await pdfToImage(file);
        setImage(base64);
        setImagePreview(`data:image/jpeg;base64,${base64}`);
        setCsvData(null);
        setContent("");
        return;
      } else {
        alert("Định dạng file chưa được hỗ trợ!");
        return;
      }
      setCsvData(text);
      setContent(text);
    } catch (err) {
      console.error("Chi tiết lỗi file:", err);
      alert(`Không đọc được file: ${err.message}`);
    }
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

      {/* Upload gộp */}
      <div>
        <label className="text-sm mb-1 block" style={{ color: "var(--text-muted)" }}>
          {t.labelUpload}
        </label>
        <div
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file?.type.startsWith("image/")) handleImageFromFile(file);
            else handleFile(file);
          }}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed rounded-xl p-4 text-center
                     transition-colors cursor-pointer min-h-28"
          style={{
            borderColor: isDragging ? "#f97316" : "var(--border)",
            backgroundColor: isDragging ? "#fff7ed" : "var(--bg-card)",
          }}
        >
          {imagePreview ? (
            <div>
              <img src={imagePreview} alt="preview"
                   className="max-h-40 mx-auto object-contain rounded-xl mb-2" />
              {csvName?.endsWith(".pdf") && (
                <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                  📄 {t.pdfNotice}
                </p>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setImage(null);
                  setImagePreview(null);
                  setCsvName("");
                }}
                className="text-xs text-red-400 hover:text-red-500"
              >
                {t.removeFile}
              </button>
            </div>
          ) : csvName ? (
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                📄 {csvName}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                {csvData?.split("\n").length} {t.uploadedLines}
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
                {t.removeFile}
              </button>
            </div>
          ) : (
            <div>
              <p className="text-2xl mb-1">📎</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {t.uploadHint}
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.csv,.xlsx,.xls,.docx,.pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file?.type.startsWith("image/")) handleImageFromFile(file);
              else handleFile(file);
            }}
          />
        </div>
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