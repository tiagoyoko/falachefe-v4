// Script para testar a API de onboarding
const fetch = require("node-fetch");

async function testOnboardingAPI() {
  const testData = {
    selectedFeatures: ["marketing", "vendas", "financeiro"],
    companyInfo: {
      name: "Empresa Teste",
      segment: "varejo",
      businessSize: "pequeno",
      monthlyRevenue: "10k-50k",
      employeeCount: "1-10",
      description: "Empresa de teste para onboarding",
      city: "São Paulo",
      state: "SP",
      phone: "11999999999",
    },
    whatsappNumber: "11999999999",
    categoriesData: {
      selectedCategories: ["vendas-produtos", "aluguel", "marketing"],
      customCategories: [],
    },
  };

  try {
    console.log("🧪 Testando API de onboarding...");
    console.log("📤 Dados enviados:", JSON.stringify(testData, null, 2));

    const response = await fetch("http://localhost:3000/api/onboarding", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    console.log("📊 Status da resposta:", response.status);
    console.log("📋 Headers:", Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log("📥 Resposta:", responseText);

    if (!response.ok) {
      console.error("❌ Erro na API:", response.status, responseText);
    } else {
      console.log("✅ API funcionando corretamente!");
    }
  } catch (error) {
    console.error("❌ Erro na requisição:", error.message);
  }
}

// Aguardar um pouco para o servidor inicializar
setTimeout(testOnboardingAPI, 5000);
