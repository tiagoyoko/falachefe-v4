import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { transactions, categories } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { categorizationService } from "@/lib/categorization-service";
import { dateParser } from "@/lib/date-parser";
import { contextService } from "@/lib/context-service";

// POST /api/transactions/confirm - Confirmar e registrar transação
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      description,
      amount,
      type,
      category,
      date,
      autoCategorize = true,
    } = body;

    // Validações básicas
    if (!userId || !description || !amount || !type) {
      return NextResponse.json(
        { error: "User ID, descrição, valor e tipo são obrigatórios" },
        { status: 400 }
      );
    }

    if (type !== "receita" && type !== "despesa") {
      return NextResponse.json(
        { error: "Tipo deve ser 'receita' ou 'despesa'" },
        { status: 400 }
      );
    }

    const amountNumber = parseFloat(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      return NextResponse.json(
        { error: "Valor deve ser um número positivo" },
        { status: 400 }
      );
    }

    // Processar data
    let transactionDate: Date;
    if (date) {
      const dateResult = dateParser.parseDate(date);
      if (dateResult.success && dateResult.date) {
        const validation = dateParser.validateDate(dateResult.date);
        if (validation.valid) {
          transactionDate = dateResult.date;
        } else {
          return NextResponse.json(
            { error: `Data inválida: ${validation.error}` },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          { error: `Erro ao processar data: ${dateResult.error}` },
          { status: 400 }
        );
      }
    } else {
      transactionDate = new Date();
    }

    // Processar categoria
    let categoryId: string | null = null;
    let categorizationResult = null;

    if (category) {
      // Buscar categoria existente pelo nome
      const existingCategory = await db
        .select()
        .from(categories)
        .where(
          and(
            eq(categories.userId, userId),
            eq(categories.name, category),
            eq(categories.type, type as "receita" | "despesa"),
            eq(categories.isActive, true)
          )
        )
        .limit(1);

      if (existingCategory.length > 0) {
        categoryId = existingCategory[0].id;
      } else {
        // Criar nova categoria se não existir
        const newCategory = await db
          .insert(categories)
          .values({
            id: nanoid(),
            userId,
            name: category,
            type: type as "receita" | "despesa",
            color: "#6B7280",
            isActive: true,
          })
          .returning();

        categoryId = newCategory[0].id;
      }
    } else if (autoCategorize) {
      // Categorização automática
      try {
        categorizationResult =
          await categorizationService.categorizeTransaction(
            userId,
            description,
            type as "receita" | "despesa",
            amountNumber
          );

        if (categorizationResult.suggestedCategoryId) {
          categoryId = categorizationResult.suggestedCategoryId;
        }
      } catch (error) {
        console.error("Erro na categorização automática:", error);
        // Continua sem categoria se houver erro
      }
    }

    // Criar transação
    const newTransaction = await db
      .insert(transactions)
      .values({
        id: nanoid(),
        userId,
        description,
        amount: amountNumber.toString(),
        type: type as "receita" | "despesa",
        categoryId,
        transactionDate,
      })
      .returning();

    // Buscar categoria para resposta
    let categoryInfo = null;
    if (categoryId) {
      const categoryData = await db
        .select()
        .from(categories)
        .where(eq(categories.id, categoryId))
        .limit(1);

      if (categoryData.length > 0) {
        categoryInfo = {
          id: categoryData[0].id,
          name: categoryData[0].name,
          color: categoryData[0].color,
        };
      }
    }

    // Limpar contexto de transação pendente após registro bem-sucedido
    contextService.clearTransactionContext(userId);

    return NextResponse.json({
      success: true,
      data: {
        transaction: {
          ...newTransaction[0],
          category: categoryInfo,
        },
        categorization: categorizationResult,
        message: `✅ ${
          type === "receita" ? "Receita" : "Despesa"
        } registrada com sucesso!${
          categoryInfo
            ? `\n\n📂 **Categoria:** ${categoryInfo.name}`
            : categorizationResult?.suggestedCategoryName
            ? `\n\n🤖 **Categoria sugerida:** ${
                categorizationResult.suggestedCategoryName
              } (${Math.round(
                categorizationResult.confidence * 100
              )}% confiança)`
            : ""
        }\n\n📅 **Data:** ${dateParser.formatDate(transactionDate)}`,
      },
    });
  } catch (error) {
    console.error("Erro ao confirmar transação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
