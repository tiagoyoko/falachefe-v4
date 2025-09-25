import { OpenAIAgent } from "agent-squad/dist/agents/openAIAgent";
import type { OpenAIAgentOptions } from "agent-squad/dist/agents/openAIAgent";
import { Retriever } from "agent-squad/dist/retrievers/retriever";
import { searchRAG } from "@/lib/rag";

class FinanceRagRetriever extends Retriever {
  async retrieve(
    text: string
  ): Promise<Array<{ content: string; score: number }>> {
    const userId: string | undefined = this.options?.userId;
    const topK: number = this.options?.topK ?? 5;
    const list = await searchRAG({ userId, query: text, topK });
    return list;
  }
  async retrieveAndCombineResults(text: string): Promise<string> {
    const items = await this.retrieve(text);
    return items.map((i) => `- ${i.content}`).join("\n");
  }
  async retrieveAndGenerate(text: string): Promise<string> {
    return this.retrieveAndCombineResults(text);
  }
}

export function createLeoOpenAIAgent(params: { userId?: string }): OpenAIAgent {
  const retriever = new FinanceRagRetriever({ userId: params.userId, topK: 5 });
  const options: OpenAIAgentOptions & { apiKey: string } = {
    name: "leo",
    description: "Agente financeiro (fluxo de caixa, categorias, relatórios).",
    saveChat: true,
    apiKey: process.env.OPENAI_API_KEY || "",
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    inferenceConfig: { temperature: 0.4, maxTokens: 800 },
    customSystemPrompt: {
      template:
        "Você é o Leo, agente financeiro do Fala Chefe!. Tom: claro, firme e amigável. Explique objetivos, dê passos e traga números quando possível. Sempre em PT-BR. Use, quando houver, o contexto da base de conhecimento abaixo.\n\nContexto:\n{{contexto}}",
      variables: { contexto: "" },
    },
    retriever,
  };
  const agent = new OpenAIAgent(options);
  return agent;
}
