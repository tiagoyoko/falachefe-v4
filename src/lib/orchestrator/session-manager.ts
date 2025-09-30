import { db } from "@/lib/db";
import { conversationSessions, conversationMessages } from "@/lib/schema";
import { eq, and, desc, gte, lt } from "drizzle-orm";
// import { nanoid } from "nanoid"; // Not used in current implementation
import { SessionMetricsCollector } from "./session-metrics";

export interface SessionInfo {
  sessionId: string;
  userId: string;
  chatId?: string;
  agentId?: string;
  isActive: boolean;
  lastActivity: Date;
  messageCount: number;
}

export interface ConversationContext {
  sessionId: string;
  recentMessages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  currentTopic?: string;
  userPreferences?: Record<string, unknown>;
}

export class SessionManager {
  private static readonly SESSION_TIMEOUT_MINUTES = 30; // 30 minutos de inatividade
  private static readonly MAX_MESSAGES_PER_SESSION = 50; // Limite de mensagens por sessão
  
  /**
   * Obtém ou cria uma sessão ativa para o usuário
   */
  async getOrCreateActiveSession(
    userId: string, 
    chatId?: string
  ): Promise<SessionInfo> {
    // Primeiro, tenta encontrar uma sessão ativa recente
    const activeSession = await this.findActiveSession(userId, chatId);
    
    if (activeSession) {
      // Atualiza última atividade
      await this.updateLastActivity(activeSession.sessionId);
      return activeSession;
    }
    
    // Se não há sessão ativa, cria uma nova
    const sessionId = this.generateSessionId(userId, chatId);
    
    await db.insert(conversationSessions).values({
      id: sessionId,
      userId,
      agent: 'max', // Default agent
      title: null,
      chatId: chatId || null,
      lastActivity: new Date(),
      isActive: true,
    });
    
    return {
      sessionId,
      userId,
      chatId,
      agentId: 'max',
      isActive: true,
      lastActivity: new Date(),
      messageCount: 0
    };
  }
  
  /**
   * Encontra uma sessão ativa recente para o usuário
   */
  private async findActiveSession(
    userId: string, 
    chatId?: string
  ): Promise<SessionInfo | null> {
    const cutoffTime = new Date(Date.now() - SessionManager.SESSION_TIMEOUT_MINUTES * 60 * 1000);
    
    // Busca sessões ativas recentes
    const sessions = await db
      .select({
        id: conversationSessions.id,
        userId: conversationSessions.userId,
        agent: conversationSessions.agent,
        chatId: conversationSessions.chatId,
        lastActivity: conversationSessions.lastActivity,
        isActive: conversationSessions.isActive,
        createdAt: conversationSessions.createdAt,
      })
      .from(conversationSessions)
      .where(
        and(
          eq(conversationSessions.userId, userId),
          eq(conversationSessions.isActive, true),
          gte(conversationSessions.lastActivity, cutoffTime)
        )
      )
      .orderBy(desc(conversationSessions.lastActivity))
      .limit(5);
    
    // Se há chatId específico, prioriza sessões com esse chatId
    let session = sessions[0];
    if (chatId) {
      const chatSession = sessions.find(s => s.chatId === chatId);
      if (chatSession) {
        session = chatSession;
      }
    }
    
    if (sessions.length === 0) {
      return null;
    }
    
    // Conta mensagens na sessão
    const messageCount = await this.getMessageCount(session.id);
    
    return {
      sessionId: session.id,
      userId: session.userId,
      chatId: session.chatId || chatId,
      agentId: session.agent || 'max',
      isActive: session.isActive,
      lastActivity: session.lastActivity,
      messageCount
    };
  }
  
  /**
   * Atualiza a última atividade de uma sessão
   */
  private async updateLastActivity(sessionId: string): Promise<void> {
    try {
      await db
        .update(conversationSessions)
        .set({
          lastActivity: new Date(),
          updatedAt: new Date()
        })
        .where(eq(conversationSessions.id, sessionId));
      
      console.log(`Atividade atualizada para sessão: ${sessionId}`);
    } catch (error) {
      console.error(`Erro ao atualizar atividade da sessão ${sessionId}:`, error);
      throw error;
    }
  }
  
