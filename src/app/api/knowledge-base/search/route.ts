import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth-server";
import { knowledgeBaseService } from "@/lib/knowledge-base/knowledge-base-service";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { query, agentId } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query é obrigatória e deve ser uma string" },
        { status: 400 }
      );
    }

    const results = await knowledgeBaseService.searchKnowledge(query, agentId);

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Erro ao buscar conhecimento:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno",
      },
      { status: 500 }
    );
  }
}
