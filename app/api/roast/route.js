const GROQ_API_KEY = process.env.GROQ_API_KEY;
import { supabase } from "../../lib/supabase";

export async function POST(request) {
  const { content, category, fireLevel, image } = await request.json();

  if (!content?.trim() && !image) {
    return Response.json({ error: "Thiếu nội dung" }, { status: 400 });
  }

  const categoryGuide =
    {
      "Design / UI": `Tập trung vào: màu sắc, typography, spacing, hierarchy,
    UX flow. Dùng thuật ngữ design thật (contrast ratio,
    visual weight, whitespace). Ví von với các sản phẩm nổi tiếng.`,
      Code: `Tập trung vào: naming convention, độ phức tạp, khả năng
    maintain, potential bugs. Được phép dùng thuật ngữ kỹ thuật
    (O(n²), side effects, coupling). Roast kiểu "senior dev review PR của junior".`,
      "Bài viết": `Tập trung vào: structure, clarity, hook mở đầu, CTA.
    Nhận xét về giọng văn và audience phù hợp.`,
      CV: `Tập trung vào: ATS-friendliness, action verbs, kết quả
    đo lường được, formatting. Đóng vai recruiter đã đọc 200 CV hôm nay.`,
      "Pitch deck": `Tập trung vào: problem/solution clarity, market size,
    traction, storytelling. Đóng vai VC đã nghe 50 pitch tuần này.`,
    }[category] ?? `Nhận xét tổng quát về chất lượng và tính chuyên nghiệp.`;

  const fireLevelInstruction =
    {
      gentle: `Giọng điệu: người mentor thân thiện. Mỗi chê phải kèm lời động viên.`,
      medium: `Giọng điệu: đồng nghiệp thẳng thắn có khiếu hài hước.`,
      savage: `Giọng điệu: Gordon Ramsay của ngành sáng tạo. Không nương tay.`,
    }[fireLevel] ?? `Giọng điệu: hài hước vừa phải, thẳng thắn.`;

  const systemPrompt = `Bạn là chuyên gia roast sản phẩm sáng tạo với 10 năm kinh nghiệm.

NHIỆM VỤ: Roast ${category} của người dùng.

CHUYÊN MÔN: ${categoryGuide}

PHONG CÁCH: ${fireLevelInstruction}

QUY TẮC:
1. Roast cụ thể — KHÔNG nói chung chung
2. Mỗi tip là hành động cụ thể có thể làm ngay
3. Không xúc phạm cá nhân, chỉ nhận xét sản phẩm

OUTPUT: JSON hợp lệ, KHÔNG markdown, KHÔNG backtick:
{
  "roastText": "2-3 câu roast chính, cụ thể và hài hước",
  "tips": ["Tip 1", "Tip 2", "Tip 3"]
}`;

  try {
    const userMessage = image
      ? {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${image}` },
            },
            {
              type: "text",
              text: `Loại: ${category}\n\nMô tả thêm: ${content || "Không có"}`,
            },
          ],
        }
      : {
          role: "user",
          content: `Loại: ${category}\n\nNội dung:\n${content}`,
        };

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: image
            ? "meta-llama/llama-4-scout-17b-16e-instruct"
            : "llama-3.3-70b-versatile",
          messages: [{ role: "system", content: systemPrompt }, userMessage],
          max_tokens: 1000,
        }),
      },
    );

    const data = await response.json();
    console.log("Groq response:", JSON.stringify(data).substring(0, 300));

    const text = data.choices[0].message.content;
    const cleaned = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleaned);

    // Dịch result sang EN và JA — không gửi ảnh lại
    async function translateRoast(langCode, originalResult) {
      const translatePrompt = `Dịch JSON sau sang ${langCode === "en" ? "English" : "Japanese"}.
Giữ nguyên format JSON, chỉ dịch giá trị text, KHÔNG dịch key.
KHÔNG markdown, KHÔNG backtick.

${JSON.stringify(originalResult)}`;

      const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: translatePrompt }],
          max_tokens: 1000,
        }),
      });
      const d = await r.json();
      const txt = d.choices[0].message.content;
      return JSON.parse(txt.replace(/```json|```/g, "").trim());
    }

    const [resultEn, resultJa] = await Promise.all([
      translateRoast("en", result),
      translateRoast("ja", result),
    ]);
    // Lưu vào Supabase cả 3 ngôn ngữ
    const { error: dbError } = await supabase.from("roasts").insert({
      category,
      content: content || "[ảnh]",
      fire_level: fireLevel,
      roast_text: result.roastText,
      tips: result.tips,
      roast_text_en: resultEn.roastText,
      tips_en: resultEn.tips,
      roast_text_ja: resultJa.roastText,
      tips_ja: resultJa.tips,
    });
    if (dbError) console.error("Lỗi lưu DB:", dbError.message);

    return Response.json({
      roastText: result.roastText,
      tips: result.tips,
      roastTextEn: resultEn.roastText,
      tipsEn: resultEn.tips,
      roastTextJa: resultJa.roastText,
      tipsJa: resultJa.tips,
    });
  } catch (err) {
    console.error("Lỗi chi tiết:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
