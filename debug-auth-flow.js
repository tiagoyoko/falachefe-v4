#!/usr/bin/env node

/**
 * Script para debugar o fluxo de autenticação e identificar
 * quando e onde a chamada para /api/agent está sendo feita
 */

require('dotenv').config({ path: '.env.local' });

async function debugAuthFlow() {
  console.log('🔍 Debugando fluxo de autenticação...\n');

  // 1. Verificar se usuário existe no banco
  console.log('1️⃣ Verificando usuário tiago@agenciavibecode.com no banco...');
  
  try {
    const postgres = require('postgres');
    const sql = postgres(process.env.POSTGRES_URL);
    
    const result = await sql`
      SELECT id, email, name, "createdAt", "updatedAt" 
      FROM "user" 
      WHERE email = 'tiago@agenciavibecode.com'
      LIMIT 1
    `;
    
    if (result.length === 0) {
      console.log('❌ Usuário não encontrado no banco!');
      console.log('💡 Isso explica o erro 404 na API');
      
      console.log('\n🔧 Soluções:');
      console.log('1. O usuário precisa fazer signup primeiro');
      console.log('2. Ou precisa ser sincronizado do Supabase Auth');
      
      await sql.end();
      return;
    }
    
    const userInDb = result[0];
    console.log('✅ Usuário encontrado no banco:');
    console.log(`   ID: ${userInDb.id}`);
    console.log(`   Email: ${userInDb.email}`);
    console.log(`   Nome: ${userInDb.name}`);
    console.log(`   Criado: ${userInDb.createdAt}`);
    
    await sql.end();
    
    // 2. Testar API com usuário válido
    console.log('\n2️⃣ Testando API com usuário válido...');
    
    const response = await fetch('https://falachefe-v4.vercel.app/api/agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userInDb.id,
        command: 'teste'
      })
    });
    
    console.log(`Status: ${response.status}`);
    const data = await response.text();
    console.log(`Resposta: ${data.substring(0, 200)}...`);
    
    if (response.status === 404) {
      console.log('\n❌ Ainda retorna 404!');
      console.log('🔍 Possíveis causas:');
      console.log('1. Usuário não existe no banco (mas acabamos de verificar que existe)');
      console.log('2. Problema na query do banco na API');
      console.log('3. Cache ou sincronização entre bancos');
    } else {
      console.log('\n✅ API funcionando!');
    }
    
    // 3. Investigar sincronização
    console.log('\n3️⃣ Verificando sincronização de usuários...');
    
    const syncResponse = await fetch('https://falachefe-v4.vercel.app/api/user-sync');
    if (syncResponse.ok) {
      const syncData = await syncResponse.json();
      console.log('Estatísticas de sincronização:', JSON.stringify(syncData, null, 2));
    } else {
      console.log('❌ Erro ao verificar sincronização:', syncResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Erro no debug:', error.message);
  }
}

// 4. Identificar componentes que fazem chamadas automáticas
function analyzeAutomaticCalls() {
  console.log('\n4️⃣ Componentes que podem fazer chamadas automáticas:');
  console.log('');
  console.log('📍 Possíveis fontes da chamada para /api/agent:');
  console.log('');
  
  const possibleSources = [
    {
      component: 'useOnboarding hook',
      file: 'src/hooks/use-onboarding.ts',
      trigger: 'Chamado quando user.id existe',
      apiCall: '/api/onboarding (que pode chamar outras APIs)'
    },
    {
      component: 'OnboardingGuard',
      file: 'src/components/auth/onboarding-guard.tsx',
      trigger: 'Executa em páginas protegidas',
      apiCall: 'Indiretamente via useOnboarding'
    },
    {
      component: 'Sincronização automática',
      file: 'src/app/api/onboarding/route.ts linha 44',
      trigger: 'Executa syncUserFromAuth automaticamente',
      apiCall: 'Pode ter efeitos colaterais'
    },
    {
      component: 'Middleware de Auth',
      file: 'src/middleware.ts',
      trigger: 'Em cada request',
      apiCall: 'Pode estar interferindo no callback'
    },
    {
      component: 'useLLMAgent automático',
      file: 'src/hooks/use-llm-agent.ts',
      trigger: 'Se chamado automaticamente em algum component',
      apiCall: '/api/agent diretamente'
    }
  ];
  
  possibleSources.forEach((source, index) => {
    console.log(`${index + 1}. ${source.component}`);
    console.log(`   📄 Arquivo: ${source.file}`);
    console.log(`   🎯 Trigger: ${source.trigger}`);
    console.log(`   📡 API: ${source.apiCall}`);
    console.log('');
  });
  
  console.log('🔧 Estratégias de debug:');
  console.log('1. Verificar se o usuário existe no banco de produção');
  console.log('2. Verificar logs do Vercel durante o callback OAuth');
  console.log('3. Temporariamente adicionar console.logs nos hooks suspeitos');
  console.log('4. Verificar se há redirecionamentos ou calls automáticos');
}

// Executar debug
debugAuthFlow().then(() => {
  analyzeAutomaticCalls();
}).catch(console.error);
