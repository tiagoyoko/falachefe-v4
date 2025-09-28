import { db } from "@/lib/db";
import { conversationSessions, conversationMessages } from "@/lib/schema";
import { eq, and, desc, gte } from "drizzle-orm";
import { nanoid } from "nanoid";

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
  userPreferences?: Record<string, any>;
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
        createdAt: conversationSessions.createdAt,
      })
      .from(conversationSessions)
      .where(
        and(
          eq(conversationSessions.userId, userId),
          gte(conversationSessions.createdAt, cutoffTime)
        )
      )
      .orderBy(desc(conversationSessions.createdAt))
      .limit(5);
    
    // Se há chatId específico, prioriza sessões com esse chatId
    if (chatId) {
      // TODO: Adicionar campo chatId na tabela conversationSessions se necessário
      // Por enquanto, usa a sessão mais recente
    }
    
    if (sessions.length === 0) {
      return null;
    }
    
    const session = sessions[0];
    
    // Conta mensagens na sessão
    const messageCount = await this.getMessageCount(session.id);
    
    return {
      sessionId: session.id,
      userId: session.userId,
      chatId,
      agentId: session.agent || 'max',
      isActive: true,
      lastActivity: session.createdAt,
      messageCount
    };
  }
  
  /**
   * Atualiza a última atividade de uma sessão
   */
  private async updateLastActivity(sessionId: string): Promise<void> {
    // TODO: Adicionar campo lastActivity na tabela conversationSessions
    // Por enquanto, apenas log
    console.log(`Atualizando atividade da sessão: ${sessionId}`);
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
    // TODO: Implementar marcação de sessão como inativa
    console.log(`Finalizando sessão: ${sessionId}`);
  }
  
  /**
   * Limpa sessões antigas e inativas
   */
  async cleanupOldSessions(): Promise<number> {
    const cutoffTime = new Date(Date.now() - SessionManager.SESSION_TIMEOUT_MINUTES * 60 * 1000);
    
    // TODO: Implementar limpeza de sessões antigas
    console.log(`Limpando sessões anteriores a: ${cutoffTime.toISOString()}`);
    
    return 0; // Retorna número de sessões removidas
  }
}

// Singleton instance
export const sessionManager = new SessionManager();


