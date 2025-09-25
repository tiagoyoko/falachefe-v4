import { NextRequest, NextResponse } from "next/server";
import { conversationManager } from "@/lib/conversation-manager";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { eq } from "drizzle-orm";

// POST /api/conversations/individual - Criar conversa individual
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, agentId } = body;

    if (!userId || !agentId) {
      return NextResponse.json(
        { error: "User ID e Agent ID são obrigatórios" },
        { status: 400 }
      );
    }

    // Validar agentId
    const validAgents = ["leo", "max", "lia"];
    if (!validAgents.includes(agentId)) {
      return NextResponse.json(
        { error: "Agent ID inválido. Use: leo, max ou lia" },
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

    // Criar conversa individual
    const conversation = await conversationManager.createIndividualConversation(
      userId,
      agentId as "leo" | "max" | "lia"
    );

    return NextResponse.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error("Erro ao criar conversa individual:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// GET /api/conversations/individual - Listar conversas individuais do usuário
export async function GET(request: NextRequest) {
  try {
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

    // Obter conversas do usuário
    const conversations = await conversationManager.getUserConversations(userId);

    return NextResponse.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("Erro ao listar conversas individuais:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
