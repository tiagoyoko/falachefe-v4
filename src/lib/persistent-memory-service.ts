/**
 * Serviço de memória persistente para conversas e contexto do agente
 * Integra com o banco de dados para manter memória entre sessões
 */

import { db } from "./db";
import {
  conversationSessions,
  conversationMessages,
  conversationSummaries,
} from "./schema";
import { eq, and, desc, asc } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface PersistentConversationContext {
  userId: string;
  sessionId: string;
  agent: string;
  title?: string;
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
  }>;
  summary?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationSummary {
  id: string;
  sessionId: string;
  summary: string;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class PersistentMemoryService {
  private static instance: PersistentMemoryService;

  public static getInstance(): PersistentMemoryService {
    if (!PersistentMemoryService.instance) {
      PersistentMemoryService.instance = new PersistentMemoryService();
    }
    return PersistentMemoryService.instance;
  }

  /**
   * Criar ou obter sessão de conversa
   */
  async getOrCreateSession(
    userId: string,
    agent: string,
    title?: string
  ): Promise<string> {
    // Buscar sessão ativa recente (últimas 24h)
    const recentSession = await db
      .select({ id: conversationSessions.id })
      .from(conversationSessions)
      .where(
        and(
          eq(conversationSessions.userId, userId),
          eq(conversationSessions.agent, agent)
          // Sessão criada nas últimas 24h
          // Note: usando comparação de timestamp diretamente
        )
      )
      .orderBy(desc(conversationSessions.createdAt))
      .limit(1);

    if (recentSession.length > 0) {
      return recentSession[0].id;
    }

    // Criar nova sessão
    const sessionId = nanoid();
    await db.insert(conversationSessions).values({
      id: sessionId,
      userId,
      agent,
      title: title || `Conversa com ${agent}`,
    });

    return sessionId;
  }

  /**
   * Salvar mensagem na conversa
   */
  async saveMessage(
    sessionId: string,
    role: "user" | "assistant",
    content: string
  ): Promise<void> {
    await db.insert(conversationMessages).values({
      id: nanoid(),
      sessionId,
      role,
      content,
    });

    // Atualizar timestamp da sessão
    await db
      .update(conversationSessions)
      .set({ updatedAt: new Date() })
      .where(eq(conversationSessions.id, sessionId));
  }

  /**
   * Obter histórico de conversa recente
   */
  async getRecentHistory(
    userId: string,
    agent: string,
    limit: number = 10
  ): Promise<
    Array<{
      role: "user" | "assistant";
      content: string;
      timestamp: Date;
    }>
  > {
    // Buscar sessão ativa
    const session = await db
      .select({ id: conversationSessions.id })
      .from(conversationSessions)
      .where(
        and(
          eq(conversationSessions.userId, userId),
          eq(conversationSessions.agent, agent)
        )
      )
      .orderBy(desc(conversationSessions.createdAt))
      .limit(1);

    if (session.length === 0) {
      return [];
    }

    const sessionId = session[0].id;

    // Buscar mensagens recentes
    const messages = await db
      .select({
        role: conversationMessages.role,
        content: conversationMessages.content,
        createdAt: conversationMessages.createdAt,
      })
      .from(conversationMessages)
      .where(eq(conversationMessages.sessionId, sessionId))
      .orderBy(asc(conversationMessages.createdAt))
      .limit(limit);

    return messages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
      timestamp: msg.createdAt,
    }));
  }

  /**
   * Obter contexto completo da conversa
   */
  async getConversationContext(
    userId: string,
    agent: string
  ): Promise<PersistentConversationContext | null> {
    // Buscar sessão ativa
    const session = await db
      .select({
        id: conversationSessions.id,
        title: conversationSessions.title,
        createdAt: conversationSessions.createdAt,
        updatedAt: conversationSessions.updatedAt,
      })
      .from(conversationSessions)
      .where(
        and(
          eq(conversationSessions.userId, userId),
          eq(conversationSessions.agent, agent)
        )
      )
      .orderBy(desc(conversationSessions.createdAt))
      .limit(1);

    if (session.length === 0) {
      return null;
    }

    const sessionData = session[0];

    // Buscar mensagens da sessão
    const messages = await db
      .select({
        role: conversationMessages.role,
        content: conversationMessages.content,
        createdAt: conversationMessages.createdAt,
      })
      .from(conversationMessages)
      .where(eq(conversationMessages.sessionId, sessionData.id))
      .orderBy(asc(conversationMessages.createdAt));

    // Buscar resumo se existir
    const summary = await db
      .select({
        summary: conversationSummaries.summary,
      })
      .from(conversationSummaries)
      .where(eq(conversationSummaries.sessionId, sessionData.id))
      .limit(1);

    return {
      userId,
      sessionId: sessionData.id,
      agent,
      title: sessionData.title || undefined,
      messages: messages.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
        timestamp: msg.createdAt,
      })),
      summary: summary.length > 0 ? summary[0].summary : undefined,
      createdAt: sessionData.createdAt,
      updatedAt: sessionData.updatedAt,
    };
  }

  /**
   * Criar resumo da conversa
   */
  async createConversationSummary(
    sessionId: string,
    summary: string
  ): Promise<void> {
    // Verificar se já existe resumo
    const existing = await db
      .select({ id: conversationSummaries.id })
      .from(conversationSummaries)
      .where(eq(conversationSummaries.sessionId, sessionId))
      .limit(1);

    if (existing.length > 0) {
      // Atualizar resumo existente
      await db
        .update(conversationSummaries)
        .set({
          summary,
          lastMessageAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(conversationSummaries.sessionId, sessionId));
    } else {
      // Criar novo resumo
      await db.insert(conversationSummaries).values({
        id: nanoid(),
        sessionId,
        summary,
        lastMessageAt: new Date(),
      });
    }
  }

  /**
   * Obter resumo da conversa
   */
  async getConversationSummary(sessionId: string): Promise<string | null> {
    const result = await db
      .select({ summary: conversationSummaries.summary })
      .from(conversationSummaries)
      .where(eq(conversationSummaries.sessionId, sessionId))
      .limit(1);

    return result.length > 0 ? result[0].summary : null;
  }

  /**
   * Limpar conversas antigas (manter apenas últimas 30 dias)
   */
  async cleanupOldConversations(): Promise<void> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Buscar sessões antigas
    const oldSessions = await db
      .select({ id: conversationSessions.id })
      .from(conversationSessions)
      .where(eq(conversationSessions.createdAt, thirtyDaysAgo));

    // Deletar mensagens e resumos das sessões antigas
    for (const session of oldSessions) {
      await db
        .delete(conversationMessages)
        .where(eq(conversationMessages.sessionId, session.id));

      await db
        .delete(conversationSummaries)
        .where(eq(conversationSummaries.sessionId, session.id));
    }

    // Deletar sessões antigas
    await db
      .delete(conversationSessions)
      .where(eq(conversationSessions.createdAt, thirtyDaysAgo));
  }

  /**
   * Obter todas as conversas do usuário
   */
  async getUserConversations(userId: string): Promise<
    Array<{
      sessionId: string;
      agent: string;
      title: string | null;
      lastMessageAt: Date;
      messageCount: number;
    }>
  > {
    const conversations = await db
      .select({
        sessionId: conversationSessions.id,
        agent: conversationSessions.agent,
        title: conversationSessions.title,
        lastMessageAt: conversationSessions.updatedAt,
      })
      .from(conversationSessions)
      .where(eq(conversationSessions.userId, userId))
      .orderBy(desc(conversationSessions.updatedAt));

    // Contar mensagens para cada conversa
    const conversationsWithCount = await Promise.all(
      conversations.map(async (conv) => {
        const messageCount = await db
          .select({ count: conversationMessages.id })
          .from(conversationMessages)
          .where(eq(conversationMessages.sessionId, conv.sessionId));

        return {
          ...conv,
          messageCount: messageCount.length,
        };
      })
    );

    return conversationsWithCount;
  }
}

export const persistentMemoryService = PersistentMemoryService.getInstance();
