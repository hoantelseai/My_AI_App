"use client";
import { useState, useRef } from "react";
import { useLanguage } from "../lib/LanguageContext";
import { pdfToImage } from "../lib/fileReaders";
import ReactMarkdown from "react-markdown";

export default function RoastChat({ roast, category, originalContent }) {
  const { lang } = useLanguage();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: roast.roastText,
      tips: roast.tips,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatImage, setChatImage] = useState(null);
  const [chatImagePreview, setChatImagePreview] = useState(null);
  const chatFileRef = useRef(null);

  const placeholder =
    lang === "en"
      ? "Ask for more, push back, or upload a new image..."
      : lang === "ja"
        ? "詳しく聞く、反論する、新しい画像をアップロード..."
        : "Hỏi thêm, phản bác, hoặc upload ảnh mới...";

  const sendLabel = lang === "en" ? "Send" : lang === "ja" ? "送信" : "Gửi";
  async function handleChatFile(file) {
    if (!file) return;
    try {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target.result.split(",")[1];
          setChatImage(base64);
          setChatImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else if (file.name.endsWith(".pdf")) {
        const base64 = await pdfToImage(file);
        setChatImage(base64);
        setChatImagePreview(`data:image/jpeg;base64,${base64}`);
      }
    } catch (err) {
      alert("Không đọc được file: " + err.message);
    }
  }

  async function handleSend() {
    if ((!input.trim() && !chatImage) || loading) return;

    const currentImage = chatImage;
    const currentImagePreview = chatImagePreview;
    const currentInput = input;
    const userMsg = {
      role: "user",
      content:
        input ||
        (lang === "en"
          ? "Please roast this image"
          : lang === "ja"
            ? "この画像を評価してください"
            : "Roast ảnh này"),
      image: chatImage,
      imagePreview: chatImagePreview,
    };
    const newMessages = [
      ...messages.filter((m) => m.role !== "assistant" || !m.tips),
      userMsg,
    ];
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setChatImage(null);
    setChatImagePreview(null);
    setLoading(true);

    try {
      // Build messages array cho API
      const apiMessages = messages
        .filter((m) => m.role !== "assistant" || !m.tips)
        .map((m) => {
          if (m.image) {
            return {
              role: m.role,
              content: [
                {
                  type: "image_url",
                  image_url: { url: `data:image/jpeg;base64,${m.image}` },
                },
                { type: "text", text: m.content },
              ],
            };
          }
          return { role: m.role, content: m.content };
        });

      // Thêm tin nhắn hiện tại
      // ✅currentImage
      if (currentImage) {
        apiMessages.push({
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${currentImage}` },
            },
            { type: "text", text: currentInput || "Roast ảnh này" },
          ],
        });
      } else {
        apiMessages.push({ role: "user", content: currentInput });
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          originalContent,
          originalRoast: roast.roastText,
          category,
          hasImage: !!currentImage, // currentImage
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="mt-3 border rounded-2xl overflow-hidden"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--bg-card)",
      }}
    >
      {/* Tin nhắn */}
      <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" ? (
              <div className="max-w-[85%] space-y-2">
                <div
                  className="rounded-2xl rounded-tl-none px-3 py-2 text-sm leading-relaxed"
                  style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
                >
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className="mb-1 last:mb-0">{children}</p>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold">{children}</strong>
                      ),
                      h3: ({ children }) => (
                        <p className="font-semibold mt-1">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc pl-4 space-y-0.5">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-4 space-y-0.5">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => <li>{children}</li>,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
                {msg.tips && (
                  <div
                    className="rounded-xl px-3 py-2"
                    style={{
                      backgroundColor: "var(--bg)",
                      borderLeft: "3px solid #5DCAA5",
                    }}
                  >
                    <p className="text-xs font-medium text-teal-500 mb-1">
                      ✨ Tips
                    </p>
                    <ul className="space-y-1">
                      {msg.tips.map((tip, j) => (
                        <li
                          key={j}
                          className="text-xs flex gap-2"
                          style={{ color: "var(--text-muted)" }}
                        >
                          <span className="text-teal-400">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="max-w-[85%] space-y-1">
                {msg.imagePreview && (
                  <div className="flex justify-end">
                    <img
                      src={msg.imagePreview}
                      alt="uploaded"
                      className="max-h-32 rounded-xl object-contain"
                    />
                  </div>
                )}
                {msg.content && (
                  <div
                    className="max-w-[85%] rounded-2xl rounded-tr-none px-3 py-2 text-sm
                             bg-orange-500 text-white"
                  >
                    {msg.content}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div
              className="rounded-2xl rounded-tl-none px-3 py-2 text-sm"
              style={{
                backgroundColor: "var(--bg)",
                color: "var(--text-muted)",
              }}
            >
              ...
            </div>
          </div>
        )}
      </div>

      {/* Preview ảnh đang chọn */}
      {chatImagePreview && (
        <div className="px-3 pb-2 flex items-center gap-2">
          <img
            src={chatImagePreview}
            alt="preview"
            className="h-16 rounded-lg object-contain"
          />
          <button
            onClick={() => {
              setChatImage(null);
              setChatImagePreview(null);
            }}
            className="text-xs text-red-400 hover:text-red-500"
          >
            Xoá
          </button>
        </div>
      )}

      {/* Input */}
      <div
        className="border-t flex gap-2 p-3"
        style={{ borderColor: "var(--border)" }}
      >
        {/* Nút upload ảnh */}
        <input
          type="file"
          accept="image/*,.pdf"
          ref={chatFileRef}
          className="hidden"
          onChange={(e) => handleChatFile(e.target.files[0])}
        />
        <button
          onClick={() => chatFileRef.current?.click()}
          className="px-3 py-2 rounded-xl border text-sm hover:bg-orange-50 transition-colors flex items-center gap-1"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-muted)",
          }}
          title="Upload ảnh hoặc PDF"
        >
          📎
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder={placeholder}
          className="flex-1 text-sm px-3 py-2 rounded-xl border focus:outline-none
                     focus:ring-2 focus:ring-orange-200"
          style={{
            backgroundColor: "var(--bg)",
            color: "var(--text)",
            borderColor: "var(--border)",
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading || (!input.trim() && !chatImage)}
          className="px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-medium
                     hover:bg-orange-600 disabled:opacity-40 transition-colors"
        >
          {sendLabel}
        </button>
      </div>
    </div>
  );
}
