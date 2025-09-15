/**
 * Serviço para gerenciar contexto de conversas e transações pendentes
 */

import { llmExtractionService } from "./llm-extraction-service";

export interface TransactionContext {
  id: string;
  userId: string;
  description?: string;
  amount?: number;
  type?: "receita" | "despesa";
  category?: string;
  categoryId?: string;
  date?: string;
  parsedDate?: Date;
  missingFields: string[];
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

export interface ConversationContext {
  userId: string;
  lastTransactionContext?: TransactionContext;
  conversationHistory: Array<{
    timestamp: Date;
    userMessage: string;
    systemResponse: string;
    action?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export class ContextService {
  private static instance: ContextService;
  private contexts: Map<string, ConversationContext> = new Map();
  private transactionContexts: Map<string, TransactionContext> = new Map();

  public static getInstance(): ContextService {
    if (!ContextService.instance) {
      ContextService.instance = new ContextService();
    }
    return ContextService.instance;
  }

  /**
   * Obter contexto de conversa do usuário
   */
  getConversationContext(userId: string): ConversationContext | null {
    const context = this.contexts.get(userId);

    // Verificar se o contexto expirou (30 minutos)
    if (context && context.updatedAt < new Date(Date.now() - 30 * 60 * 1000)) {
      this.clearUserContext(userId);
      return null;
    }

    return context || null;
  }

  /**
   * Criar ou atualizar contexto de conversa
   */
  createOrUpdateConversationContext(
    userId: string,
    userMessage: string,
    systemResponse: string,
    action?: string
  ): ConversationContext {
    const existingContext = this.contexts.get(userId);

    if (existingContext) {
      // Atualizar contexto existente
      existingContext.conversationHistory.push({
        timestamp: new Date(),
        userMessage,
        systemResponse,
        action,
      });
      existingContext.updatedAt = new Date();

      // Manter apenas os últimos 10 itens do histórico
      if (existingContext.conversationHistory.length > 10) {
        existingContext.conversationHistory =
          existingContext.conversationHistory.slice(-10);
      }

      return existingContext;
    } else {
      // Criar novo contexto
      const newContext: ConversationContext = {
        userId,
        conversationHistory: [
          {
            timestamp: new Date(),
            userMessage,
            systemResponse,
            action,
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.contexts.set(userId, newContext);
      return newContext;
    }
  }

  /**
   * Definir contexto de transação pendente
   */
  setTransactionContext(
    userId: string,
    transactionData: Partial<TransactionContext>
  ): TransactionContext {
    const contextId = `${userId}_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    const transactionContext: TransactionContext = {
      id: contextId,
      userId,
      description: transactionData.description,
      amount: transactionData.amount,
      type: transactionData.type,
      category: transactionData.category,
      categoryId: transactionData.categoryId,
      date: transactionData.date,
      parsedDate: transactionData.parsedDate,
      missingFields: transactionData.missingFields || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt,
    };

    this.transactionContexts.set(contextId, transactionContext);

    // Garantir que exista um ConversationContext e anexar a transação pendente
    let conversationContext = this.getConversationContext(userId);
    if (!conversationContext) {
      conversationContext = {
        userId,
        conversationHistory: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.contexts.set(userId, conversationContext);
    }

    conversationContext.lastTransactionContext = transactionContext;
    conversationContext.updatedAt = new Date();

    return transactionContext;
  }

  /**
   * Obter contexto de transação pendente
   */
  getTransactionContext(userId: string): TransactionContext | null {
    const conversationContext = this.getConversationContext(userId);
    if (!conversationContext?.lastTransactionContext) {
      return null;
    }

    const transactionContext = conversationContext.lastTransactionContext;

    // Verificar se expirou
    if (transactionContext.expiresAt < new Date()) {
      this.clearTransactionContext(userId);
      return null;
    }

    return transactionContext;
  }

  /**
   * Atualizar contexto de transação pendente
   */
  updateTransactionContext(
    userId: string,
    updates: Partial<TransactionContext>
  ): TransactionContext | null {
    const transactionContext = this.getTransactionContext(userId);
    if (!transactionContext) {
      return null;
    }

    // Atualizar campos
    if (updates.description !== undefined) {
      transactionContext.description = updates.description;
    }
    if (updates.amount !== undefined) {
      transactionContext.amount = updates.amount;
    }
    if (updates.type !== undefined) {
      transactionContext.type = updates.type;
    }
    if (updates.category !== undefined) {
      transactionContext.category = updates.category;
    }
    if (updates.categoryId !== undefined) {
      transactionContext.categoryId = updates.categoryId;
    }
    if (updates.date !== undefined) {
      transactionContext.date = updates.date;
    }
    if (updates.parsedDate !== undefined) {
      transactionContext.parsedDate = updates.parsedDate;
    }
    if (updates.missingFields !== undefined) {
      transactionContext.missingFields = updates.missingFields;
    }

    transactionContext.updatedAt = new Date();

    // Atualizar no contexto de conversa
    const conversationContext = this.getConversationContext(userId);
    if (conversationContext) {
      conversationContext.lastTransactionContext = transactionContext;
      conversationContext.updatedAt = new Date();
    }

    return transactionContext;
  }

  /**
   * Verificar se uma mensagem é uma resposta a uma transação pendente usando LLM
   */
  async isResponseToPendingTransaction(
    userId: string,
    message: string
  ): Promise<boolean> {
    const transactionContext = this.getTransactionContext(userId);

    if (!transactionContext) {
      return false;
    }

    try {
      const result = await llmExtractionService.detectContextResponse(
        message,
        transactionContext.missingFields
      );

      return result.isResponse && result.confidence > 0.7;
    } catch (error) {
      console.error("Erro na detecção de resposta de contexto:", error);
      return false;
    }
  }

  /**
   * Processar resposta do usuário para transação pendente usando LLM
   */
  async processTransactionResponse(
    userId: string,
    message: string
  ): Promise<{
    updated: boolean;
    transactionContext: TransactionContext | null;
    responseType: string;
  }> {
    const transactionContext = this.getTransactionContext(userId);

    if (!transactionContext) {
      return { updated: false, transactionContext: null, responseType: "none" };
    }

    try {
      const result = await llmExtractionService.detectContextResponse(
        message,
        transactionContext.missingFields
      );

      if (!result.isResponse || result.confidence < 0.7) {
        return { updated: false, transactionContext, responseType: "none" };
      }

      let updated = false;
      let responseType = result.responseType || "none";

      // Processar resposta de data
      if (result.responseType === "date" && result.extractedData?.date) {
        transactionContext.date = result.extractedData.date;
        transactionContext.missingFields =
          transactionContext.missingFields.filter((f) => f !== "data");
        updated = true;
      }

      // Processar resposta de categoria
      if (
        result.responseType === "category" &&
        result.extractedData?.category
      ) {
        transactionContext.category = result.extractedData.category;
        transactionContext.missingFields =
          transactionContext.missingFields.filter((f) => f !== "categoria");
        updated = true;
      }

      // Processar confirmação
      if (
        result.responseType === "confirmation" &&
        result.extractedData?.confirmation
      ) {
        responseType = "confirm";
      }

      if (updated) {
        this.updateTransactionContext(userId, transactionContext);
      }

      return { updated, transactionContext, responseType };
    } catch (error) {
      console.error("Erro no processamento de resposta de transação:", error);
      return { updated: false, transactionContext, responseType: "none" };
    }
  }

  /**
   * Limpar contexto de transação pendente
   */
  clearTransactionContext(userId: string): void {
    const conversationContext = this.getConversationContext(userId);
    if (conversationContext) {
      conversationContext.lastTransactionContext = undefined;
      conversationContext.updatedAt = new Date();
    }
  }

  /**
   * Limpar todo o contexto do usuário
   */
  clearUserContext(userId: string): void {
    this.contexts.delete(userId);
    // Limpar transações pendentes do usuário
    for (const [id, context] of this.transactionContexts.entries()) {
      if (context.userId === userId) {
        this.transactionContexts.delete(id);
      }
    }
  }

  /**
   * Limpar contextos expirados
   */
  cleanupExpiredContexts(): void {
    const now = new Date();

    // Limpar contextos de conversa expirados
    for (const [userId, context] of this.contexts.entries()) {
      if (context.updatedAt < new Date(now.getTime() - 30 * 60 * 1000)) {
        this.contexts.delete(userId);
      }
    }

    // Limpar contextos de transação expirados
    for (const [id, context] of this.transactionContexts.entries()) {
      if (context.expiresAt < now) {
        this.transactionContexts.delete(id);
      }
    }
  }

  /**
   * Obter histórico de conversa recente
   */
  getRecentConversationHistory(
    userId: string,
    limit: number = 5
  ): Array<{
    timestamp: Date;
    userMessage: string;
    systemResponse: string;
    action?: string;
  }> {
    const context = this.getConversationContext(userId);
    if (!context) {
      return [];
    }

    return context.conversationHistory.slice(-limit);
  }
}

export const contextService = ContextService.getInstance();
