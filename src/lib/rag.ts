import { db } from "@/lib/db";
import {
  ragSources,
  ragDocuments,
  ragChunks,
  ragEmbeddings,
} from "@/lib/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string;
const EMBEDDING_MODEL =
  process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-large";

async function computeEmbeddingOpenAI(
  text: string
): Promise<{ vector: number[]; model: string; dims: number }> {
  if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY não configurada");
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: text }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Erro ao gerar embedding: ${res.status} ${errText}`);
  }
  const json = (await res.json()) as {
    data: Array<{ embedding: number[] }>;
    model: string;
  };
  const vector = json.data?.[0]?.embedding || [];
  return { vector, model: json.model || EMBEDDING_MODEL, dims: vector.length };
}

function chunkText(text: string, maxLen = 1000): string[] {
  const cleaned = (text || "").replace(/\s+/g, " ").trim();
  if (!cleaned) return [];
  const chunks: string[] = [];
  for (let i = 0; i < cleaned.length; i += maxLen) {
    chunks.push(cleaned.slice(i, i + maxLen));
  }
  return chunks;
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a.length || !b.length || a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom ? dot / denom : 0;
}

export async function ingestManual({
  userId,
  label,
  texts,
  tags,
}: {
  userId?: string | null;
  label: string;
  texts: string[];
  tags?: string[];
}): Promise<{ sourceId: string; documents: number; chunks: number }> {
  const cleanUserId =
    typeof userId === "string" && userId.trim().length > 0
      ? userId.trim()
      : null;
  const sourceId = nanoid();
  await db.insert(ragSources).values({
    id: sourceId,
    userId: cleanUserId ?? undefined,
    kind: "manual",
    label,
    tags: tags || [],
    isActive: true,
  });

  let docCount = 0;
  let chunkCount = 0;

  for (const text of texts) {
    const docId = nanoid();
    await db.insert(ragDocuments).values({
      id: docId,
      sourceId,
      title: label,
      url: null,
      lang: "pt-BR",
      tags: tags || [],
    });
    docCount++;

    const chunks = chunkText(text);
    for (let idx = 0; idx < chunks.length; idx++) {
      const content = chunks[idx];
      const chunkId = nanoid();
      await db.insert(ragChunks).values({
        id: chunkId,
        documentId: docId,
        idx,
        content,
      });

      const { vector, model, dims } = await computeEmbeddingOpenAI(content);
      await db.insert(ragEmbeddings).values({
        id: nanoid(),
        chunkId,
        embedding: vector,
        model,
        dims,
      });
      chunkCount++;
    }
  }

  return { sourceId, documents: docCount, chunks: chunkCount };
}

export async function searchRAG({
  userId,
  query,
  topK = 5,
}: {
  userId?: string | null;
  query: string;
  topK?: number;
}): Promise<Array<{ content: string; score: number }>> {
  const cleanUserId =
    typeof userId === "string" && userId.trim().length > 0
      ? userId.trim()
      : null;
  const { vector: qvec } = await computeEmbeddingOpenAI(query);

  const rows = await db
    .select({
      emb: ragEmbeddings.embedding,
      content: ragChunks.content,
      srcUser: ragSources.userId,
      active: ragSources.isActive,
    })
    .from(ragEmbeddings)
    .leftJoin(ragChunks, eq(ragChunks.id, ragEmbeddings.chunkId))
    .leftJoin(ragDocuments, eq(ragDocuments.id, ragChunks.documentId))
    .leftJoin(ragSources, eq(ragSources.id, ragDocuments.sourceId));

  const candidates = rows.filter(
    (r) => r.active === true && (r.srcUser === cleanUserId || r.srcUser == null)
  );
  const scored = candidates
    .map((r) => {
      const vec = Array.isArray(r.emb) ? (r.emb as number[]) : [];
      return { content: r.content || "", score: cosineSimilarity(qvec, vec) };
    })
    .filter((r) => r.content && r.score > 0);

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}
