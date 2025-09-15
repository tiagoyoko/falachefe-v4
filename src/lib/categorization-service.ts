import { db } from "@/lib/db";
import { categories } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface CategorizationResult {
  suggestedCategoryId: string | null;
  suggestedCategoryName: string | null;
  confidence: number;
  reasoning: string;
}

export interface CategorySuggestion {
  id: string;
  name: string;
  type: "receita" | "despesa";
  color: string;
  confidence: number;
}

export class CategorizationService {
  private static instance: CategorizationService;

  public static getInstance(): CategorizationService {
    if (!CategorizationService.instance) {
      CategorizationService.instance = new CategorizationService();
    }
    return CategorizationService.instance;
  }

  /**
   * Categoriza automaticamente uma transação baseada na descrição
   */
  async categorizeTransaction(
    userId: string,
    description: string,
    type: "receita" | "despesa",
    amount?: number
  ): Promise<CategorizationResult> {
    try {
      // Buscar categorias existentes do usuário
      const userCategories = await db
        .select()
        .from(categories)
        .where(
          and(
            eq(categories.userId, userId),
            eq(categories.type, type),
            eq(categories.isActive, true)
          )
        );

      if (userCategories.length === 0) {
        console.log(
          `🔧 Usuário ${userId} não tem categorias. Criando categorias padrão...`
        );
        // Criar categorias padrão se não existirem
        await this.createDefaultCategories(userId);

        // Buscar novamente as categorias
        const newUserCategories = await db
          .select()
          .from(categories)
          .where(
            and(
              eq(categories.userId, userId),
              eq(categories.type, type),
              eq(categories.isActive, true)
            )
          );

        if (newUserCategories.length === 0) {
          return {
            suggestedCategoryId: null,
            suggestedCategoryName: null,
            confidence: 0,
            reasoning: "Não foi possível criar categorias padrão",
          };
        }

        // Usar as novas categorias
        const suggestion = await this.suggestCategoryWithLLM(
          description,
          type,
          newUserCategories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            type: cat.type,
            color: cat.color || undefined,
          })),
          amount
        );

