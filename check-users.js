#!/usr/bin/env node

/**
 * Script para verificar usuários no banco de dados
 */

require('dotenv').config({ path: '.env.local' });
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

async function checkUsers() {
  console.log('🔍 Verificando usuários no banco de dados...\n');
  
  try {
    const sql = postgres(process.env.POSTGRES_URL);
    const db = drizzle(sql);
    
    // Query para listar usuários (tabela 'user' no singular)
    const result = await sql`
      SELECT id, email, name, "createdAt" as created_at 
      FROM "user" 
      ORDER BY "createdAt" DESC 
      LIMIT 10
    `;
    
    if (result.length === 0) {
      console.log('❌ Nenhum usuário encontrado no banco de dados');
      console.log('\n🔧 Sugestões:');
      console.log('1. Fazer signup primeiro');
      console.log('2. Verificar se o banco está conectado corretamente');
    } else {
      console.log(`✅ Encontrados ${result.length} usuários:`);
      console.log('=' .repeat(60));
      
      result.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}`);
        console.log(`   Email: ${user.email || 'N/A'}`);
        console.log(`   Nome: ${user.name || 'N/A'}`);
        console.log(`   Criado: ${user.created_at}`);
        console.log('-' .repeat(40));
      });
      
      console.log('\n💡 Para testar a API, use um destes IDs válidos:');
      console.log(`📝 Exemplo: {"userId": "${result[0].id}", "command": "oi"}`);
    }
    
    await sql.end();
    
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco:', error.message);
    console.log('\n🔧 Verificar:');
    console.log('1. POSTGRES_URL em .env.local');
    console.log('2. Conexão com o banco');
    console.log('3. Permissões de acesso');
  }
}

checkUsers();
