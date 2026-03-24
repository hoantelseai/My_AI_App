import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HF_TOKEN);

// Tạo vector từ text
export async function createEmbedding(text) {
  const result = await hf.featureExtraction({
    model: "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
    inputs: text,
  });
  // Lấy vector trung bình nếu trả về 2D array
  if (Array.isArray(result[0])) {
    const len = result[0].length;
    return result.reduce(
      (acc, vec) => acc.map((v, i) => v + vec[i] / result.length),
      new Array(len).fill(0)
    );
  }
  return Array.from(result);
}

// Tìm roast tương tự
export async function findSimilarRoasts(text, category, supabase) {
  const embedding = await createEmbedding(text);
  const { data } = await supabase.rpc("match_roasts", {
    query_embedding: embedding,
    match_count: 3,
    min_votes: 1,
  });
  return data ?? [];
}