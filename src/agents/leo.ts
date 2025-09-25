import { Agent, AgentResponse } from "./types";
import { llmService } from "@/lib/llm-service";
import { searchRAG as ragSearch } from "@/lib/rag";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

const chatModel = openai(process.env.OPENAI_MODEL || "gpt-4o-mini");

function isKnowledgeQuery(message: string): boolean {
  const t = (message || "").toLowerCase();
  return /(^como\s)|(^o que\s)|(^qual\s)|(^quando\s)|(^por que\s)|(^porque\s)|relat[óo]rio|balan[çc]o|lucro|margem|demonstra[çc][aã]o|conceito/.test(
    t
  );
}

export const leo: Agent = {
  name: "leo",
  persona: {
    displayName: "Leo – Agente Financeiro",
    description:
      "Mentor experiente, organizado e confiável. Ajuda a entender números e planejar o caixa.",
    tone: "Racional, objetivo, claro e firme, mas amigável. Evita jargão e traz segurança.",
  },
  async handle({ userId, message, agent }): Promise<AgentResponse> {
    // Se for pergunta conceitual/explicativa, usar RAG financeiro
    if (isKnowledgeQuery(message)) {
      const chunks = await ragSearch({ userId, query: message, topK: 5 });
      const system = `Você é o Leo, agente financeiro. Tom: claro, firme e amigável. Explique conceitos financeiros de forma objetiva para pequenos empreendedores. Sempre em PT-BR. Cite 2-3 pontos práticos.`;
      const context = chunks.map((c) => `- ${c.content}`).join("\n");
      const prompt = `Pergunta: ${message}\n\nBase de conhecimento:\n${context}`;
      const out = await generateText({
        model: chatModel,
        system,
        prompt,
        temperature: 0.5,
      });
      return {
        success: true,
        message: out.text,
        metadata: { agent: "leo", mode: "rag" },
      };
    }

    // Caso contrário, manter fluxo operacional via LLMService (registro/relatórios)
    return await llmService.processUserMessage(
      userId,
      message,
      true,
      agent || "leo"
    );
  },
};
