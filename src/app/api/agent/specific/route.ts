import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { processMessageWithSpecificAgent } from "@/lib/orchestrator/agent-squad";

// POST /api/agent/specific - Processar mensagem com agente específico
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, message, agentName } = body;

    if (!userId || !message || !agentName) {
      return NextResponse.json(
        { error: "User ID, mensagem e nome do agente são obrigatórios" },
        { status: 400 }
      );
    }

    // Validar nome do agente
    const validAgents = ["leo", "max", "lia"];
    if (!validAgents.includes(agentName)) {
      return NextResponse.json(
        {
          error: "Nome do agente inválido. Use: leo, max ou lia",
        },
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
        { error: "Usuário não encontrado. Faça login novamente." },
        { status: 404 }
      );
    }

    // Processar mensagem com agente específico
    const sessionId = `${userId}-${Date.now()}`;
    const response = await processMessageWithSpecificAgent(
      message,
      userId,
      sessionId,
      agentName as "leo" | "max" | "lia"
    );

    return NextResponse.json({
      success: true,
      data: {
        message: response.message,
        agentName: response.agentName,
        success: response.success,
      },
    });
  } catch (error) {
    console.error("Erro ao processar mensagem com agente específico:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
