import { ChatStorage } from "agent-squad/dist/storage/chatStorage";
import { ConversationMessage, ParticipantRole } from "agent-squad/dist/types";
import { db } from "@/lib/db";
import { conversationMessages, conversationSessions } from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

export class DrizzleChatStorage extends ChatStorage {
  async saveChatMessage(
    userId: string,
    sessionId: string,
    agentId: string,
    newMessage: ConversationMessage,
    maxHistorySize: number = 10
  ): Promise<ConversationMessage[]> {
    // Garantir sessão
    const [existing] = await db
      .select({ id: conversationSessions.id })
      .from(conversationSessions)
      .where(eq(conversationSessions.id, sessionId))
      .limit(1);

    if (!existing) {
      await db.insert(conversationSessions).values({
        id: sessionId,
        userId,
        agent: agentId,
        title: null,
      });
    }

    await db.insert(conversationMessages).values({
      id: nanoid(),
      sessionId,
      role: newMessage.role,
      content:
        typeof newMessage.content === "string"
          ? newMessage.content
          : JSON.stringify(newMessage.content ?? []),
    });

    const rows = await db
      .select({
        role: conversationMessages.role,
        content: conversationMessages.content,
      })
      .from(conversationMessages)
      .where(eq(conversationMessages.sessionId, sessionId))
      .orderBy(desc(conversationMessages.createdAt))
      .limit(maxHistorySize);

    // Retorna em ordem cronológica
    return rows.reverse().map((r) => ({
      role: (r.role as ParticipantRole) ?? ParticipantRole.USER,
      content: this.parseContent(r.content),
    }));
  }

  async fetchChat(
    _userId: string,
    sessionId: string,
    _agentId: string,
    maxHistorySize: number = 10
  ): Promise<ConversationMessage[]> {
    const rows = await db
      .select({
        role: conversationMessages.role,
        content: conversationMessages.content,
      })
      .from(conversationMessages)
      .where(eq(conversationMessages.sessionId, sessionId))
      .orderBy(desc(conversationMessages.createdAt))
      .limit(maxHistorySize);

    return rows.reverse().map((r) => ({
      role: (r.role as ParticipantRole) ?? ParticipantRole.USER,
      content: this.parseContent(r.content),
    }));
  }

  async fetchAllChats(
    userId: string,
    sessionId: string
  ): Promise<ConversationMessage[]> {
    const rows = await db
      .select({
        role: conversationMessages.role,
        content: conversationMessages.content,
      })
      .from(conversationMessages)
      .innerJoin(
        conversationSessions,
        and(
          eq(conversationSessions.id, conversationMessages.sessionId),
          eq(conversationSessions.userId, userId)
        )
      )
      .where(eq(conversationMessages.sessionId, sessionId))
      .orderBy(desc(conversationMessages.createdAt));

    return rows.reverse().map((r) => ({
      role: (r.role as ParticipantRole) ?? ParticipantRole.USER,
      content: this.parseContent(r.content),
    }));
  }

  private parseContent(
    content: string
  ): Array<Record<string, unknown>> | undefined {
    if (!content) return undefined;
    const trimmed = content.trim();
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed)
          ? (parsed as Array<Record<string, unknown>>)
          : [{ text: content }];
      } catch {
        return [{ text: content }];
      }
    }
    return [{ text: content }];
  }
}
