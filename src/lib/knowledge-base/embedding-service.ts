import { nanoid } from "nanoid";

// Tipos para embeddings
export interface Embedding {
  id: string;
  chunkId: string;
  embedding: number[];
  model: string;
  createdAt: Date;
}

export interface SearchResult {
  document: {
    id: string;
    title: string;
    content: string;
    fileType: string;
    agentId?: string;
    isGlobal: boolean;
  };
  chunk: {
    id: string;
    content: string;
    chunkIndex: number;
  };
  similarityScore: number;
  relevanceScore: number;
  context: string;
}

export interface SearchOptions {
  agentId?: string;
  limit?: number;
  threshold?: number;
  includeGlobal?: boolean;
}

// Configurações de embedding
const EMBEDDING_CONFIG = {
  model: "text-embedding-ada-002",
  dimensions: 1536,
  batchSize: 100,
  maxRetries: 3,
  timeout: 30000,
  rateLimit: 3000, // requests per minute
};

export class EmbeddingService {
  private apiKey: string;
  private rateLimitQueue: Array<() => Promise<unknown>> = [];
  private isProcessing = false;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || "";
    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY não configurada");
    }
  }

  /**
   * Gera embeddings para uma lista de chunks
   */
  async generateEmbeddings(
    chunks: Array<{ id: string; content: string }>
  ): Promise<Embedding[]> {
    const embeddings: Embedding[] = [];

    // Processar em lotes para evitar rate limiting
    for (let i = 0; i < chunks.length; i += EMBEDDING_CONFIG.batchSize) {
      const batch = chunks.slice(i, i + EMBEDDING_CONFIG.batchSize);
      const batchEmbeddings = await this.processBatch(batch);
      embeddings.push(...batchEmbeddings);

      // Pequena pausa entre lotes
      if (i + EMBEDDING_CONFIG.batchSize < chunks.length) {
        await this.delay(100);
      }
    }

    return embeddings;
  }

  /**
   * Gera embedding para uma query de busca
   */
  async generateQueryEmbedding(query: string): Promise<number[]> {
    const response = await this.callOpenAI(query);
    return response;
  }

  /**
   * Busca documentos similares usando embedding
   */
  async searchSimilar(
    queryEmbedding: number[],
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    // TODO: Implementar busca vetorial com pgvector
    // Por enquanto, retorna array vazio
    console.log("Busca vetorial ainda não implementada com pgvector");
    console.log("Query embedding dimensions:", queryEmbedding.length);
    console.log("Search options:", options);
    return [];
  }

  /**
   * Processa um lote de chunks
   */
  private async processBatch(
    chunks: Array<{ id: string; content: string }>
  ): Promise<Embedding[]> {
    const embeddings: Embedding[] = [];

    for (const chunk of chunks) {
      try {
        const embedding = await this.callOpenAI(chunk.content);
        embeddings.push({
          id: nanoid(),
          chunkId: chunk.id,
          embedding,
          model: EMBEDDING_CONFIG.model,
          createdAt: new Date(),
        });
      } catch (error) {
        console.error(`Erro ao gerar embedding para chunk ${chunk.id}:`, error);
        // Continuar com outros chunks mesmo se um falhar
      }
    }

    return embeddings;
  }

  /**
   * Chama a API da OpenAI para gerar embedding
   */
  private async callOpenAI(text: string): Promise<number[]> {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: EMBEDDING_CONFIG.model,
        input: text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `Erro ao gerar embedding: ${response.status} ${errorText}`
      );
    }

    const data = await response.json();
    return data.data[0].embedding;
  }

  /**
   * Calcula similaridade entre dois embeddings
   */
  private calculateSimilarity(
    embedding1: number[],
    embedding2: number[]
  ): number {
    if (embedding1.length !== embedding2.length) {
      return 0;
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  /**
   * Aplica threshold de relevância aos resultados
   */
  private applyThreshold(
    results: SearchResult[],
    threshold: number
  ): SearchResult[] {
    return results.filter((result) => result.similarityScore >= threshold);
  }

  /**
   * Utilitário para delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Valida se o embedding tem as dimensões corretas
   */
  private validateEmbedding(embedding: number[]): boolean {
    return (
      Array.isArray(embedding) &&
      embedding.length === EMBEDDING_CONFIG.dimensions
    );
  }

  /**
   * Obtém estatísticas de uso da API
   */
  async getUsageStats(): Promise<{
    totalRequests: number;
    totalTokens: number;
    averageLatency: number;
  }> {
    // TODO: Implementar tracking de uso
    return {
      totalRequests: 0,
      totalTokens: 0,
      averageLatency: 0,
    };
  }
}

// Instância singleton
export const embeddingService = new EmbeddingService();
