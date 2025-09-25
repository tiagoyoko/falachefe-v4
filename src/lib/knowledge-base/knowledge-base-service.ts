import { db } from "@/lib/db";
import {
  knowledgeDocuments,
  knowledgeChunks,
  knowledgeEmbeddings,
  agentKnowledgeAssociations,
} from "@/lib/schema";
import { eq, and, desc, sql, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { documentProcessor } from "./document-processor";
import {
  embeddingService,
  SearchResult,
  SearchOptions,
} from "./embedding-service";

// Tipos para a base de conhecimento
export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  filePath?: string | null;
  fileType: "pdf" | "docx" | "txt" | "md" | "html";
  fileSize: number;
  metadata: Record<string, unknown>;
  agentId?: string | null;
  isGlobal: boolean;
  status: "processing" | "active" | "error";
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeChunk {
  id: string;
  documentId: string;
  content: string;
  chunkIndex: number;
  tokenCount: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface KnowledgeEmbedding {
  id: string;
  chunkId: string;
  embedding: number[];
  model: string;
  createdAt: Date;
}

export interface UploadConfig {
  title: string;
  agentIds?: string[];
  isGlobal?: boolean;
  metadata?: Record<string, unknown>;
}

export interface DocumentFilters {
  agentId?: string;
  status?: string;
  isGlobal?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedDocuments {
  documents: KnowledgeDocument[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export class KnowledgeBaseService {
  /**
   * Faz upload e processa um documento
   */
  async uploadDocument(
    file: File,
    config: UploadConfig,
    userId: string
  ): Promise<KnowledgeDocument> {
    try {
      // Processar documento
      const processedDoc = await documentProcessor.processDocument(
        file,
        config
      );

      // Converter MIME type para fileType
      const fileType = this.getFileTypeFromMime(file.type);

      // Salvar documento no banco
      const document = await this.saveDocument({
        ...processedDoc,
        fileType,
        createdBy: userId,
        status: "processing",
        isGlobal: false,
      });

      // Processar chunks e embeddings em background
      this.processDocumentAsync(document.id, processedDoc.chunks);

      return document;
    } catch (error) {
      console.error("Erro ao fazer upload do documento:", error);
      throw new Error(
        `Erro ao processar documento: ${error instanceof Error ? error.message : "Erro desconhecido"}`
      );
    }
  }

  /**
   * Busca conhecimento relevante para uma query
   */
  async searchKnowledge(
    query: string,
    agentId?: string
  ): Promise<SearchResult[]> {
    try {
      // Gerar embedding da query
      const queryEmbedding =
        await embeddingService.generateQueryEmbedding(query);

      // Buscar documentos similares
      const results = await this.performVectorSearch(queryEmbedding, {
        agentId,
        limit: 10,
        threshold: 0.7,
        includeGlobal: true,
      });

      return results;
    } catch (error) {
      console.error("Erro ao buscar conhecimento:", error);
      return [];
    }
  }

  /**
   * Obtém um documento por ID
   */
  async getDocument(id: string): Promise<KnowledgeDocument | null> {
    const documents = await db
      .select()
      .from(knowledgeDocuments)
      .where(eq(knowledgeDocuments.id, id))
      .limit(1);

    return documents[0]
      ? {
          ...documents[0],
          fileType: documents[0].fileType as
            | "pdf"
            | "docx"
            | "txt"
            | "md"
            | "html",
          metadata: documents[0].metadata as Record<string, unknown>,
          status: documents[0].status as "processing" | "active" | "error",
        }
      : null;
  }

  /**
   * Atualiza um documento
   */
  async updateDocument(
    id: string,
    updates: Partial<KnowledgeDocument>
  ): Promise<KnowledgeDocument> {
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };

    await db
      .update(knowledgeDocuments)
      .set(updateData)
      .where(eq(knowledgeDocuments.id, id));

    const updated = await this.getDocument(id);
    if (!updated) {
      throw new Error("Documento não encontrado após atualização");
    }

    return updated;
  }

  /**
   * Deleta um documento
   */
  async deleteDocument(id: string): Promise<void> {
    // Deletar associações primeiro
    await db
      .delete(agentKnowledgeAssociations)
      .where(eq(agentKnowledgeAssociations.documentId, id));

    // Deletar embeddings
    await db
      .delete(knowledgeEmbeddings)
      .where(
        eq(
          knowledgeEmbeddings.chunkId,
          sql`(SELECT id FROM ${knowledgeChunks} WHERE document_id = ${id})`
        )
      );

    // Deletar chunks
    await db.delete(knowledgeChunks).where(eq(knowledgeChunks.documentId, id));

    // Deletar documento
    await db.delete(knowledgeDocuments).where(eq(knowledgeDocuments.id, id));
  }

  /**
   * Reindexa um documento
   */
  async reindexDocument(id: string): Promise<void> {
    const document = await this.getDocument(id);
    if (!document) {
      throw new Error("Documento não encontrado");
    }

    // Deletar chunks e embeddings existentes
    await db
      .delete(knowledgeEmbeddings)
      .where(
        eq(
          knowledgeEmbeddings.chunkId,
          sql`(SELECT id FROM ${knowledgeChunks} WHERE document_id = ${id})`
        )
      );

    await db.delete(knowledgeChunks).where(eq(knowledgeChunks.documentId, id));

    // Reprocessar documento - criar um arquivo temporário para reprocessar
    const tempFile = new File([document.content], document.title, {
      type: `text/${document.fileType}`,
    });
    const processedDoc = await documentProcessor.processDocument(tempFile, {
      title: document.title,
      isGlobal: document.isGlobal,
      metadata: document.metadata,
    });
    await this.processDocumentAsync(id, processedDoc.chunks);
  }

  /**
   * Converte MIME type para fileType
   */
  private getFileTypeFromMime(
    mimeType: string
  ): "pdf" | "docx" | "txt" | "md" | "html" {
    switch (mimeType) {
      case "application/pdf":
        return "pdf";
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return "docx";
      case "text/plain":
        return "txt";
      case "text/markdown":
        return "md";
      case "text/html":
        return "html";
      default:
        return "txt"; // fallback
    }
  }

  /**
   * Lista documentos com filtros
   */
  async getDocuments(
    filters: DocumentFilters = {}
  ): Promise<PaginatedDocuments> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;

    const whereConditions = [];

    if (filters.agentId) {
      whereConditions.push(eq(knowledgeDocuments.agentId, filters.agentId));
    }

    if (filters.status) {
      whereConditions.push(eq(knowledgeDocuments.status, filters.status));
    }

    if (filters.isGlobal !== undefined) {
      whereConditions.push(eq(knowledgeDocuments.isGlobal, filters.isGlobal));
    }

    if (filters.search) {
      whereConditions.push(
        or(
          sql`${knowledgeDocuments.title} ILIKE ${`%${filters.search}%`}`,
          sql`${knowledgeDocuments.content} ILIKE ${`%${filters.search}%`}`
        )
      );
    }

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Buscar documentos
    const documents = await db
      .select()
      .from(knowledgeDocuments)
      .where(whereClause)
      .orderBy(desc(knowledgeDocuments.createdAt))
      .limit(limit)
      .offset(offset);

    // Contar total
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(knowledgeDocuments)
      .where(whereClause);

    const total = totalResult[0]?.count || 0;
    const pages = Math.ceil(total / limit);

    return {
      documents: documents.map((doc) => ({
        ...doc,
        fileType: doc.fileType as "pdf" | "docx" | "txt" | "md" | "html",
        metadata: doc.metadata as Record<string, unknown>,
        status: doc.status as "processing" | "active" | "error",
      })),
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    };
  }

  /**
   * Salva documento no banco
   */
  private async saveDocument(
    document: Omit<KnowledgeDocument, "id" | "createdAt" | "updatedAt">
  ): Promise<KnowledgeDocument> {
    const documentData = {
      id: nanoid(),
      ...document,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(knowledgeDocuments).values(documentData);

    return documentData;
  }

  /**
   * Salva chunks no banco
   */
  private async saveChunks(
    chunks: Array<{
      id: string;
      content: string;
      chunkIndex: number;
      tokenCount: number;
      metadata: Record<string, unknown>;
    }>,
    documentId: string
  ): Promise<void> {
    const chunkData = chunks.map((chunk) => ({
      id: chunk.id,
      documentId,
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      tokenCount: chunk.tokenCount,
      metadata: chunk.metadata,
      createdAt: new Date(),
    }));

    await db.insert(knowledgeChunks).values(chunkData);
  }

  /**
   * Salva embeddings no banco
   */
  private async saveEmbeddings(
    embeddings: Array<{
      id: string;
      chunkId: string;
      embedding: number[];
      model: string;
    }>
  ): Promise<void> {
    const embeddingData = embeddings.map((embedding) => ({
      id: embedding.id,
      chunkId: embedding.chunkId,
      embedding: embedding.embedding,
      model: embedding.model,
      createdAt: new Date(),
    }));

    await db.insert(knowledgeEmbeddings).values(embeddingData);
  }

  /**
   * Cria associações entre agentes e documentos
   */
  private async createAssociations(
    agentIds: string[],
    documentId: string
  ): Promise<void> {
    if (agentIds.length === 0) return;

    const associations = agentIds.map((agentId) => ({
      id: nanoid(),
      agentId,
      documentId,
      priority: 1,
      isActive: true,
      createdAt: new Date(),
    }));

    await db.insert(agentKnowledgeAssociations).values(associations);
  }

  /**
   * Processa documento de forma assíncrona
   */
  private async processDocumentAsync(
    documentId: string,
    chunks: Array<{
      id: string;
      content: string;
      chunkIndex: number;
      tokenCount: number;
      metadata: Record<string, unknown>;
    }>
  ): Promise<void> {
    try {
      // Salvar chunks
      await this.saveChunks(chunks, documentId);

      // Gerar embeddings
      const embeddings = await embeddingService.generateEmbeddings(
        chunks.map((chunk) => ({ id: chunk.id, content: chunk.content }))
      );

      // Salvar embeddings
      await this.saveEmbeddings(embeddings);

      // Atualizar status do documento
      await this.updateDocument(documentId, { status: "active" });

      console.log(`Documento ${documentId} processado com sucesso`);
    } catch (error) {
      console.error(`Erro ao processar documento ${documentId}:`, error);
      await this.updateDocument(documentId, { status: "error" });
    }
  }

  /**
   * Realiza busca vetorial (placeholder - será implementado com pgvector)
   */
  private async performVectorSearch(
    _queryEmbedding: number[],
    _options: SearchOptions
  ): Promise<SearchResult[]> {
    // TODO: Implementar busca vetorial com pgvector
    // Por enquanto, retorna array vazio
    console.log("Busca vetorial com pgvector ainda não implementada");
    return [];
  }
}

// Instância singleton
export const knowledgeBaseService = new KnowledgeBaseService();
