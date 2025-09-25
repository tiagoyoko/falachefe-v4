import { OpenAIAgent } from "agent-squad/dist/agents/openAIAgent";
import type { OpenAIAgentOptions } from "agent-squad/dist/agents/openAIAgent";
import { Retriever } from "agent-squad/dist/retrievers/retriever";
import { searchRAG } from "@/lib/rag";
import { LeoKnowledgeRetriever } from "@/lib/knowledge-base/knowledge-retriever";

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
  // Usar o novo retriever da base de conhecimento
  const knowledgeRetriever = new LeoKnowledgeRetriever({
    userId: params.userId,
    topK: 5,
  });

  // Manter o retriever RAG existente como fallback
  const ragRetriever = new FinanceRagRetriever({
    userId: params.userId,
    topK: 5,
  });

  // Combinar ambos os retrievers
  const combinedRetriever = new CombinedRetriever([
    knowledgeRetriever,
    ragRetriever,
  ]);

  const options: OpenAIAgentOptions & { apiKey: string } = {
    name: "leo",
    description:
      "Mentor financeiro experiente e confiável. Ajuda a entender números, evitar erros financeiros e planejar o caixa.",
    saveChat: true,
    apiKey: process.env.OPENAI_API_KEY || "",
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    inferenceConfig: { temperature: 0.4, maxTokens: 800 },
    customSystemPrompt: {
      template:
        "Você é o Leo, agente financeiro do Fala Chefe! 🎭\n\n💰 PERFIL: Mentor experiente, organizado e confiável (idade simbólica: 40 anos)\n\nPERSONALIDADE: Racional, objetivo, passa segurança\n\nTOM DE VOZ: Claro e firme, mas amigável\n\nOBJETIVO: Ajudar o empreendedor a entender números, evitar erros financeiros e planejar o caixa\n\nEXEMPLO DE FALA: 'Calma, vamos olhar juntos os números. O que entra e o que sai. Assim você decide com clareza.'\n\nINSTRUÇÕES:\n- Seja sempre racional e objetivo\n- Passe segurança nas suas orientações\n- Use tom claro e firme, mas amigável\n- Foque em ajudar a entender números e planejar o caixa\n- Evite jargões complexos, explique de forma simples\n- Sempre em PT-BR\n- Use, quando houver, o contexto da base de conhecimento abaixo\n\nContexto:\n{{contexto}}",
      variables: { contexto: "" },
    },
    retriever: combinedRetriever,
  };
  const agent = new OpenAIAgent(options);
  return agent;
}

// Classe para combinar múltiplos retrievers
class CombinedRetriever extends Retriever {
  private retrievers: Retriever[];

  constructor(retrievers: Retriever[]) {
    super({});
    this.retrievers = retrievers;
  }

  async retrieve(
    text: string
  ): Promise<Array<{ content: string; score: number }>> {
    const allResults: Array<{ content: string; score: number }> = [];

    for (const retriever of this.retrievers) {
      try {
        const results = await retriever.retrieve(text);
        allResults.push(...results);
      } catch (error) {
        console.error("Erro em retriever:", error);
        // Continuar com outros retrievers mesmo se um falhar
      }
    }

    // Remover duplicatas e ordenar por score
    const uniqueResults = allResults.filter(
      (result, index, self) =>
        index === self.findIndex((r) => r.content === result.content)
    );

    return uniqueResults.sort((a, b) => b.score - a.score);
  }

  async retrieveAndCombineResults(text: string): Promise<string> {
    const results = await this.retrieve(text);
    return results.map((result) => result.content).join("\n\n");
  }

  async retrieveAndGenerate(text: string): Promise<string> {
    return this.retrieveAndCombineResults(text);
  }
}
