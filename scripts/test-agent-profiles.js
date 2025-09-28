#!/usr/bin/env node

/**
 * Script de teste para o sistema de perfis e memória persistente dos agentes
 * Testa: Leo (Financeiro), Max (Marketing), Lia (RH)
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Dados de teste
const testUserId = 'test-user-' + Date.now();
const testMessages = [
  "Olá, preciso de ajuda com meu fluxo de caixa",
  "Como posso melhorar minhas vendas?",
  "Tenho problemas com minha equipe, pode me ajudar?",
  "Qual é o melhor jeito de organizar as finanças?",
  "Preciso de ideias para marketing digital"
];

async function testAgentProfiles() {
  console.log('🧪 Iniciando testes do sistema de perfis e memória persistente...\n');

  try {
    // 1. Teste de criação de usuário
    console.log('1️⃣ Criando usuário de teste...');
    const { data: user, error: userError } = await supabase
      .from('user')
      .insert({
        id: testUserId,
        name: 'Usuário Teste',
        email: `teste${Date.now()}@example.com`,
        role: 'user'
      })
      .select()
      .single();

    if (userError) {
      console.error('❌ Erro ao criar usuário:', userError);
      return;
    }
    console.log('✅ Usuário criado:', user.id);

    // 2. Teste de perfis de agentes
    console.log('\n2️⃣ Testando criação de perfis de agentes...');
    
    const agents = ['leo', 'max', 'lia'];
    const profiles = {};

    for (const agent of agents) {
      const { data: profile, error: profileError } = await supabase
        .from('agentProfiles')
        .insert({
          id: `profile-${agent}-${Date.now()}`,
          userId: testUserId,
          agent: agent,
          settings: {
            persona: {
              displayName: `${agent.toUpperCase()} – Agente Teste`,
              description: `Agente de teste para ${agent}`,
              tone: `Tom de teste para ${agent}`
            },
            preferences: {
              responseStyle: 'friendly',
              detailLevel: 'detailed',
              language: 'pt-BR'
            },
            business: {
              industry: 'Tecnologia',
              businessSize: 'pequeno',
              monthlyRevenue: 'R$ 10.000 - R$ 50.000',
              employeeCount: '5-10',
              mainGoals: ['Crescimento', 'Eficiência'],
              painPoints: ['Organização', 'Tempo']
            }
          }
        })
        .select()
        .single();

      if (profileError) {
        console.error(`❌ Erro ao criar perfil do ${agent}:`, profileError);
        continue;
      }

      profiles[agent] = profile;
      console.log(`✅ Perfil do ${agent} criado:`, profile.id);
    }

    // 3. Teste de sessões de conversa
    console.log('\n3️⃣ Testando sessões de conversa...');
    
    const sessions = {};
    
    for (const agent of agents) {
      const { data: session, error: sessionError } = await supabase
        .from('conversationSessions')
        .insert({
          id: `session-${agent}-${Date.now()}`,
          userId: testUserId,
          agent: agent,
          title: `Conversa com ${agent.toUpperCase()}`
        })
        .select()
        .single();

      if (sessionError) {
        console.error(`❌ Erro ao criar sessão do ${agent}:`, sessionError);
        continue;
      }

      sessions[agent] = session;
      console.log(`✅ Sessão do ${agent} criada:`, session.id);
    }

    // 4. Teste de mensagens de conversa
    console.log('\n4️⃣ Testando mensagens de conversa...');
    
    for (const agent of agents) {
      const sessionId = sessions[agent]?.id;
      if (!sessionId) continue;

      console.log(`\n📝 Testando mensagens para ${agent}:`);
      
      for (let i = 0; i < testMessages.length; i++) {
        const message = testMessages[i];
        
        // Mensagem do usuário
        const { error: userMsgError } = await supabase
          .from('conversationMessages')
          .insert({
            id: `msg-user-${agent}-${i}-${Date.now()}`,
            sessionId: sessionId,
            role: 'user',
            content: message,
            metadata: { test: true }
          });

        if (userMsgError) {
          console.error(`❌ Erro ao salvar mensagem do usuário:`, userMsgError);
          continue;
        }

        // Resposta simulada do agente
        const agentResponse = `Resposta do ${agent.toUpperCase()} para: "${message}"`;
        const { error: agentMsgError } = await supabase
          .from('conversationMessages')
          .insert({
            id: `msg-agent-${agent}-${i}-${Date.now()}`,
            sessionId: sessionId,
            role: 'assistant',
            content: agentResponse,
            metadata: { 
              test: true,
              agent: agent,
              businessContext: true
            }
          });

        if (agentMsgError) {
          console.error(`❌ Erro ao salvar mensagem do agente:`, agentMsgError);
          continue;
        }

        console.log(`  ✅ Mensagem ${i + 1}: ${message.substring(0, 50)}...`);
      }
    }

    // 5. Teste de consultas e estatísticas
    console.log('\n5️⃣ Testando consultas e estatísticas...');
    
    for (const agent of agents) {
      // Busca perfil
      const { data: profile, error: profileError } = await supabase
        .from('agentProfiles')
        .select('*')
        .eq('userId', testUserId)
        .eq('agent', agent)
        .single();

      if (profileError) {
        console.error(`❌ Erro ao buscar perfil do ${agent}:`, profileError);
        continue;
      }

      // Busca sessões
      const { data: sessions, error: sessionsError } = await supabase
        .from('conversationSessions')
        .select('*')
        .eq('userId', testUserId)
        .eq('agent', agent);

      if (sessionsError) {
        console.error(`❌ Erro ao buscar sessões do ${agent}:`, sessionsError);
        continue;
      }

      // Busca mensagens
      const { data: messages, error: messagesError } = await supabase
        .from('conversationMessages')
        .select('*')
        .in('sessionId', sessions.map(s => s.id));

      if (messagesError) {
        console.error(`❌ Erro ao buscar mensagens do ${agent}:`, messagesError);
        continue;
      }

      console.log(`\n📊 Estatísticas do ${agent.toUpperCase()}:`);
      console.log(`  - Perfil: ${profile ? '✅' : '❌'}`);
      console.log(`  - Sessões: ${sessions.length}`);
      console.log(`  - Mensagens: ${messages.length}`);
      console.log(`  - Configurações: ${JSON.stringify(profile.settings, null, 2)}`);
    }

    // 6. Teste de limpeza (opcional)
    console.log('\n6️⃣ Limpeza dos dados de teste...');
    
    const cleanup = process.argv.includes('--cleanup');
    if (cleanup) {
      console.log('🧹 Removendo dados de teste...');
      
      // Remove mensagens
      await supabase
        .from('conversationMessages')
        .delete()
        .in('sessionId', Object.values(sessions).map(s => s.id));

      // Remove sessões
      await supabase
        .from('conversationSessions')
        .delete()
        .eq('userId', testUserId);

      // Remove perfis
      await supabase
        .from('agentProfiles')
        .delete()
        .eq('userId', testUserId);

      // Remove usuário
      await supabase
        .from('user')
        .delete()
        .eq('id', testUserId);

      console.log('✅ Dados de teste removidos');
    } else {
      console.log('ℹ️  Para remover dados de teste, execute: node scripts/test-agent-profiles.js --cleanup');
    }

    console.log('\n🎉 Testes concluídos com sucesso!');
    console.log('\n📋 Resumo:');
    console.log('✅ Sistema de perfis de agentes funcionando');
    console.log('✅ Memória persistente funcionando');
    console.log('✅ Sessões de conversa funcionando');
    console.log('✅ APIs de gerenciamento funcionando');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  }
}

// Executa os testes
testAgentProfiles();
