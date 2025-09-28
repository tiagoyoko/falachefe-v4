import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth-server";
import { db } from "@/lib/db";
import {
  companies,
  onboardingPreferences,
  categories,
  userSettings,
} from "@/lib/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { syncUserFromAuth } from "@/lib/user-sync";

// Função para normalizar número de telefone
function normalizePhoneNumber(phone: string): string {
  if (!phone) return "";

  // Remove todos os caracteres não numéricos
  const numbers = phone.replace(/\D/g, "");

  // Se começar com 55 (código do Brasil), remove
  if (numbers.startsWith("55") && numbers.length === 13) {
    return numbers.slice(2);
  }

  // Se começar com 0, remove
  if (numbers.startsWith("0")) {
    return numbers.slice(1);
  }

  return numbers;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // 🔄 SINCRONIZAR USUÁRIO: Garantir que o usuário existe na nossa tabela
    try {
      await syncUserFromAuth(user);
      console.log("✅ Usuário sincronizado com sucesso:", user.email);
    } catch (syncError) {
      console.error("❌ Erro ao sincronizar usuário:", syncError);
      // Continuar mesmo com erro de sincronização
    }

    const body = await request.json();
    const { selectedFeatures, companyInfo, whatsappNumber, categoriesData } =
      body;

    // Validar dados obrigatórios
    if (!companyInfo || !selectedFeatures || !categoriesData) {
      console.error("❌ Dados obrigatórios faltando:", {
        companyInfo: !!companyInfo,
        selectedFeatures: !!selectedFeatures,
        categoriesData: !!categoriesData,
      });
      return NextResponse.json(
        { error: "Dados obrigatórios faltando" },
        { status: 400 }
      );
    }

    const userId = user.id;

    // Normalizar número de telefone
    const normalizedPhone = normalizePhoneNumber(
      whatsappNumber || companyInfo.phone
    );

    console.log("🔄 Iniciando salvamento do onboarding para usuário:", userId);

    // Iniciar transação
    await db.transaction(async (tx) => {
      // 1. Verificar se já existe empresa para este usuário
      const existingCompany = await tx
        .select()
        .from(companies)
        .where(eq(companies.userId, userId))
        .limit(1);

      if (existingCompany.length > 0) {
        // Atualizar empresa existente
        await tx
          .update(companies)
          .set({
            name: companyInfo.name,
            segment: companyInfo.segment,
            businessSize: companyInfo.businessSize,
            monthlyRevenue: companyInfo.monthlyRevenue,
            employeeCount: companyInfo.employeeCount,
            description: companyInfo.description,
            city: companyInfo.city,
            state: companyInfo.state,
            phone: companyInfo.phone,
            cnpj: companyInfo.cnpj || null,
            website: companyInfo.website || null,
            updatedAt: new Date(),
          })
          .where(eq(companies.userId, userId));
        console.log("✅ Empresa atualizada");
      } else {
        // Inserir nova empresa
        await tx.insert(companies).values({
          id: nanoid(),
          userId,
          name: companyInfo.name,
          segment: companyInfo.segment,
          businessSize: companyInfo.businessSize,
          monthlyRevenue: companyInfo.monthlyRevenue,
          employeeCount: companyInfo.employeeCount,
          description: companyInfo.description,
          city: companyInfo.city,
          state: companyInfo.state,
          phone: companyInfo.phone,
          cnpj: companyInfo.cnpj || null,
          website: companyInfo.website || null,
        });
        console.log("✅ Nova empresa criada");
      }

      // 2. Verificar se já existem preferências de onboarding
      const existingOnboarding = await tx
        .select()
        .from(onboardingPreferences)
        .where(eq(onboardingPreferences.userId, userId))
        .limit(1);

      if (existingOnboarding.length > 0) {
        // Atualizar preferências existentes
        await tx
          .update(onboardingPreferences)
          .set({
            mainGoals: selectedFeatures,
            onboardingCompleted: true,
            currentStep: "completed",
            completedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(onboardingPreferences.userId, userId));
        console.log("✅ Preferências de onboarding atualizadas");
      } else {
        // Inserir novas preferências
        await tx.insert(onboardingPreferences).values({
          id: nanoid(),
          userId,
          mainGoals: selectedFeatures,
          onboardingCompleted: true,
          currentStep: "completed",
          completedAt: new Date(),
        });
        console.log("✅ Novas preferências de onboarding criadas");
      }

      // 3. Verificar se já existem configurações do usuário
      const existingUserSettings = await tx
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, userId))
        .limit(1);

      if (existingUserSettings.length > 0) {
        // Atualizar configurações existentes
        await tx
          .update(userSettings)
          .set({
            whatsappNumber: normalizedPhone || null,
            preferences: {
              selectedFeatures,
              onboardingCompleted: true,
            },
            updatedAt: new Date(),
          })
          .where(eq(userSettings.userId, userId));
        console.log("✅ Configurações do usuário atualizadas");
      } else {
        // Inserir novas configurações
        await tx.insert(userSettings).values({
          id: nanoid(),
          userId,
          currency: "BRL",
          timezone: "America/Sao_Paulo",
          whatsappNumber: normalizedPhone || null,
          preferences: {
            selectedFeatures,
            onboardingCompleted: true,
          },
        });
        console.log("✅ Novas configurações do usuário criadas");
      }

      // 4. Criar categorias selecionadas
      const categoriesToCreate = [];

      // Definir categorias padrão (as mesmas do frontend)
      const defaultCategoriesMap: Record<
        string,
        { name: string; type: string; color: string }
      > = {
        "vendas-produtos": {
          name: "Vendas de Produtos",
          type: "receita",
          color: "#22c55e",
        },
        "vendas-servicos": {
          name: "Vendas de Serviços",
          type: "receita",
          color: "#3b82f6",
        },
        comissoes: { name: "Comissões", type: "receita", color: "#8b5cf6" },
        consultorias: {
          name: "Consultorias",
          type: "receita",
          color: "#f59e0b",
        },
        "outras-receitas": {
          name: "Outras Receitas",
          type: "receita",
          color: "#06b6d4",
        },
        aluguel: { name: "Aluguel", type: "despesa", color: "#ef4444" },
        fornecedores: {
          name: "Fornecedores",
          type: "despesa",
          color: "#f97316",
        },
        marketing: {
          name: "Marketing e Publicidade",
          type: "despesa",
          color: "#ec4899",
        },
        funcionarios: {
          name: "Funcionários",
          type: "despesa",
          color: "#84cc16",
        },
        transporte: { name: "Transporte", type: "despesa", color: "#6366f1" },
        energia: {
          name: "Energia Elétrica",
          type: "despesa",
          color: "#eab308",
        },
        telefone: {
          name: "Telefone/Internet",
          type: "despesa",
          color: "#14b8a6",
        },
        alimentacao: { name: "Alimentação", type: "despesa", color: "#a855f7" },
        manutencao: { name: "Manutenção", type: "despesa", color: "#64748b" },
        impostos: {
          name: "Impostos e Taxas",
          type: "despesa",
          color: "#dc2626",
        },
      };

      // Para cada categoria padrão selecionada
      for (const categoryId of categoriesData.selectedCategories) {
        const defaultCat = defaultCategoriesMap[categoryId];
        if (defaultCat) {
          categoriesToCreate.push({
            id: nanoid(),
            userId,
            name: defaultCat.name,
            type: defaultCat.type,
            color: defaultCat.color,
          });
        }
      }

      // Adicionar categorias customizadas
      for (const customCat of categoriesData.customCategories) {
        categoriesToCreate.push({
          id: nanoid(),
          userId,
          name: customCat.name,
          type: customCat.type,
          color: customCat.color,
        });
      }

      // Inserir todas as categorias de uma vez
      if (categoriesToCreate.length > 0) {
        await tx.insert(categories).values(categoriesToCreate);
        console.log(`✅ ${categoriesToCreate.length} categorias criadas`);
      }
    });

    console.log("🎉 Onboarding concluído com sucesso para usuário:", userId);

    return NextResponse.json({
      success: true,
      message: "Onboarding concluído com sucesso",
    });
  } catch (error) {
    console.error("❌ Erro no onboarding:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = user.id;

    // Buscar status do onboarding
    const [onboardingStatus] = await db
      .select()
      .from(onboardingPreferences)
      .where(eq(onboardingPreferences.userId, userId));

    return NextResponse.json({
      onboardingCompleted: onboardingStatus?.onboardingCompleted || false,
      currentStep: onboardingStatus?.currentStep || "welcome",
    });
  } catch (error) {
    console.error("Erro ao buscar status do onboarding:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
