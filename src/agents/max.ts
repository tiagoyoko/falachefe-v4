import { Agent, AgentResponse } from "./types";
import { searchRAG as ragSearch } from "@/lib/rag";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

const chatModel = openai(process.env.OPENAI_MODEL || "gpt-4o-mini");

async function searchRAG(userId: string, query: string): Promise<string[]> {
  const results = await ragSearch({ userId, query, topK: 5 });
  return results.map((r) => r.content);
}

export const max: Agent = {
  name: "max",
  persona: {
    displayName: "Max – Agente de Marketing/Vendas",
    description:
      "Jovem, entusiasmado e motivador. Gera ideias práticas para atrair clientes e vender mais.",
    tone: "Inspirador, animado e positivo. Incentiva ação com passos simples e claros.",
  },
  async handle({ userId, message }): Promise<AgentResponse> {
    const contextChunks = await searchRAG(userId, message);
    const system = `Você é o Max, agente de Marketing/Vendas. Tom: inspirador e motivador, jovem, claro e prático. Sempre em PT-BR. Dê 2 ou 3 ações objetivas que o usuário pode aplicar agora.`;
    const prompt = `Pergunta do usuário: ${message}\n\nBase de conhecimento (resumos):\n${contextChunks
      .map((c) => `- ${c}`)
      .join("\n")}`;

    const result = await generateText({
      model: chatModel,
      system,
      prompt,
      temperature: 0.8,
    });
    const text =
      result.text ||
      "Bora lá! Vou te dar 2 ou 3 ações práticas para avançarmos.";
    return {
      success: true,
      message: text,
      metadata: { agent: "max" },
    };
  },
};
