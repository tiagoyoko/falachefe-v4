import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { defaultCategories } from "@/lib/schema";
import { nanoid } from "nanoid";

// Categorias padrão para serem inseridas na primeira vez
const DEFAULT_CATEGORIES_DATA = [
  // Receitas
  {
    name: "Vendas de Produtos",
    type: "receita",
    segment: null,
    color: "#22c55e",
    icon: "ShoppingCart",
    isCommon: true,
    order: "1.00",
  },
  {
    name: "Vendas de Serviços",
    type: "receita",
    segment: null,
    color: "#3b82f6",
    icon: "Briefcase",
    isCommon: true,
    order: "2.00",
  },
  {
    name: "Comissões",
    type: "receita",
    segment: null,
    color: "#8b5cf6",
    icon: "TrendingUp",
    isCommon: true,
    order: "3.00",
  },
  {
    name: "Consultorias",
    type: "receita",
    segment: null,
    color: "#f59e0b",
    icon: "Users",
    isCommon: true,
    order: "4.00",
  },
  {
    name: "Outras Receitas",
    type: "receita",
    segment: null,
    color: "#06b6d4",
    icon: "CreditCard",
    isCommon: true,
    order: "5.00",
  },

  // Despesas
  {
    name: "Aluguel",
    type: "despesa",
    segment: null,
    color: "#ef4444",
    icon: "Home",
    isCommon: true,
    order: "1.00",
  },
  {
    name: "Fornecedores",
    type: "despesa",
    segment: null,
    color: "#f97316",
    icon: "Truck",
    isCommon: true,
    order: "2.00",
  },
  {
    name: "Marketing e Publicidade",
    type: "despesa",
    segment: null,
    color: "#ec4899",
    icon: "TrendingUp",
    isCommon: true,
    order: "3.00",
  },
  {
    name: "Funcionários",
    type: "despesa",
    segment: null,
    color: "#84cc16",
    icon: "Users",
    isCommon: true,
    order: "4.00",
  },
  {
    name: "Transporte",
    type: "despesa",
    segment: null,
    color: "#6366f1",
    icon: "Car",
    isCommon: true,
    order: "5.00",
  },
  {
    name: "Energia Elétrica",
    type: "despesa",
    segment: null,
    color: "#eab308",
    icon: "Zap",
    isCommon: true,
    order: "6.00",
  },
  {
    name: "Telefone/Internet",
    type: "despesa",
    segment: null,
    color: "#14b8a6",
    icon: "Phone",
    isCommon: true,
    order: "7.00",
  },
  {
    name: "Alimentação",
    type: "despesa",
    segment: null,
    color: "#a855f7",
    icon: "Coffee",
    isCommon: true,
    order: "8.00",
  },
  {
    name: "Manutenção",
    type: "despesa",
    segment: null,
    color: "#64748b",
    icon: "Home",
    isCommon: true,
    order: "9.00",
  },
  {
    name: "Impostos e Taxas",
    type: "despesa",
    segment: null,
    color: "#dc2626",
    icon: "CreditCard",
    isCommon: true,
    order: "10.00",
  },
];

export async function GET() {
  try {
    const user = await getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar categorias padrão
    const categories = await db
      .select()
      .from(defaultCategories)
      .orderBy(defaultCategories.type, defaultCategories.order);

    return NextResponse.json({
      categories,
    });
  } catch (error) {
    console.error("Erro ao buscar categorias padrão:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const user = await getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se já existem categorias padrão
    const existingCategories = await db
      .select()
      .from(defaultCategories)
      .limit(1);

    if (existingCategories.length > 0) {
      return NextResponse.json({
        message: "Categorias padrão já existem",
      });
    }

    // Inserir categorias padrão
    const categoriesToInsert = DEFAULT_CATEGORIES_DATA.map((cat) => ({
      id: nanoid(),
      ...cat,
    }));

    await db.insert(defaultCategories).values(categoriesToInsert);

    return NextResponse.json({
      success: true,
      message: "Categorias padrão criadas com sucesso",
      count: categoriesToInsert.length,
    });
  } catch (error) {
    console.error("Erro ao criar categorias padrão:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