  /**
   * Conta mensagens em uma sessão
   */
  private async getMessageCount(sessionId: string): Promise<number> {
    const messages = await db
      .select({ id: conversationMessages.id })
      .from(conversationMessages)
      .where(eq(conversationMessages.sessionId, sessionId));
    
    return messages.length;
  }
  
  /**
   * Gera um ID de sessão consistente
   */
  private generateSessionId(userId: string, chatId?: string): string {
    const base = chatId ? `${userId}_${chatId}` : userId;
    const timestamp = Math.floor(Date.now() / (1000 * 60 * 60)); // Muda a cada hora
    return `${base}_${timestamp}`;
  }
  
  /**
   * Obtém o contexto da conversa para classificação
   */
  async getConversationContext(
    sessionId: string, 
    maxMessages: number = 10
  ): Promise<ConversationContext> {
    const messages = await db
      .select({
        role: conversationMessages.role,
        content: conversationMessages.content,
        createdAt: conversationMessages.createdAt,
      })
      .from(conversationMessages)
      .where(eq(conversationMessages.sessionId, sessionId))
      .orderBy(desc(conversationMessages.createdAt))
      .limit(maxMessages);
    
    const recentMessages = messages.reverse().map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
      timestamp: msg.createdAt
    }));
    
    // Determina o tópico atual baseado nas mensagens recentes
    const currentTopic = this.extractCurrentTopic(recentMessages);
    
    return {
      sessionId,
      recentMessages,
      currentTopic,
      userPreferences: {} // TODO: Implementar preferências do usuário
    };
  }
  
  /**
   * Extrai o tópico atual da conversa
   */
  private extractCurrentTopic(messages: ConversationContext['recentMessages']): string | undefined {
    if (messages.length === 0) return undefined;
    
    // Lógica simples para determinar tópico
    const lastMessage = messages[messages.length - 1];
    const content = lastMessage.content.toLowerCase();
    
    if (content.includes('receita') || content.includes('despesa') || content.includes('saldo')) {
      return 'financeiro';
    } else if (content.includes('venda') || content.includes('cliente') || content.includes('campanha')) {
      return 'marketing';
    } else if (content.includes('funcionário') || content.includes('equipe') || content.includes('contratar')) {
      return 'rh';
    }
    
    return 'geral';
  }
  
  /**
   * Finaliza uma sessão (marca como inativa)
   */
  async closeSession(sessionId: string): Promise<void> {
    try {
      await db
        .update(conversationSessions)
        .set({
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(conversationSessions.id, sessionId));
      
      console.log(`Sessão finalizada: ${sessionId}`);
    } catch (error) {
      console.error(`Erro ao finalizar sessão ${sessionId}:`, error);
      throw error;
    }
  }
  
  /**
   * Limpa sessões antigas e inativas
   */
  async cleanupOldSessions(): Promise<number> {
    const cutoffTime = new Date(Date.now() - SessionManager.SESSION_TIMEOUT_MINUTES * 60 * 1000);
    
    try {
      // Marca sessões antigas como inativas (soft delete)
      const result = await db
        .update(conversationSessions)
        .set({
          isActive: false,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(conversationSessions.isActive, true),
            lt(conversationSessions.lastActivity, cutoffTime)
          )
        );
      
      console.log(`Sessões marcadas como inativas anteriores a: ${cutoffTime.toISOString()}`);
      
      // Retorna o número de sessões afetadas
      return result.length || 0;
    } catch (error) {
      console.error('Erro ao limpar sessões antigas:', error);
      throw error;
    }
  }

  /**
   * Obtém métricas de performance das sessões
   */
  getPerformanceMetrics() {
    return SessionMetricsCollector.getMetrics();
  }

  /**
   * Obtém alertas de performance
   */
  getPerformanceAlerts() {
    return SessionMetricsCollector.getPerformanceAlerts();
  }

  /**
   * Limpa métricas antigas
   */
  cleanupMetrics() {
    SessionMetricsCollector.cleanupOldMetrics();
  }
}

// Singleton instance
export const sessionManager = new SessionManager();


