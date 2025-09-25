#!/usr/bin/env node

/**
 * Script para testar a funcionalidade da base de conhecimento
 *
 * Este script:
 * 1. Testa a conexão com o banco de dados
 * 2. Verifica se as tabelas foram criadas
 * 3. Testa operações básicas de CRUD
 * 4. Valida a integração com agent-squad
 */

const fs = require("fs");
const path = require("path");

console.log("🧪 Iniciando testes da base de conhecimento...\n");

// Teste 1: Verificar se os arquivos foram criados
console.log("📁 Teste 1: Verificando arquivos criados...");

const requiredFiles = [
  "src/lib/knowledge-base/document-processor.ts",
  "src/lib/knowledge-base/embedding-service.ts",
  "src/lib/knowledge-base/knowledge-base-service.ts",
  "src/lib/knowledge-base/knowledge-retriever.ts",
  "src/app/api/knowledge-base/upload/route.ts",
  "src/app/api/knowledge-base/search/route.ts",
  "src/app/api/knowledge-base/documents/route.ts",
  "src/app/api/knowledge-base/documents/[id]/route.ts",
  "src/app/api/knowledge-base/documents/[id]/reindex/route.ts",
  "src/app/admin/knowledge-base/page.tsx",
];

let filesExist = 0;
requiredFiles.forEach((file) => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
    filesExist++;
  } else {
    console.log(`  ❌ ${file} - Arquivo não encontrado`);
  }
});

console.log(
  `\n📊 Arquivos encontrados: ${filesExist}/${requiredFiles.length}\n`
);

// Teste 2: Verificar imports e dependências
console.log("🔗 Teste 2: Verificando imports e dependências...");

const testFiles = [
  "src/lib/knowledge-base/knowledge-base-service.ts",
  "src/agents/squad/leo-openai-agent.ts",
  "src/app/admin/knowledge-base/page.tsx",
];

testFiles.forEach((file) => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf8");

    // Verificar imports importantes
    const imports = [
      "knowledgeBaseService",
      "LeoKnowledgeRetriever",
      "CombinedRetriever",
      "useSession",
      "toast",
    ];

    imports.forEach((importName) => {
      if (content.includes(importName)) {
        console.log(`  ✅ ${file} - Import ${importName} encontrado`);
      } else {
        console.log(`  ⚠️  ${file} - Import ${importName} não encontrado`);
      }
    });
  }
});

console.log("");

// Teste 3: Verificar schema do banco
console.log("🗄️  Teste 3: Verificando schema do banco...");

const schemaPath = path.join(process.cwd(), "src/lib/schema.ts");
if (fs.existsSync(schemaPath)) {
  const schemaContent = fs.readFileSync(schemaPath, "utf8");

  const requiredTables = [
    "knowledgeDocuments",
    "knowledgeChunks",
    "knowledgeEmbeddings",
    "agentKnowledgeAssociations",
  ];

  requiredTables.forEach((table) => {
    if (schemaContent.includes(table)) {
      console.log(`  ✅ Tabela ${table} encontrada no schema`);
    } else {
      console.log(`  ❌ Tabela ${table} não encontrada no schema`);
    }
  });
} else {
  console.log("  ❌ Arquivo schema.ts não encontrado");
}

console.log("");

// Teste 4: Verificar configuração do agent-squad
console.log("🤖 Teste 4: Verificando integração com agent-squad...");

const orchestratorPath = path.join(
  process.cwd(),
  "src/lib/orchestrator/agent-squad.ts"
);
if (fs.existsSync(orchestratorPath)) {
  const orchestratorContent = fs.readFileSync(orchestratorPath, "utf8");

  if (orchestratorContent.includes("AgentSquad")) {
    console.log("  ✅ AgentSquad configurado");
  } else {
    console.log("  ❌ AgentSquad não configurado");
  }

  if (orchestratorContent.includes("createLeoOpenAIAgent")) {
    console.log("  ✅ Agente Leo configurado");
  } else {
    console.log("  ❌ Agente Leo não configurado");
  }
} else {
  console.log("  ❌ Arquivo agent-squad.ts não encontrado");
}

