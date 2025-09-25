import { NextRequest, NextResponse } from "next/server";
import { conversationManager } from "@/lib/conversation-manager";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { eq } from "drizzle-orm";

// POST /api/conversations/group - Criar conversa em grupo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, agentIds, title } = body;

    if (!userId || !agentIds || !Array.isArray(agentIds)) {
      return NextResponse.json(
        { error: "User ID e Agent IDs são obrigatórios" },
        { status: 400 }
      );
    }

    // Validar agentIds
    const validAgents = ["leo", "max", "lia"];
    const invalidAgents = agentIds.filter((id) => !validAgents.includes(id));

    if (invalidAgents.length > 0) {
      return NextResponse.json(
        {
          error: `Agent IDs inválidos: ${invalidAgents.join(", ")}. Use: leo, max ou lia`,
        },
        { status: 400 }
      );
    }

    if (agentIds.length < 2) {
      return NextResponse.json(
        { error: "Conversa em grupo deve ter pelo menos 2 agentes" },
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

    // Criar conversa em grupo
    const conversation = await conversationManager.createGroupConversation(
      userId,
      agentIds as ("leo" | "max" | "lia")[],
      title
    );

    return NextResponse.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error("Erro ao criar conversa em grupo:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
