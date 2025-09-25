import { NextRequest, NextResponse } from "next/server";
import { conversationManager } from "@/lib/conversation-manager";
import { db } from "@/lib/db";
import { user, conversationSessions } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

// POST /api/conversations/[sessionId]/message - Enviar mensagem para conversa
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const body = await request.json();
    const { userId, message, agentId, agentIds } = body;

    if (!userId || !message) {
      return NextResponse.json(
        { error: "User ID e mensagem são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se usuário existe
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se sessão existe e pertence ao usuário
    const session = await db
      .select({
        id: conversationSessions.id,
        userId: conversationSessions.userId,
        agent: conversationSessions.agent,
      })
      .from(conversationSessions)
      .where(
        and(
          eq(conversationSessions.id, sessionId),
          eq(conversationSessions.userId, userId)
        )
      )
      .limit(1);

    if (session.length === 0) {
      return NextResponse.json(
        { error: "Sessão não encontrada ou não pertence ao usuário" },
        { status: 404 }
      );
    }

    let response;

    // Determinar tipo de conversa baseado nos parâmetros
    if (agentId) {
      // Conversa individual
      response = await conversationManager.sendIndividualMessage(
        sessionId,
        userId,
        message,
        agentId as "leo" | "max" | "lia"
      );
    } else if (agentIds && Array.isArray(agentIds)) {
      // Conversa em grupo
      const responses = await conversationManager.sendGroupMessage(
        sessionId,
        userId,
        message,
        agentIds as ("leo" | "max" | "lia")[]
      );
      response = responses;
    } else {
      // Usar agente da sessão como padrão
      const defaultAgent = session[0].agent as "leo" | "max" | "lia";
      response = await conversationManager.sendIndividualMessage(
        sessionId,
        userId,
        message,
        defaultAgent
      );
    }

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// GET /api/conversations/[sessionId]/message - Obter histórico da conversa
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se usuário existe
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se sessão existe e pertence ao usuário
    const session = await db
      .select({
        id: conversationSessions.id,
        userId: conversationSessions.userId,
      })
      .from(conversationSessions)
      .where(
        and(
          eq(conversationSessions.id, sessionId),
          eq(conversationSessions.userId, userId)
        )
      )
      .limit(1);

    if (session.length === 0) {
      return NextResponse.json(
        { error: "Sessão não encontrada ou não pertence ao usuário" },
        { status: 404 }
      );
    }

    // Obter histórico da conversa
    const history = await conversationManager.getConversationHistory(sessionId);

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("Erro ao obter histórico da conversa:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
