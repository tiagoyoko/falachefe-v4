import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories, transactions } from "@/lib/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { nanoid } from "nanoid";

// GET /api/categories - Listar categorias do usuário
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type"); // receita ou despesa

    if (!userId) {
      return NextResponse.json(
        { error: "User ID é obrigatório" },
        { status: 400 }
      );
    }

    // Construir condições de filtro
    const conditions = [
      eq(categories.userId, userId),
      eq(categories.isActive, true),
    ];

    if (type) {
      conditions.push(eq(categories.type, type as "receita" | "despesa"));
    }

    // Buscar categorias com contagem de transações
    const userCategories = await db
      .select({
        id: categories.id,
        name: categories.name,
        type: categories.type,
        color: categories.color,
        createdAt: categories.createdAt,
        transactionCount: count(transactions.id),
      })
      .from(categories)
      .leftJoin(transactions, eq(categories.id, transactions.categoryId))
      .where(and(...conditions))
      .groupBy(categories.id)
      .orderBy(desc(categories.createdAt));

    return NextResponse.json({
      success: true,
      data: {
        categories: userCategories,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST /api/categories - Criar nova categoria
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, type, color } = body;

    // Validações
    if (!userId || !name || !type) {
      return NextResponse.json(
        { error: "User ID, nome e tipo são obrigatórios" },
        { status: 400 }
      );
    }

    if (type !== "receita" && type !== "despesa") {
      return NextResponse.json(
        { error: "Tipo deve ser 'receita' ou 'despesa'" },
        { status: 400 }
      );
    }

    // Verificar se categoria já existe
    const existingCategory = await db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.userId, userId),
          eq(categories.name, name),
          eq(categories.type, type as "receita" | "despesa")
        )
      )
      .limit(1);

    if (existingCategory.length > 0) {
      return NextResponse.json(
        { error: "Categoria já existe" },
        { status: 409 }
      );
    }

    // Criar categoria
    const newCategory = await db
      .insert(categories)
      .values({
        id: nanoid(),
        userId,
        name,
        type: type as "receita" | "despesa",
        color: color || "#6B7280",
        isActive: true,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        category: newCategory[0],
        message: "Categoria criada com sucesso!",
      },
    });
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT /api/categories - Atualizar categoria
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { categoryId, userId, name, color } = body;

    if (!categoryId || !userId) {
      return NextResponse.json(
        { error: "Category ID e User ID são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se categoria pertence ao usuário
    const existingCategory = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
      .limit(1);

    if (existingCategory.length === 0) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    // Atualizar categoria
    const updateData: { name?: string; color?: string; updatedAt: Date } = {
      updatedAt: new Date(),
    };
    if (name) updateData.name = name;
    if (color) updateData.color = color;

    const updatedCategory = await db
      .update(categories)
      .set(updateData)
      .where(eq(categories.id, categoryId))
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        category: updatedCategory[0],
        message: "Categoria atualizada com sucesso!",
      },
    });
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE /api/categories - Deletar categoria
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const userId = searchParams.get("userId");

    if (!categoryId || !userId) {
      return NextResponse.json(
        { error: "Category ID e User ID são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se categoria pertence ao usuário
    const existingCategory = await db
      .select()
      .from(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
      .limit(1);

    if (existingCategory.length === 0) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se há transações usando esta categoria
    const transactionsUsingCategory = await db
      .select({ count: transactions.id })
      .from(transactions)
      .where(eq(transactions.categoryId, categoryId))
      .limit(1);

    if (transactionsUsingCategory.length > 0) {
      // Soft delete - apenas desativar
      await db
        .update(categories)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(categories.id, categoryId));

      return NextResponse.json({
        success: true,
        message: "Categoria desativada (há transações vinculadas)",
      });
    } else {
      // Hard delete - remover completamente
      await db.delete(categories).where(eq(categories.id, categoryId));

      return NextResponse.json({
        success: true,
        message: "Categoria removida com sucesso!",
      });
    }
  } catch (error) {
    console.error("Erro ao deletar categoria:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
