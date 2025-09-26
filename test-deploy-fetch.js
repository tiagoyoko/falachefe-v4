#!/usr/bin/env node

const https = require("https");
const http = require("http");

console.log("🚀 TESTE DE DEPLOY E FETCH - FALACHEFE V4");
console.log("==========================================\n");

// URLs para testar
const urls = [
  "https://falachefe-v4.vercel.app",
  "https://falachefe-v4.vercel.app/auth/signin",
  "https://falachefe-v4.vercel.app/api/health",
];

async function testUrl(url) {
  return new Promise((resolve) => {
    const client = url.startsWith("https") ? https : http;

    console.log(`🔍 Testando: ${url}`);

    const req = client.request(
      url,
      {
        method: "GET",
        timeout: 10000,
        headers: {
          "User-Agent": "FalaChefe-Test/1.0",
        },
      },
      (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Headers: ${JSON.stringify(res.headers, null, 2)}`);

          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`   ✅ Sucesso: ${url}`);
          } else {
            console.log(`   ⚠️  Status não ideal: ${url}`);
          }

          // Verificar se há erros de fetch no conteúdo
          if (
            data.includes("fetch failed") ||
            data.includes("ERR_NAME_NOT_RESOLVED")
          ) {
            console.log(`   ❌ Erro de fetch detectado no conteúdo`);
          }

          resolve({
            url,
            status: res.statusCode,
            success: res.statusCode >= 200 && res.statusCode < 300,
            hasFetchError:
              data.includes("fetch failed") ||
              data.includes("ERR_NAME_NOT_RESOLVED"),
          });
        });
      }
    );

    req.on("error", (err) => {
      console.log(`   ❌ Erro: ${err.message}`);
      resolve({
        url,
        status: 0,
        success: false,
        error: err.message,
      });
    });

    req.on("timeout", () => {
      console.log(`   ⏰ Timeout: ${url}`);
      req.destroy();
      resolve({
        url,
        status: 0,
        success: false,
        error: "Timeout",
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log("1️⃣ TESTANDO CONECTIVIDADE BÁSICA");
  console.log("----------------------------------");

  const results = [];

  for (const url of urls) {
    const result = await testUrl(url);
    results.push(result);
    console.log(""); // Linha em branco
  }

  console.log("2️⃣ RESUMO DOS TESTES");
  console.log("--------------------");

  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const fetchErrors = results.filter((r) => r.hasFetchError).length;

  console.log(`✅ Sucessos: ${successful}/${results.length}`);
  console.log(`❌ Falhas: ${failed}/${results.length}`);
  console.log(`🔍 Erros de fetch: ${fetchErrors}/${results.length}`);

  if (fetchErrors > 0) {
    console.log("\n❌ PROBLEMAS DE FETCH DETECTADOS:");
    results
      .filter((r) => r.hasFetchError)
      .forEach((r) => {
        console.log(`   - ${r.url}`);
      });
  } else {
    console.log("\n✅ NENHUM PROBLEMA DE FETCH DETECTADO");
  }

  console.log("\n3️⃣ PRÓXIMOS PASSOS");
  console.log("-------------------");

  if (successful === results.length) {
    console.log("✅ Deploy funcionando perfeitamente!");
    console.log("✅ Nenhum problema de fetch detectado!");
    console.log("✅ Sistema pronto para uso!");
  } else {
    console.log("⚠️  Alguns problemas detectados:");
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`   - ${r.url}: ${r.error || "Status " + r.status}`);
      });
  }
}

// Executar testes
runTests().catch(console.error);
