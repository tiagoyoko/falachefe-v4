import { NextRequest, NextResponse } from "next/server";
import { llmService } from "@/lib/llm-service";

// POST /api/test-context - Testar contexto de conversa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, message } = body;

    if (!userId || !message) {
      return NextResponse.json(
        { error: "userId e message são obrigatórios" },
        { status: 400 }
      );
    }

    console.log(`[TEST] Testando contexto para usuário ${userId}: "${message}"`);

    // Processar mensagem
    const response = await llmService.processUserMessage(userId, message);

    console.log(`[TEST] Resposta gerada:`, response);

    return NextResponse.json({
      success: true,
      data: {
        message: response.message,
        action: response.action,
        metadata: response.metadata,
      },
    });
  } catch (error) {
    console.error("Erro no teste de contexto:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
