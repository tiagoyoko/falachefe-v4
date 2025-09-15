import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { spreadsheets, categories, transactions, user } from "@/lib/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { nanoid } from "nanoid";

// GET /api/cashflow - Obter resumo do fluxo de caixa
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

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

    // Calcular período
    const now = new Date();
    const startDate =
      month && year
        ? new Date(parseInt(year), parseInt(month) - 1, 1)
        : new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate =
      month && year
        ? new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)
        : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Buscar transações do período
    const userTransactions = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.transactionDate, startDate),
          lte(transactions.transactionDate, endDate)
        )
      )
      .orderBy(desc(transactions.transactionDate));

    // Calcular totais
    const receitas = userTransactions
      .filter((t) => t.type === "receita")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const despesas = userTransactions
      .filter((t) => t.type === "despesa")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const saldo = receitas - despesas;

    // Buscar planilhas ativas
    const userSpreadsheets = await db
      .select()
      .from(spreadsheets)
      .where(
        and(eq(spreadsheets.userId, userId), eq(spreadsheets.isActive, true))
      );

    return NextResponse.json({
      success: true,
      data: {
        periodo: {
          inicio: startDate.toISOString(),
          fim: endDate.toISOString(),
        },
        resumo: {
          receitas,
          despesas,
          saldo,
          totalTransacoes: userTransactions.length,
        },
        transacoes: userTransactions.slice(0, 10), // Últimas 10
        planilhas: userSpreadsheets,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar fluxo de caixa:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST /api/cashflow - Criar nova planilha de fluxo de caixa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name } = body;

    if (!userId || !name) {
      return NextResponse.json(
        { error: "User ID e nome são obrigatórios" },
        { status: 400 }
      );
    }

    // TODO: Integrar com Google Sheets API para criar planilha real
    // Por enquanto, vamos simular a criação
    const spreadsheetId = nanoid();
    const googleSheetId = `sheet_${spreadsheetId}`;
    const googleSheetUrl = `https://docs.google.com/spreadsheets/d/${googleSheetId}`;

    const newSpreadsheet = await db
      .insert(spreadsheets)
      .values({
        id: spreadsheetId,
        userId,
        name,
        googleSheetId,
        googleSheetUrl,
        isActive: true,
      })
      .returning();

    // Criar categorias padrão para o usuário
    const defaultCategories = [
      { name: "Vendas", type: "receita", color: "#10B981" },
      { name: "Serviços", type: "receita", color: "#3B82F6" },
      { name: "Fornecedores", type: "despesa", color: "#EF4444" },
      { name: "Marketing", type: "despesa", color: "#F59E0B" },
      { name: "Operacionais", type: "despesa", color: "#6B7280" },
    ];

    const categoryInserts = defaultCategories.map((cat) => ({
      id: nanoid(),
      userId,
      name: cat.name,
      type: cat.type as "receita" | "despesa",
      color: cat.color,
      isActive: true,
    }));

    await db.insert(categories).values(categoryInserts);

    return NextResponse.json({
      success: true,
      data: {
        spreadsheet: newSpreadsheet[0],
        message: "Planilha de fluxo de caixa criada com sucesso!",
      },
    });
  } catch (error) {
    console.error("Erro ao criar planilha:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
