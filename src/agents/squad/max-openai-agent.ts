import { OpenAIAgent } from "agent-squad/dist/agents/openAIAgent";
import type { OpenAIAgentOptions } from "agent-squad/dist/agents/openAIAgent";
import { Retriever } from "agent-squad/dist/retrievers/retriever";
import { MaxKnowledgeRetriever } from "@/lib/knowledge-base/knowledge-retriever";

class MarketingRagRetriever extends Retriever {
  async retrieve(
    text: string
  ): Promise<Array<{ content: string; score: number }>> {
    // Fallback para busca RAG básica se necessário
    return [];
  }

  async retrieveAndCombineResults(text: string): Promise<string> {
    const items = await this.retrieve(text);
    return items.map((i) => `- ${i.content}`).join("\n");
  }

  async retrieveAndGenerate(text: string): Promise<string> {
    return this.retrieveAndCombineResults(text);
  }
}

export function createMaxOpenAIAgent(params: { userId?: string }): OpenAIAgent {
  // Usar o retriever da base de conhecimento personalizada
  const knowledgeRetriever = new MaxKnowledgeRetriever({
    userId: params.userId,
    topK: 5,
  });

  // Manter o retriever RAG existente como fallback
  const ragRetriever = new MarketingRagRetriever({
    userId: params.userId,
    topK: 5,
  });

  // Combinar ambos os retrievers
  const combinedRetriever = new CombinedRetriever([
    knowledgeRetriever,
    ragRetriever,
  ]);

  const options: OpenAIAgentOptions & { apiKey: string } = {
    name: "max",
    description:
      "Jovem entusiasmado e motivador. Gera ideias para atrair clientes, vender mais e aumentar a visibilidade da empresa.",
    saveChat: true,
    apiKey: process.env.OPENAI_API_KEY || "",
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    inferenceConfig: { temperature: 0.6, maxTokens: 800 },
    customSystemPrompt: {
      template:
        "Você é o Max, agente de marketing e vendas do Fala Chefe! 🎭\n\n📈 PERFIL: Jovem, entusiasmado e motivador (idade simbólica: 28 anos)\n\nPERSONALIDADE: Extrovertido, criativo e cheio de energia\n\nTOM DE VOZ: Inspirador, sempre animado, cheio de frases de incentivo\n\nOBJETIVO: Gerar ideias para atrair clientes, vender mais e aumentar a visibilidade da empresa\n\nEXEMPLO DE FALA: 'Bora lá! Se você mostrar o valor do seu produto de forma clara, seus clientes vão se encantar.'\n\nINSTRUÇÕES:\n- Seja sempre entusiasmado e motivador\n- Use frases de incentivo e energia positiva\n- Foque em ideias criativas para marketing e vendas\n- Seja inspirador e animado nas suas respostas\n- Use expressões como 'Bora lá!', 'Vamos nessa!', 'Top!'\n- Sempre em PT-BR\n- Use, quando houver, o contexto da base de conhecimento abaixo\n\nContexto:\n{{contexto}}",
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
