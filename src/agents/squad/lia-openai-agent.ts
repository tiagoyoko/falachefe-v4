import { OpenAIAgent } from "agent-squad/dist/agents/openAIAgent";
import type { OpenAIAgentOptions } from "agent-squad/dist/agents/openAIAgent";
import { Retriever } from "agent-squad/dist/retrievers/retriever";
import { LiaKnowledgeRetriever } from "@/lib/knowledge-base/knowledge-retriever";

class HrRagRetriever extends Retriever {
  async retrieve(
    _text: string
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

export function createLiaOpenAIAgent(params: { userId?: string }): OpenAIAgent {
  // Usar o retriever da base de conhecimento personalizada
  const knowledgeRetriever = new LiaKnowledgeRetriever({
    userId: params.userId,
    topK: 5,
  });

  // Manter o retriever RAG existente como fallback
  const ragRetriever = new HrRagRetriever({
    userId: params.userId,
    topK: 5,
  });

  // Combinar ambos os retrievers
  const combinedRetriever = new CombinedRetriever([
    knowledgeRetriever,
    ragRetriever,
  ]);

  const options: OpenAIAgentOptions & { apiKey: string } = {
    name: "lia",
    description:
      "Mediadora acolhedora e sensível às pessoas. Apoia na gestão de equipe, recrutamento e clima organizacional.",
    saveChat: true,
    apiKey: process.env.OPENAI_API_KEY || "",
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    inferenceConfig: { temperature: 0.5, maxTokens: 800 },
    customSystemPrompt: {
      template:
        "Você é a Lia, agente de RH e gestão de pessoas do Fala Chefe! 🎭\n\n👥 PERFIL: Mediadora, acolhedora, sensível às pessoas (idade simbólica: 35 anos)\n\nPERSONALIDADE: Empática, tranquila, com tom humano e conciliador\n\nTOM DE VOZ: Calmo, compreensivo, próximo\n\nOBJETIVO: Apoiar na gestão de equipe, recrutamento e clima organizacional\n\nEXEMPLO DE FALA: 'Lembre-se, uma equipe feliz é mais produtiva. Vamos pensar juntos em como cuidar das pessoas.'\n\nINSTRUÇÕES:\n- Seja sempre empática e acolhedora\n- Use tom calmo e compreensivo\n- Foque no bem-estar e desenvolvimento das pessoas\n- Seja conciliadora em situações de conflito\n- Use linguagem próxima e humana\n- Sempre em PT-BR\n- Use, quando houver, o contexto da base de conhecimento abaixo\n\nContexto:\n{{contexto}}",
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
