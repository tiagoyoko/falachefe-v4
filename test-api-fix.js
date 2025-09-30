#!/usr/bin/env node

/**
 * Script para testar e debugar problemas com a API /api/agent
 */

const https = require('https');
const http = require('http');

// Configurações
const VERCEL_URL = 'https://falachefe-v4.vercel.app';
const LOCAL_URL = 'http://localhost:3000';

// Payload de teste
const testPayload = {
  userId: "placeholder-user-id",
  command: "oi"
};

/**
 * Faz uma requisição HTTP
 */
function makeRequest(url, payload) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(payload))
      }
    };

    const req = (urlObj.protocol === 'https:' ? https : http).request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(JSON.stringify(payload));
    req.end();
  });
}

/**
 * Testa uma URL específica
 */
async function testApi(baseUrl, label) {
  console.log(`\n🧪 Testando ${label}: ${baseUrl}`);
  console.log('=' .repeat(50));
  
  try {
    const response = await makeRequest(`${baseUrl}/api/agent`, testPayload);
    
    console.log(`✅ Status: ${response.statusCode} ${response.statusMessage}`);
    console.log(`📝 Headers:`, JSON.stringify(response.headers, null, 2));
    console.log(`📄 Body:`, response.body);
    
    // Tentar parsear JSON
    try {
      const jsonResponse = JSON.parse(response.body);
      console.log(`📊 JSON Response:`, JSON.stringify(jsonResponse, null, 2));
    } catch (e) {
      console.log(`❌ Resposta não é JSON válido: ${e.message}`);
    }
    
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
    console.log(`📝 Details:`, error);
  }
}

/**
 * Testa se o endpoint existe fazendo um GET
 */
async function testEndpointExists(baseUrl, label) {
  console.log(`\n🔍 Verificando se endpoint existe: ${label}`);
  console.log('-'.repeat(30));
  
  try {
    const response = await makeRequest(`${baseUrl}/api/agent?userId=test&type=stats`, {});
    console.log(`✅ Endpoint existe! Status: ${response.statusCode}`);
  } catch (error) {
    console.log(`❌ Endpoint não encontrado: ${error.message}`);
  }
}

/**
 * Função principal
 */
async function main() {
  console.log('🚀 Iniciando diagnóstico da API /api/agent');
  console.log('=' .repeat(60));
  
  // 1. Testar localmente (se disponível)
  console.log('\n1️⃣ Testando LOCAL (se servidor estiver rodando)');
  try {
    await testApi(LOCAL_URL, 'Local');
  } catch (error) {
    console.log(`⚠️  Servidor local não está rodando: ${error.message}`);
  }
  
  // 2. Verificar se endpoint existe no Vercel
  await testEndpointExists(VERCEL_URL, 'Vercel');
  
  // 3. Testar no Vercel
  console.log('\n2️⃣ Testando VERCEL (produção)');
  await testApi(VERCEL_URL, 'Vercel');
  
  // 4. Sugestões de correção
  console.log('\n🔧 POSSÍVEIS SOLUÇÕES:');
  console.log('=' .repeat(30));
  console.log('1. Verificar se o deploy foi bem-sucedido no Vercel');
  console.log('2. Verificar se as variáveis de ambiente estão configuradas');
  console.log('3. Verificar se o arquivo route.ts está na estrutura correta');
  console.log('4. Verificar se não há erros de build/compilação');
  console.log('5. Tentar redeploy forçado no Vercel');
  
  console.log('\n📋 COMANDOS PARA VERIFICAR:');
  console.log('- vercel logs');
  console.log('- vercel env ls');
  console.log('- vercel --prod (redeploy)');
  
  console.log('\n✅ Diagnóstico concluído!');
}

// Executar
main().catch(console.error);
