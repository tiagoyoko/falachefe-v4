import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { supervise } from "@/agents/supervisor";
import { getOrchestrator } from "@/lib/orchestrator/agent-squad";
import { extractAgentMessage } from "@/lib/orchestrator/response";
import { llmService } from "@/lib/llm-service";
import { 
  processMessageWithMultiLayerClassification,
  processMessageWithSpecificAgent,
  getClassificationStats 
} from "@/lib/orchestrator/enhanced-agent-squad";

// POST /api/agent - Processar comando com classificação multi-camada
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, command, useMultiLayer = true, agentName, conversationHistory } = body;

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

    // Extrair chatId do corpo da requisição se disponível
    const chatId = body.chatId;

    let response;
    
    if (useMultiLayer) {
      // Usar classificação multi-camada com sessões persistentes
      try {
        response = await processMessageWithMultiLayerClassification(
          command,
          userId,
          chatId,
          conversationHistory
        );
      } catch (error) {
        console.error("Erro na classificação multi-camada, usando fallback:", error);
        // Fallback para processamento simples
        response = await processMessageWithSpecificAgent(command, userId, chatId, "max");
      }
    } else if (agentName) {
      // Usar agente específico com sessões persistentes
      response = await processMessageWithSpecificAgent(
        command,
        userId,
        chatId,
        agentName as "leo" | "max" | "lia"
      );
    } else {
      // Fallback para sistema antigo com sessão temporária
      const fallbackSessionId = `${userId}_${Date.now()}`;
      try {
        const orchestrator = getOrchestrator();
        const fallbackResponse = await orchestrator.routeRequest(command, userId, fallbackSessionId);
        const message = await extractAgentMessage(fallbackResponse);
        
        response = {
          message: message || "Resposta não disponível",
          agentName: "max",
          success: Boolean(message),
          classification: {
            primaryIntent: "geral" as const,
            secondaryIntent: { general: "outro" as const },
            urgency: "media" as const,
            conversationContext: "inicial" as const,
            confidence: 0.5,
            reasoning: "Fallback para sistema antigo"
          },
          priority: 1,
          processingTime: 0,
          metadata: {
            sessionId: fallbackSessionId,
            userId,
            timestamp: new Date(),
            confidence: 0.5,
          },
        };
      } catch {
        const superviseResponse = await supervise({ userId, message: command });
        response = {
          message: superviseResponse.message || "Resposta não disponível",
          agentName: "max",
          success: superviseResponse.success,
          classification: {
            primaryIntent: "geral" as const,
            secondaryIntent: { general: "outro" as const },
            urgency: "media" as const,
            conversationContext: "inicial" as const,
            confidence: 0.5,
            reasoning: "Fallback via supervisor"
          },
          priority: 1,
          processingTime: 0,
          metadata: {
            sessionId: fallbackSessionId,
            userId,
            timestamp: new Date(),
            confidence: 0.5,
          },
        };
      }
    }

    return NextResponse.json({
      success: response.success,
      data: response.message,
      metadata: {
        agent: response.agentName,
        classification: response.classification,
        priority: response.priority,
        processingTime: response.processingTime,
        confidence: response.metadata.confidence,
        sessionId: response.metadata.sessionId,
      },
    });
  } catch (error) {
    console.error("Erro ao processar comando do agente:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// GET /api/agent - Obter insights proativos ou estatísticas de classificação
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type") as "insights" | "summary" | "stats" | undefined;

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

    if (type === "stats") {
      // Obter estatísticas de classificação multi-camada
      const stats = await getClassificationStats(userId);
      return NextResponse.json({
        success: true,
        data: {
          type: "classification_stats",
          stats,
          message: "Estatísticas de classificação multi-camada obtidas com sucesso"
        },
      });
    } else if (type === "insights") {
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
