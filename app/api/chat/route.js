const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function POST(request) {
  const { messages, originalContent, originalRoast, category, hasImage } =
    await request.json();

  const systemPrompt = `Bạn là chuyên gia roast sản phẩm sáng tạo.
Bạn vừa roast ${category} của người dùng với nội dung:

ROAST BAN ĐẦU: ${originalRoast}

Bây giờ người dùng muốn tiếp tục thảo luận. Hãy:
- Trả lời thẳng thắn và hài hước như phong cách roast ban đầu
- Nếu họ hỏi giải thích thêm thì giải thích chi tiết hơn
- Nếu họ muốn roast mạnh/nhẹ hơn thì điều chỉnh
- Nếu họ phản bác thì defend quan điểm nhưng vẫn lịch sự
- Trả lời ngắn gọn, tối đa 3-4 câu
- KHÔNG trả về JSON, trả về text bình thường
- QUAN TRỌNG: Hãy trả lời bằng ngôn ngữ mà người dùng đang dùng để nhắn tin`;

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: hasImage
          ? "meta-llama/llama-4-scout-17b-16e-instruct"
          : "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        max_tokens: 1500,
        stream: true,
      }),
    }
  );

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));
        for (const line of lines) {
          const data = line.replace("data: ", "");
          if (data === "[DONE]") {
            controller.close();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const text = parsed.choices[0]?.delta?.content || "";
            if (text) controller.enqueue(encoder.encode(text));
          } catch {}
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}