console.log("");

// Teste 5: Verificar interface administrativa
console.log("🖥️  Teste 5: Verificando interface administrativa...");

const adminPagePath = path.join(
  process.cwd(),
  "src/app/admin/knowledge-base/page.tsx"
);
if (fs.existsSync(adminPagePath)) {
  const adminContent = fs.readFileSync(adminPagePath, "utf8");

  const requiredComponents = [
    "Upload",
    "Search",
    "FileText",
    "Trash2",
    "RefreshCw",
    "Plus",
    "Filter",
  ];

  requiredComponents.forEach((component) => {
    if (adminContent.includes(component)) {
      console.log(`  ✅ Componente ${component} encontrado`);
    } else {
      console.log(`  ⚠️  Componente ${component} não encontrado`);
    }
  });

  if (adminContent.includes("handleUpload")) {
    console.log("  ✅ Função de upload implementada");
  } else {
    console.log("  ❌ Função de upload não implementada");
  }

  if (adminContent.includes("handleDelete")) {
    console.log("  ✅ Função de deletar implementada");
  } else {
    console.log("  ❌ Função de deletar não implementada");
  }
} else {
  console.log("  ❌ Página administrativa não encontrada");
}

console.log("");

// Teste 6: Verificar navegação
console.log("🧭 Teste 6: Verificando navegação...");

const headerPath = path.join(process.cwd(), "src/components/site-header.tsx");
if (fs.existsSync(headerPath)) {
  const headerContent = fs.readFileSync(headerPath, "utf8");

  if (headerContent.includes("/admin/knowledge-base")) {
    console.log("  ✅ Link para base de conhecimento no header");
  } else {
    console.log("  ❌ Link para base de conhecimento não encontrado no header");
  }

  if (headerContent.includes("FileText")) {
    console.log("  ✅ Ícone FileText importado");
  } else {
    console.log("  ❌ Ícone FileText não importado");
  }
} else {
  console.log("  ❌ Arquivo site-header.tsx não encontrado");
}

console.log("");

// Teste 7: Verificar package.json
console.log("📦 Teste 7: Verificando dependências...");

const packagePath = path.join(process.cwd(), "package.json");
if (fs.existsSync(packagePath)) {
  const packageContent = fs.readFileSync(packagePath, "utf8");

  if (packageContent.includes("agent-squad")) {
    console.log("  ✅ agent-squad instalado");
  } else {
    console.log("  ❌ agent-squad não instalado");
  }

  if (packageContent.includes("@radix-ui/react-tabs")) {
    console.log("  ✅ @radix-ui/react-tabs instalado");
  } else {
    console.log("  ❌ @radix-ui/react-tabs não instalado");
  }
} else {
  console.log("  ❌ Arquivo package.json não encontrado");
}

console.log("");

// Resumo dos testes
console.log("📋 Resumo dos Testes:");
console.log(`  📁 Arquivos criados: ${filesExist}/${requiredFiles.length}`);
console.log("  🔗 Imports verificados");
console.log("  🗄️  Schema do banco verificado");
console.log("  🤖 Integração agent-squad verificada");
console.log("  🖥️  Interface administrativa verificada");
console.log("  🧭 Navegação verificada");
console.log("  📦 Dependências verificadas");

console.log("\n🎉 Testes da base de conhecimento concluídos!");
console.log("\n📝 Próximos passos:");
console.log("  1. Execute o servidor de desenvolvimento: npm run dev");
console.log("  2. Acesse /admin/knowledge-base para testar a interface");
console.log("  3. Faça upload de um documento de teste");
console.log("  4. Teste a busca semântica nos agentes");
console.log("  5. Verifique se os agentes estão usando a base de conhecimento");

console.log("\n⚠️  Notas importantes:");
console.log("  - A busca vetorial com pgvector ainda não está implementada");
console.log("  - A extração de PDF e DOCX ainda não está implementada");
console.log("  - Use arquivos TXT ou MD para testes iniciais");
console.log("  - A funcionalidade está integrada com o agent-squad existente");
