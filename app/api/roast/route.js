// import Anthropic from "@anthropic-ai/sdk";
const GROQ_API_KEY = process.env.GROQ_API_KEY;
import { supabase } from "../../lib/supabase";

// const client = new Anthropic({
//   apiKey: process.env.ANTHROPIC_API_KEY,
// });

export async function POST(request) {
  const { content, category, fireLevel } = await request.json();

  if (!content?.trim()) {
    return Response.json({ error: "Thiếu nội dung" }, { status: 400 });
  }

  const fireLevelText =
    {
      gentle: "nhẹ nhàng, mang tính xây dựng",
      medium: "hài hước vừa phải, thẳng thắn",
      savage: "cực kỳ thẳng thắn và sắc bén, không nương tay",
    }[fireLevel] ?? "hài hước vừa phải";

  const categoryGuide =
    {
      "Design / UI": `Tập trung vào: màu sắc, typography, spacing, hierarchy,
    UX flow. Dùng thuật ngữ design thật (contrast ratio,
    visual weight, whitespace). Ví von với các sản phẩm nổi tiếng.`,

      Code: `Tập trung vào: naming convention, độ phức tạp, khả năng
    maintain, potential bugs. Được phép dùng thuật ngữ kỹ thuật
    (O(n²), side effects, coupling). Roast kiểu "senior dev
    review PR của junior".`,

      "Bài viết": `Tập trung vào: structure, clarity, hook mở đầu, CTA.
    Nhận xét về giọng văn và audience phù hợp. Ví von
    với các bài báo hay copywriting nổi tiếng.`,

      CV: `Tập trung vào: ATS-friendliness, action verbs, kết quả
    đo lường được, formatting. Đóng vai recruiter đã đọc
    200 CV hôm nay và không còn kiên nhẫn.`,

      "Pitch deck": `Tập trung vào: problem/solution clarity, market size,
    traction, storytelling. Đóng vai VC đã nghe 50 pitch
    tuần này và rất khó tính.`,
    }[category] ?? `Nhận xét tổng quát về chất lượng và tính chuyên nghiệp.`;

  const fireLevelInstruction = {
    gentle: `Giọng điệu: người mentor thân thiện. Mỗi chê phải
    kèm ngay lời động viên. Kết thúc lạc quan.`,
    medium: `Giọng điệu: đồng nghiệp thẳng thắn có khiếu hài hước.
    Chê thật nhưng không ác ý. Được phép châm biếm nhẹ.`,
    savage: `Giọng điệu: Gordon Ramsay của ngành sáng tạo.
    Không nương tay với lỗi, nhưng vẫn có 1 điểm
    tích cực ở cuối để không bị report. Được dùng
    so sánh cường điệu hài hước.`,
  }[fireLevel];

  const systemPrompt = `Bạn là chuyên gia roast sản phẩm sáng tạo với 10 năm
kinh nghiệm trong ngành. Bạn nổi tiếng vì feedback vừa
hài hước vừa cực kỳ có giá trị.

NHIỆM VỤ: Roast ${category} của người dùng.

CHUYÊN MÔN CHO LOẠI NÀY:
${categoryGuide}

PHONG CÁCH: ${fireLevelInstruction}

QUY TẮC BẮT BUỘC:
1. Roast cụ thể — KHÔNG nói chung chung kiểu "cần cải thiện"
2. Mỗi tip phải là hành động cụ thể có thể làm ngay
3. Được ví von hài hước nhưng không xúc phạm cá nhân
4. Nếu không đủ thông tin, hỏi lại thay vì đoán mò

OUTPUT: JSON hợp lệ, KHÔNG markdown, KHÔNG backtick:
{
  "roastText": "2-3 câu roast chính, cụ thể và hài hước",
  "tips": [
    "Tip 1: hành động cụ thể, bắt đầu bằng động từ",
    "Tip 2: hành động cụ thể, bắt đầu bằng động từ",
    "Tip 3: điểm tích cực hoặc quick win dễ làm nhất"
  ]
}`;

  console.log("GROQ KEY có không:", !!process.env.GROQ_API_KEY);

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Loại: ${category}\n\nNội dung:\n${content}`,
            },
          ],
          max_tokens: 1000,
        }),
      },
    );

    const data = await response.json();
    console.log("Groq trả về:", JSON.stringify(data).substring(0, 200));

    const text = data.choices[0].message.content;
    const cleaned = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleaned);

    // Lưu vào Supabase
    const { error: dbError } = await supabase.from("roasts").insert({
      category,
      content,
      fire_level: fireLevel,
      roast_text: result.roastText,
      tips: result.tips,
    });

    if (dbError) console.error("Lỗi lưu DB:", dbError.message);

    return Response.json(result);
  } catch (err) {
    console.error("Lỗi chi tiết:", err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
