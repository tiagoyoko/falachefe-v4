import { getOrchestrator } from "./orchestrator/agent-squad";
import { db } from "./db";
import { conversationSessions, conversationMessages } from "./schema";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface ConversationSession {
  id: string;
  userId: string;
  type: "individual" | "group";
  agents: string[];
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationMessage {
  id: string;
  sessionId: string;
  agentId?: string; // undefined para mensagens do usuário
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export class ConversationManager {
  /**
   * Criar uma conversa individual com um agente específico
   */
  async createIndividualConversation(
    userId: string,
    agentId: "leo" | "max" | "lia"
  ): Promise<ConversationSession> {
    const sessionId = nanoid();

    await db.insert(conversationSessions).values({
      id: sessionId,
      userId,
      agent: agentId,
      title: `Conversa com ${agentId}`,
    });

    return {
      id: sessionId,
      userId,
      type: "individual",
      agents: [agentId],
      title: `Conversa com ${agentId}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Criar uma conversa em grupo com múltiplos agentes
   */
  async createGroupConversation(
    userId: string,
    agentIds: ("leo" | "max" | "lia")[],
    title?: string
  ): Promise<ConversationSession> {
    const sessionId = nanoid();

    // Para conversas em grupo, usamos o primeiro agente como principal
    // mas mantemos referência a todos os agentes
    await db.insert(conversationSessions).values({
      id: sessionId,
      userId,
      agent: agentIds[0], // Agente principal
      title: title || `Conversa em grupo com ${agentIds.join(", ")}`,
    });

    return {
      id: sessionId,
      userId,
      type: "group",
      agents: agentIds,
      title: title || `Conversa em grupo com ${agentIds.join(", ")}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Enviar mensagem para conversa individual
   */
  async sendIndividualMessage(
    sessionId: string,
    userId: string,
    message: string,
    agentId: "leo" | "max" | "lia"
  ): Promise<ConversationMessage> {
    const orchestrator = getOrchestrator();

    // Salvar mensagem do usuário
    const userMessage: ConversationMessage = {
      id: nanoid(),
      sessionId,
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    await this.saveMessage(userMessage);

    // Processar com agente específico
    const response = await orchestrator.routeRequest(
      message,
      userId,
      sessionId
    );

    // Salvar resposta do agente
    const agentMessage: ConversationMessage = {
      id: nanoid(),
      sessionId,
      agentId,
      role: "assistant",
      content: response.message || "Resposta não disponível",
      timestamp: new Date(),
    };

    await this.saveMessage(agentMessage);

    return agentMessage;
  }

  /**
   * Enviar mensagem para conversa em grupo
   */
  async sendGroupMessage(
    sessionId: string,
    userId: string,
    message: string,
    agentIds: ("leo" | "max" | "lia")[]
  ): Promise<ConversationMessage[]> {
    const orchestrator = getOrchestrator();

    // Salvar mensagem do usuário
    const userMessage: ConversationMessage = {
      id: nanoid(),
      sessionId,
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    await this.saveMessage(userMessage);

    // Processar com cada agente do grupo
    const responses: ConversationMessage[] = [];

    for (const agentId of agentIds) {
      try {
        const response = await orchestrator.routeRequest(
          message,
          userId,
          sessionId
        );

        const agentMessage: ConversationMessage = {
          id: nanoid(),
          sessionId,
          agentId,
          role: "assistant",
          content: response.message || "Resposta não disponível",
          timestamp: new Date(),
        };

        await this.saveMessage(agentMessage);
        responses.push(agentMessage);
      } catch (error) {
        console.error(
          `Erro ao processar mensagem com agente ${agentId}:`,
          error
        );

        // Adicionar mensagem de erro
        const errorMessage: ConversationMessage = {
          id: nanoid(),
          sessionId,
          agentId,
          role: "assistant",
          content: `❌ Erro ao processar com ${agentId}`,
          timestamp: new Date(),
        };

        await this.saveMessage(errorMessage);
        responses.push(errorMessage);
      }
    }

    return responses;
  }

  /**
   * Obter histórico de uma conversa
   */
  async getConversationHistory(
    sessionId: string
  ): Promise<ConversationMessage[]> {
    const messages = await db
      .select({
        id: conversationMessages.id,
        sessionId: conversationMessages.sessionId,
        agentId: conversationSessions.agent,
        role: conversationMessages.role,
        content: conversationMessages.content,
        createdAt: conversationMessages.createdAt,
      })
      .from(conversationMessages)
      .innerJoin(
        conversationSessions,
        eq(conversationSessions.id, conversationMessages.sessionId)
      )
      .where(eq(conversationMessages.sessionId, sessionId))
      .orderBy(conversationMessages.createdAt);

    return messages.map((msg) => ({
      id: msg.id,
      sessionId: msg.sessionId,
      agentId: msg.agentId as "leo" | "max" | "lia" | undefined,
      role: msg.role as "user" | "assistant",
      content: msg.content,
      timestamp: msg.createdAt,
    }));
  }

  /**
   * Obter conversas do usuário
   */
  async getUserConversations(userId: string): Promise<ConversationSession[]> {
    const sessions = await db
      .select({
        id: conversationSessions.id,
        userId: conversationSessions.userId,
        agent: conversationSessions.agent,
        title: conversationSessions.title,
        createdAt: conversationSessions.createdAt,
        updatedAt: conversationSessions.updatedAt,
      })
      .from(conversationSessions)
      .where(eq(conversationSessions.userId, userId))
      .orderBy(desc(conversationSessions.updatedAt));

    return sessions.map((session) => ({
      id: session.id,
      userId: session.userId,
      type: "individual" as const, // Por enquanto, todas são individuais
      agents: [session.agent as "leo" | "max" | "lia"],
      title: session.title || `Conversa com ${session.agent}`,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    }));
  }

  /**
   * Salvar mensagem no banco de dados
   */
  private async saveMessage(message: ConversationMessage): Promise<void> {
    await db.insert(conversationMessages).values({
      id: message.id,
      sessionId: message.sessionId,
      role: message.role,
      content: message.content,
    });
  }
}

export const conversationManager = new ConversationManager();
