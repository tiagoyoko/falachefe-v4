#!/usr/bin/env node

require("dotenv").config({ path: ".env.local" });

console.log("🔧 CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE NO VERCEL");
console.log("==================================================\n");

console.log("❌ PROBLEMA IDENTIFICADO:");
console.log("   As variáveis de ambiente não estão configuradas no Vercel");
console.log(
  "   O código está usando valores de fallback (placeholder.supabase.co)"
);
console.log("   Resultado: fetch failed em produção\n");

console.log("✅ VARIÁVEIS CORRETAS PARA CONFIGURAR NO VERCEL:");
console.log("------------------------------------------------");

const envVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  POSTGRES_URL: process.env.POSTGRES_URL,
  POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
};

console.log("📋 COMANDOS PARA CONFIGURAR NO VERCEL:");
console.log("--------------------------------------");
console.log("1. Acesse: https://vercel.com/dashboard");
console.log("2. Selecione o projeto: falachefe-v4");
console.log("3. Vá para: Settings → Environment Variables");
console.log("4. Adicione as seguintes variáveis:\n");

Object.entries(envVars).forEach(([key, value]) => {
  if (value) {
    console.log(`${key}=${value}`);
  } else {
    console.log(`${key}=[VALOR_NÃO_CONFIGURADO]`);
  }
});

console.log("\n⚠️  IMPORTANTE:");
console.log("   - Marque todas como: Production, Preview, Development");
console.log("   - NEXT_PUBLIC_* são expostas para o cliente");
console.log("   - Após adicionar, faça um novo deploy");

console.log("\n🔍 VERIFICAÇÃO ATUAL:");
console.log("--------------------");
console.log("❌ Vercel usando: placeholder.supabase.co (fallback)");
console.log("✅ Deveria usar: zpdartuyaergbxmbmtur.supabase.co");
console.log("❌ Resultado: fetch failed em produção");
console.log("✅ Solução: Configurar variáveis no Vercel");

console.log("\n📊 STATUS:");
console.log("----------");
console.log("✅ Código corrigido");
console.log("✅ Deploy realizado");
console.log("❌ Variáveis não configuradas no Vercel");
console.log("🎯 PRÓXIMO PASSO: Configurar variáveis no Vercel Dashboard");
