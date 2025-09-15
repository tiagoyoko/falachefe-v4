import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { transactions, categories, user } from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { categorizationService } from "@/lib/categorization-service";

// GET /api/transactions - Listar transações
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type"); // receita ou despesa
    const categoryId = searchParams.get("categoryId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

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

    // Construir condições de filtro
    const conditions = [eq(transactions.userId, userId)];

    if (type) {
      conditions.push(eq(transactions.type, type as "receita" | "despesa"));
    }

    if (categoryId) {
      conditions.push(eq(transactions.categoryId, categoryId));
    }

    // Buscar transações com categoria
    const userTransactions = await db
      .select({
        id: transactions.id,
        description: transactions.description,
        amount: transactions.amount,
        type: transactions.type,
        transactionDate: transactions.transactionDate,
        createdAt: transactions.createdAt,
        category: {
          id: categories.id,
          name: categories.name,
          color: categories.color,
        },
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(desc(transactions.transactionDate))
      .limit(limit)
      .offset(offset);

    // Contar total de transações
    const totalCount = await db
      .select({ count: transactions.id })
      .from(transactions)
      .where(and(...conditions));

    return NextResponse.json({
      success: true,
      data: {
        transactions: userTransactions,
        pagination: {
          total: totalCount.length,
          limit,
          offset,
          hasMore: totalCount.length > offset + limit,
        },
      },
    });
  } catch (error) {
    console.error("Erro ao buscar transações:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST /api/transactions - Criar nova transação
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      description,
      amount,
      type,
      categoryId,
      transactionDate,
      spreadsheetId,
      autoCategorize = true, // Nova opção para categorização automática
    } = body;

    // Validações básicas
    if (!userId || !description || !amount || !type) {
      return NextResponse.json(
        { error: "User ID, descrição, valor e tipo são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se precisa solicitar informações faltantes
    const missingInfo = [];
    if (!categoryId && !autoCategorize) {
      missingInfo.push("categoria");
    }
    if (!transactionDate) {
      missingInfo.push("data");
    }

    // Se há informações faltantes E não é uma confirmação de transação, retornar solicitação
    if (missingInfo.length > 0 && !body.confirmTransaction) {
      return NextResponse.json(
        {
          success: false,
          requiresInfo: true,
          missingFields: missingInfo,
          message: `Para registrar esta transação, preciso das seguintes informações: ${missingInfo.join(
            ", "
          )}`,
          suggestions: {
            category: categoryId
              ? null
              : "Escolha uma categoria ou diga 'categorizar automaticamente'",
            date: transactionDate
              ? null
              : "Informe a data da transação (ex: 'hoje', 'ontem', '15/01/2025')",
          },
          data: {
            userId,
            description,
            amount,
            type,
            categoryId,
            transactionDate,
            spreadsheetId,
          },
        },
        { status: 422 }
      ); // 422 Unprocessable Entity
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

    let finalCategoryId = categoryId;
    let categorizationResult = null;

    // Categorização automática se solicitada e não houver categoria específica
    if (autoCategorize && !categoryId) {
      try {
        categorizationResult =
          await categorizationService.categorizeTransaction(
            userId,
            description,
            type as "receita" | "despesa",
            amountNumber
          );

        if (categorizationResult.suggestedCategoryId) {
          finalCategoryId = categorizationResult.suggestedCategoryId;
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
        categoryId: finalCategoryId || null,
        spreadsheetId: spreadsheetId || null,
        transactionDate: transactionDate
          ? new Date(transactionDate)
          : new Date(),
      })
      .returning();

    // TODO: Atualizar planilha Google Sheets se spreadsheetId for fornecido

    return NextResponse.json({
      success: true,
      data: {
        transaction: newTransaction[0],
        categorization: categorizationResult,
        message: `${
          type === "receita" ? "Receita" : "Despesa"
        } registrada com sucesso!${
          categorizationResult?.suggestedCategoryName
            ? ` Categoria sugerida: ${categorizationResult.suggestedCategoryName}`
            : ""
        }`,
      },
    });
  } catch (error) {
    console.error("Erro ao criar transação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT /api/transactions - Atualizar categoria de transação
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId, userId, categoryId } = body;

    if (!transactionId || !userId || !categoryId) {
      return NextResponse.json(
        { error: "Transaction ID, User ID e Category ID são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se transação pertence ao usuário
    const existingTransaction = await db
      .select()
      .from(transactions)
      .where(
        and(eq(transactions.id, transactionId), eq(transactions.userId, userId))
      )
      .limit(1);

    if (existingTransaction.length === 0) {
      return NextResponse.json(
        { error: "Transação não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se categoria pertence ao usuário
    const category = await db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.id, categoryId),
          eq(categories.userId, userId),
          eq(categories.isActive, true)
        )
      )
      .limit(1);

    if (category.length === 0) {
      return NextResponse.json(
        { error: "Categoria não encontrada ou não pertence ao usuário" },
        { status: 404 }
      );
    }

    // Atualizar categoria da transação
    const updatedTransaction = await db
      .update(transactions)
      .set({
        categoryId,
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, transactionId))
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        transaction: updatedTransaction[0],
        message: "Categoria da transação atualizada com sucesso!",
      },
    });
  } catch (error) {
    console.error("Erro ao atualizar categoria da transação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
