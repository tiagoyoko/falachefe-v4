import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { supervise } from "@/agents/supervisor";
import { getOrchestrator } from "@/lib/orchestrator/agent-squad";
import { extractAgentMessage } from "@/lib/orchestrator/response";
import { llmService } from "@/lib/llm-service";

// POST /api/agent - Processar comando do agente de fluxo de caixa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, command } = body;

    if (!userId || !command) {
      return NextResponse.json(
        { error: "User ID e comando são obrigatórios" },
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

    // Tentar via AgentSquad; fallback para supervisor em caso de erro
    let response: unknown;
    try {
      const orchestrator = getOrchestrator();
      const sessionId = `${userId}`; // simples por enquanto; pode ser chatId
      response = await orchestrator.routeRequest(command, userId, sessionId);
    } catch {
      response = await supervise({ userId, message: command });
    }

    const message = await extractAgentMessage(response);
    return NextResponse.json({
      success: Boolean(message),
      data: message ?? null,
    });
  } catch (error) {
    console.error("Erro ao processar comando do agente:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// GET /api/agent - Obter insights proativos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type") as "insights" | "summary" | undefined;

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
        { error: "Usuário não encontrado. Faça login novamente." },
        { status: 404 }
      );
    }

    let response;

    if (type === "insights") {
      // Gerar insights proativos
      response = await llmService.generateProactiveInsights(userId);
    } else {
      // Resposta padrão com boas-vindas
      response = await llmService.processUserMessage(
        userId,
        "Olá, preciso de ajuda com meu negócio"
      );
    }

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Erro ao obter insights:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
