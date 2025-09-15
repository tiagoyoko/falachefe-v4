import { NextRequest, NextResponse } from "next/server";
import { categorizationService } from "@/lib/categorization-service";

// POST /api/categorization - Categorizar transação automaticamente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, description, type, amount } = body;

    // Validações
    if (!userId || !description || !type) {
      return NextResponse.json(
        { error: "User ID, descrição e tipo são obrigatórios" },
        { status: 400 }
      );
    }

    if (type !== "receita" && type !== "despesa") {
      return NextResponse.json(
        { error: "Tipo deve ser 'receita' ou 'despesa'" },
        { status: 400 }
      );
    }

    // Categorizar transação
    const result = await categorizationService.categorizeTransaction(
      userId,
      description,
      type as "receita" | "despesa",
      amount
    );

    return NextResponse.json({
      success: true,
      data: {
        categorization: result,
        message: result.suggestedCategoryId
          ? "Categoria sugerida com sucesso!"
          : "Nenhuma categoria apropriada encontrada",
      },
    });
  } catch (error) {
    console.error("Erro ao categorizar transação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// GET /api/categorization/suggestions - Sugerir múltiplas categorias
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const description = searchParams.get("description");
    const type = searchParams.get("type");
    const amount = searchParams.get("amount");

    if (!userId || !description || !type) {
      return NextResponse.json(
        { error: "User ID, descrição e tipo são obrigatórios" },
        { status: 400 }
      );
    }

    if (type !== "receita" && type !== "despesa") {
      return NextResponse.json(
        { error: "Tipo deve ser 'receita' ou 'despesa'" },
        { status: 400 }
      );
    }

    // Sugerir categorias
    const suggestions = await categorizationService.suggestCategories(
      userId,
      description,
      type as "receita" | "despesa",
      amount ? parseFloat(amount) : undefined
    );

    return NextResponse.json({
      success: true,
      data: {
        suggestions,
        message:
          suggestions.length > 0
            ? `${suggestions.length} categorias sugeridas`
            : "Nenhuma categoria encontrada",
      },
    });
  } catch (error) {
    console.error("Erro ao sugerir categorias:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