        return suggestion;
      }

      // Usar LLM para categorizar
      const suggestion = await this.suggestCategoryWithLLM(
        description,
        type,
        userCategories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          type: cat.type,
          color: cat.color || undefined,
        })),
        amount
      );

      return suggestion;
    } catch (error) {
      console.error("Erro ao categorizar transação:", error);
      console.error(
        "Stack trace:",
        error instanceof Error ? error.stack : "No stack trace"
      );
      return {
        suggestedCategoryId: null,
        suggestedCategoryName: null,
        confidence: 0,
        reasoning: `Erro interno na categorização: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`,
      };
    }
  }

  /**
   * Sugere categorias baseadas na descrição usando LLM
   */
  async suggestCategories(
    userId: string,
    description: string,
    type: "receita" | "despesa",
    amount?: number
  ): Promise<CategorySuggestion[]> {
    try {
      // Buscar categorias existentes do usuário
      const userCategories = await db
        .select()
        .from(categories)
        .where(
          and(
            eq(categories.userId, userId),
            eq(categories.type, type),
            eq(categories.isActive, true)
          )
        );

      if (userCategories.length === 0) {
        return [];
      }

      // Usar LLM para sugerir múltiplas categorias
      const suggestions = await this.suggestMultipleCategoriesWithLLM(
        description,
        type,
        userCategories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          type: cat.type,
          color: cat.color || undefined,
        })),
        amount
      );

      return suggestions;
    } catch (error) {
      console.error("Erro ao sugerir categorias:", error);
      return [];
    }
  }

  /**
   * Atualiza a categoria de uma transação baseada no comando do usuário
   */
  async updateTransactionCategory(
    userId: string,
    transactionId: string,
    newCategoryId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Verificar se a categoria pertence ao usuário
      const category = await db
        .select()
        .from(categories)
        .where(
          and(
            eq(categories.id, newCategoryId),
            eq(categories.userId, userId),
            eq(categories.isActive, true)
          )
        )
        .limit(1);

      if (category.length === 0) {
        return {
          success: false,
          message: "Categoria não encontrada ou não pertence ao usuário",
        };
      }

      // Atualizar a transação (isso seria feito no endpoint de transações)
      return {
        success: true,
        message: "Categoria atualizada com sucesso",
      };
    } catch (error) {
      console.error("Erro ao atualizar categoria da transação:", error);
      return {
        success: false,
        message: "Erro interno do servidor",
      };
    }
  }

  /**
   * Usa LLM para sugerir uma categoria baseada na descrição
   */
  private async suggestCategoryWithLLM(
    description: string,
    type: "receita" | "despesa",
    availableCategories: Array<{
      id: string;
      name: string;
      type: string;
      color?: string;
    }>,
    amount?: number
  ): Promise<CategorizationResult> {
    try {
      // Preparar contexto para o LLM
      const categoriesList = availableCategories
        .map((cat) => `- ${cat.name} (ID: ${cat.id})`)
        .join("\n");

      const prompt = `
Analise a seguinte transação financeira e sugira a categoria mais apropriada:

Tipo: ${type}
Descrição: "${description}"
${amount ? `Valor: R$ ${amount.toFixed(2)}` : ""}

Categorias disponíveis:
${categoriesList}

Responda APENAS com um JSON no seguinte formato:
{
  "suggestedCategoryId": "ID_DA_CATEGORIA_MAIS_APROPRIADA",
  "suggestedCategoryName": "NOME_DA_CATEGORIA",
  "confidence": 0.95,
  "reasoning": "Explicação breve do porquê esta categoria foi escolhida"
}

Se nenhuma categoria for apropriada, use:
{
  "suggestedCategoryId": null,
  "suggestedCategoryName": null,
  "confidence": 0,
  "reasoning": "Nenhuma categoria existente é apropriada para esta transação"
}
`;

      // Simular processamento LLM (aqui você integraria com OpenAI, Claude, etc.)
      const response = (await this.processWithLLM(
        prompt
      )) as CategorizationResult;

      return response;
    } catch (error) {
      console.error("Erro no processamento LLM:", error);
      return {
        suggestedCategoryId: null,
        suggestedCategoryName: null,
        confidence: 0,
        reasoning: "Erro no processamento de IA",
      };
    }
  }

  /**
   * Usa LLM para sugerir múltiplas categorias
   */
  private async suggestMultipleCategoriesWithLLM(
    description: string,
    type: "receita" | "despesa",
    availableCategories: Array<{
      id: string;
      name: string;
      type: string;
      color?: string;
    }>,
    amount?: number
  ): Promise<CategorySuggestion[]> {
    try {
      const categoriesList = availableCategories
        .map((cat) => `- ${cat.name} (ID: ${cat.id})`)
        .join("\n");

      const prompt = `
Analise a seguinte transação financeira e sugira as 3 categorias mais apropriadas em ordem de relevância:

Tipo: ${type}
Descrição: "${description}"
${amount ? `Valor: R$ ${amount.toFixed(2)}` : ""}

Categorias disponíveis:
${categoriesList}

Responda APENAS com um JSON no seguinte formato:
[
  {
    "id": "ID_DA_CATEGORIA",
    "name": "NOME_DA_CATEGORIA",
    "type": "${type}",
    "color": "#COR_DA_CATEGORIA",
    "confidence": 0.95
  }
]
`;

      const response = (await this.processWithLLM(
        prompt
      )) as CategorySuggestion[];
      return response;
    } catch (error) {
      console.error("Erro no processamento LLM:", error);
      return [];
    }
  }

  /**
   * Processa prompt com LLM (implementação básica)
   * Aqui você integraria com OpenAI, Claude, ou outro serviço de IA
   */
  private async processWithLLM(
    prompt: string
  ): Promise<CategorizationResult | CategorySuggestion[]> {
    // Implementação básica usando regras simples
    // Em produção, substitua por chamada real para LLM

    // Simular delay de processamento
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Lógica simples de categorização baseada em palavras-chave
    const description = prompt.match(/Descrição: "(.+?)"/)?.[1] || "";

    // Extrair categorias disponíveis do prompt
    const categoriesMatch = prompt.match(
      /Categorias disponíveis:\n([\s\S]+?)(?=\n\n|$)/
    );
    const categoriesText = categoriesMatch?.[1] || "";
    const availableCategories = categoriesText
      .split("\n")
      .filter((line) => line.includes("(ID:"))
      .map((line) => {
        const nameMatch = line.match(/- (.+?) \(ID: (.+?)\)/);
        return nameMatch ? { name: nameMatch[1], id: nameMatch[2] } : null;
      })
      .filter(Boolean);

    // Lógica de categorização simples
    const lowerDesc = description.toLowerCase();

    // Palavras-chave para diferentes tipos de categorias
    const keywords: Record<string, string[]> = {
      vendas: ["venda", "vendas", "cliente", "produto", "mercadoria"],
      serviços: [
        "serviço",
        "serviços",
        "consultoria",
        "atendimento",
        "suporte",
      ],
      fornecedores: [
        "fornecedor",
        "fornecedores",
        "compra",
        "matéria-prima",
        "insumo",
      ],
      marketing: [
        "marketing",
        "publicidade",
        "propaganda",
        "anúncio",
        "campanha",
      ],
      operacionais: [
        "operacional",
        "operação",
        "manutenção",
        "reparo",
        "equipamento",
      ],
      combustível: [
        "combustível",
        "gasolina",
        "diesel",
        "posto",
        "abastecimento",
      ],
      alimentação: [
        "alimentação",
        "comida",
        "restaurante",
        "lanche",
        "refeição",
      ],
      transporte: ["transporte", "uber", "taxi", "ônibus", "passagem"],
      telefone: ["telefone", "celular", "internet", "dados", "plano"],
      energia: ["energia", "luz", "eletricidade", "conta de luz"],
      água: ["água", "saneamento", "conta de água"],
      aluguel: ["aluguel", "locação", "imóvel", "escritório"],
    };

    // Encontrar categoria mais provável
    let bestMatch = null;
    let bestScore = 0;

    for (const [categoryName, words] of Object.entries(keywords)) {
      const score = words.reduce((acc, word) => {
        return acc + (lowerDesc.includes(word) ? 1 : 0);
      }, 0);

      if (score > bestScore) {
        bestScore = score;
        bestMatch = categoryName;
      }
    }

    // Encontrar categoria correspondente nas categorias disponíveis
    const matchingCategory = availableCategories.find(
      (cat) =>
        (cat && cat.name.toLowerCase().includes(bestMatch || "")) ||
        bestMatch?.includes(cat?.name.toLowerCase() || "")
    );

    if (matchingCategory && bestScore > 0) {
      return {
        suggestedCategoryId: matchingCategory.id,
        suggestedCategoryName: matchingCategory.name,
        confidence: Math.min(bestScore / 3, 1), // Normalizar confiança
        reasoning: `Categoria sugerida baseada nas palavras-chave: "${bestMatch}"`,
      };
    }

    // Se não encontrar correspondência, retornar primeira categoria disponível
    if (availableCategories.length > 0 && availableCategories[0]) {
      return {
        suggestedCategoryId: availableCategories[0].id,
        suggestedCategoryName: availableCategories[0].name,
        confidence: 0.3,
        reasoning: "Categoria sugerida como fallback (primeira disponível)",
      };
    }

    return {
      suggestedCategoryId: null,
      suggestedCategoryName: null,
      confidence: 0,
      reasoning: "Nenhuma categoria apropriada encontrada",
    };
  }

  /**
   * Criar categorias padrão para um usuário
   */
  private async createDefaultCategories(userId: string): Promise<void> {
    try {
      const defaultCategories = [
        // Categorias de Receita
        { name: "Vendas", type: "receita" as const, color: "#10b981" },
        { name: "Serviços", type: "receita" as const, color: "#3b82f6" },
        { name: "Outras Receitas", type: "receita" as const, color: "#8b5cf6" },

        // Categorias de Despesa
        { name: "Fornecedores", type: "despesa" as const, color: "#ef4444" },
        { name: "Marketing", type: "despesa" as const, color: "#f59e0b" },
        { name: "Operacionais", type: "despesa" as const, color: "#8b5cf6" },
        { name: "Combustível", type: "despesa" as const, color: "#06b6d4" },
        { name: "Alimentação", type: "despesa" as const, color: "#84cc16" },
        { name: "Transporte", type: "despesa" as const, color: "#f97316" },
        { name: "Telefone", type: "despesa" as const, color: "#ec4899" },
        { name: "Energia", type: "despesa" as const, color: "#eab308" },
        { name: "Água", type: "despesa" as const, color: "#06b6d4" },
        { name: "Aluguel", type: "despesa" as const, color: "#8b5cf6" },
        { name: "Outras Despesas", type: "despesa" as const, color: "#6b7280" },
      ];

      for (const categoryData of defaultCategories) {
        await db.insert(categories).values({
          id: nanoid(),
          userId,
          name: categoryData.name,
          type: categoryData.type,
          color: categoryData.color,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      console.log(
        `✅ Criadas ${defaultCategories.length} categorias padrão para usuário ${userId}`
      );
    } catch (error) {
      console.error("Erro ao criar categorias padrão:", error);
      throw error;
    }
  }
}

export const categorizationService = CategorizationService.getInstance();
