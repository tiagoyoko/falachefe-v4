import { Retriever } from "agent-squad/dist/retrievers/retriever";
import { knowledgeBaseService } from "./knowledge-base-service";

/**
 * Retriever personalizado para a base de conhecimento
 * Integra com o agent-squad para fornecer contexto enriquecido
 */
export class KnowledgeBaseRetriever extends Retriever {
  private agentId?: string;

  constructor(options?: { agentId?: string; userId?: string; topK?: number }) {
    super(options);
    this.agentId = options?.agentId;
  }

  /**
   * Recupera documentos relevantes da base de conhecimento
   */
  async retrieve(
    text: string
  ): Promise<Array<{ content: string; score: number }>> {
    try {
      const results = await knowledgeBaseService.searchKnowledge(
        text,
        this.agentId
      );

      return results.map((result) => ({
        content: result.context,
        score: result.similarityScore,
      }));
    } catch (error) {
      console.error(
        "Erro ao recuperar documentos da base de conhecimento:",
        error
      );
      return [];
    }
  }

  /**
   * Combina resultados de busca em uma string formatada
   */
  async retrieveAndCombineResults(text: string): Promise<string> {
    const items = await this.retrieve(text);

    if (items.length === 0) {
      return "";
    }

    return items
      .map((item, index) => `${index + 1}. ${item.content}`)
      .join("\n\n");
  }

  /**
   * Gera contexto enriquecido para o agente
   */
  async retrieveAndGenerate(text: string): Promise<string> {
    const combinedResults = await this.retrieveAndCombineResults(text);

    if (!combinedResults) {
      return "";
    }

    return `Base de Conhecimento:\n${combinedResults}`;
  }
}

/**
 * Retriever específico para o agente Leo (Financeiro)
 */
export class LeoKnowledgeRetriever extends KnowledgeBaseRetriever {
  constructor(options?: { userId?: string; topK?: number }) {
    super({ ...options, agentId: "leo" });
  }
}

/**
 * Retriever específico para o agente Max (Marketing/Vendas)
 */
export class MaxKnowledgeRetriever extends KnowledgeBaseRetriever {
  constructor(options?: { userId?: string; topK?: number }) {
    super({ ...options, agentId: "max" });
  }
}

/**
 * Retriever específico para o agente Lia (RH)
 */
export class LiaKnowledgeRetriever extends KnowledgeBaseRetriever {
  constructor(options?: { userId?: string; topK?: number }) {
    super({ ...options, agentId: "lia" });
  }
}

/**
 * Retriever global (todos os agentes)
 */
export class GlobalKnowledgeRetriever extends KnowledgeBaseRetriever {
  constructor(options?: { userId?: string; topK?: number }) {
    super({ ...options, agentId: undefined });
  }
}
