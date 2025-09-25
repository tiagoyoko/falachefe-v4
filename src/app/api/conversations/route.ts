import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { conversationMessages, conversationSessions } from "@/lib/schema";
import { and, asc, desc, eq, sql } from "drizzle-orm";

function parseContent(raw: string | null): string {
  if (!raw) return "";
  const t = raw.trim();
  if (t.startsWith("[")) {
    try {
      const arr = JSON.parse(t);
      if (Array.isArray(arr)) {
        const textItem = arr.find(
          (x) => x && typeof x === "object" && "text" in x
        );
        if (textItem && typeof textItem.text === "string")
          return textItem.text as string;
      }
    } catch {}
  }
  return raw;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const agent = searchParams.get("agent"); // leo | max | lia | geral
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(
      50,
      Math.max(1, Number(searchParams.get("pageSize")) || 5)
    );
    const limitMessages = Number(searchParams.get("limitMessages")) || 50;

    if (!userId) {
      return NextResponse.json(
        { error: "userId é obrigatório" },
        { status: 400 }
      );
    }

    const where = agent
      ? and(
          eq(conversationSessions.userId, userId),
          eq(conversationSessions.agent, agent)
        )
      : eq(conversationSessions.userId, userId);

    const sessions = await db
      .select()
      .from(conversationSessions)
      .where(where)
      .orderBy(desc(conversationSessions.updatedAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const results: Array<{
      sessionId: string;
      agent: string;
      title: string | null;
      updatedAt: Date;
      messages: Array<{ role: string; content: string; createdAt: Date }>;
    }> = [];

    for (const s of sessions) {
      const msgs = await db
        .select({
          role: conversationMessages.role,
          content: conversationMessages.content,
          createdAt: conversationMessages.createdAt,
        })
        .from(conversationMessages)
        .where(eq(conversationMessages.sessionId, s.id))
        .orderBy(asc(conversationMessages.createdAt))
        .limit(limitMessages);

      results.push({
        sessionId: s.id,
        agent: s.agent,
        title: s.title ?? null,
        updatedAt: s.updatedAt as Date,
        messages: msgs.map((m) => ({
          role: m.role || "assistant",
          content: parseContent(m.content || null),
          createdAt: m.createdAt as Date,
        })),
      });
    }

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(conversationSessions)
      .where(where);

    const hasMore = (page - 1) * pageSize + sessions.length < Number(count);
    return NextResponse.json({
      success: true,
      data: { sessions: results, pagination: { page, pageSize, hasMore } },
    });
  } catch (e) {
    console.error("Erro ao listar conversas:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
