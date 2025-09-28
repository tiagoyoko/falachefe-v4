// Script para debugar o problema do onboarding
const { createClient } = require("@supabase/supabase-js");

async function debugOnboarding() {
  console.log("🔍 Debugando problema do onboarding...");

  // Verificar variáveis de ambiente
  console.log("\n📋 Variáveis de ambiente:");
  console.log(
    "SUPABASE_URL:",
    process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Definida" : "❌ Não definida"
  );
  console.log(
    "SUPABASE_ANON_KEY:",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? "✅ Definida"
      : "❌ Não definida"
  );

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    console.log("❌ Variáveis do Supabase não configuradas");
    return;
  }

  // Criar cliente Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    // Verificar se há sessão ativa
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.log("❌ Erro ao obter sessão:", sessionError.message);
      return;
    }

    if (!session) {
      console.log("❌ Nenhuma sessão ativa encontrada");
      console.log("💡 O usuário precisa estar logado para testar o onboarding");
      return;
    }

    console.log("✅ Sessão ativa encontrada");
    console.log("👤 Usuário:", session.user.email);
    console.log("🆔 User ID:", session.user.id);

    // Verificar se o usuário existe na tabela user
    const { data: userData, error: userError } = await supabase
      .from("user")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (userError) {
      console.log("❌ Erro ao buscar usuário na tabela:", userError.message);
    } else if (!userData) {
      console.log("❌ Usuário não encontrado na tabela user");
      console.log(
        "💡 Problema: usuário não foi sincronizado do Auth para nossa tabela"
      );
    } else {
      console.log("✅ Usuário encontrado na tabela user");
      console.log("📊 Dados do usuário:", {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        isActive: userData.isActive,
      });
    }

    // Verificar se já existe onboarding para este usuário
    const { data: onboardingData, error: onboardingError } = await supabase
      .from("onboardingPreferences")
      .select("*")
      .eq("userId", session.user.id)
      .single();

    if (onboardingError && onboardingError.code !== "PGRST116") {
      console.log("❌ Erro ao buscar onboarding:", onboardingError.message);
    } else if (!onboardingData) {
      console.log("ℹ️ Nenhum onboarding encontrado (normal para usuário novo)");
    } else {
      console.log("ℹ️ Onboarding existente encontrado:");
      console.log(
        "📊 Status:",
        onboardingData.onboardingCompleted ? "Concluído" : "Em andamento"
      );
      console.log("📍 Etapa atual:", onboardingData.currentStep);
    }
  } catch (error) {
    console.error("❌ Erro geral:", error.message);
  }
}

// Carregar variáveis de ambiente do .env.local
require("dotenv").config({ path: ".env.local" });

debugOnboarding();
