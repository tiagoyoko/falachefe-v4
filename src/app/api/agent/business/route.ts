import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { llmService } from "@/lib/llm-service";

// POST /api/agent/business - Processar comandos especializados de negócio
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, command, commandType } = body;

    if (!userId || !command || !commandType) {
      return NextResponse.json(
        { error: "User ID, comando e tipo de comando são obrigatórios" },
        { status: 400 }
      );
    }

    // Validar tipo de comando
    const validTypes = ["finance", "marketing", "sales", "general"];
    if (!validTypes.includes(commandType)) {
      return NextResponse.json(
        {
          error:
            "Tipo de comando inválido. Use: finance, marketing, sales ou general",
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

    // Processar comando especializado usando LLM
    const response = await llmService.processBusinessCommand(
      userId,
      command,
      commandType as "finance" | "marketing" | "sales" | "general"
    );

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Erro ao processar comando de negócio:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
