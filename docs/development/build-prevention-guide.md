# Guia de Prevenção de Erros de Build - FalaChefe v4

## 🎯 Objetivo

Este guia fornece exemplos práticos e ações preventivas para evitar os erros de build mais comuns no projeto FalaChefe v4.

## 🚨 Erros Mais Comuns e Como Evitá-los

### 1. Avisos do Supabase com Edge Runtime

#### ❌ Problema

```
A Node.js API is used (process.versions at line: 35) which is not supported in the Edge Runtime.
```

#### ✅ Solução Preventiva

**SEMPRE manter esta configuração no `next.config.ts`:**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@supabase/ssr", "@supabase/supabase-js"],
  experimental: {
    serverComponentsExternalPackages: [
      "@supabase/ssr",
      "@supabase/supabase-js",
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        "@supabase/realtime-js": "commonjs @supabase/realtime-js",
        "@supabase/supabase-js": "commonjs @supabase/supabase-js",
      });
    }
    return config;
  },
};

export default nextConfig;
```

#### 🔧 Ações Preventivas

- **NUNCA** remover ou modificar a configuração do webpack
- **SEMPRE** verificar se o Supabase está configurado corretamente antes do deploy
- **SEMPRE** especificar runtime para funções que usam Supabase:

```typescript
// ✅ CORRETO - Especificar runtime
export const runtime = "nodejs";

export async function GET() {
  const supabase = createClient();
  // ... código que usa Supabase
}
```

### 2. Variáveis Não Utilizadas (ESLint)

#### ❌ Problema

```
Warning: '_text' is defined but never used. @typescript-eslint/no-unused-vars
```

#### ✅ Soluções Preventivas

**Opção 1: Usar a variável**

```typescript
// ✅ CORRETO - Usar a variável
async retrieve(text: string): Promise<Array<{ content: string; score: number }>> {
  console.log("Processando busca para:", text);
  // ... implementação que usa 'text'
  return [];
}
```

**Opção 2: Remover o parâmetro se não necessário**

```typescript
// ✅ CORRETO - Remover parâmetro não usado
async retrieve(): Promise<Array<{ content: string; score: number }>> {
  // ... implementação sem parâmetros
  return [];
}
```

**Opção 3: Usar underscore apenas para parâmetros que serão implementados futuramente**

```typescript
// ✅ CORRETO - Parâmetro com underscore para implementação futura
async retrieve(_text: string): Promise<Array<{ content: string; score: number }>> {
  // TODO: Implementar busca com texto
  return [];
}
```

#### 🔧 Ações Preventivas

- **SEMPRE** executar `pnpm run lint` antes de commit
- **NUNCA** deixar parâmetros não utilizados sem underscore
- **SEMPRE** usar ou remover parâmetros de função

### 3. Imports Não Utilizados

#### ❌ Problema

```
Warning: 'SomeImport' is defined but never used.
```

#### ✅ Soluções Preventivas

```typescript
// ✅ CORRETO - Remover imports não utilizados
import { usedFunction } from "./utils";
// import { unusedFunction } from './utils'; // ❌ REMOVER

// ✅ CORRETO - Usar import quando necessário
import { usedFunction, unusedFunction } from "./utils";

const result = usedFunction();
console.log("Função não usada ainda:", unusedFunction.name);
```

### 4. Console.log em Produção

#### ❌ Problema

```
Warning: Unexpected console statement. no-console
```

#### ✅ Soluções Preventivas

```typescript
// ✅ CORRETO - Usar console.warn ou console.error
console.warn("Aviso importante:", data);
console.error("Erro crítico:", error);

// ✅ CORRETO - Remover console.log antes do commit
// console.log("Debug info:", data); // ❌ REMOVER antes do commit

// ✅ CORRETO - Usar em desenvolvimento apenas
if (process.env.NODE_ENV === "development") {
  console.log("Debug info:", data);
}
```

## 🛠️ Ferramentas de Prevenção

### 1. Script de Validação Pré-Commit

```bash
# Executar antes de cada commit
./scripts/pre-commit-validation.sh
```

### 2. Configuração do VS Code

Adicionar ao `.vscode/settings.json`:

```json
{
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "eslint.validate": ["typescript", "typescriptreact"],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.formatOnSave": true
}
```

### 3. Git Hooks (Opcional)

```bash
# Instalar como pre-commit hook
ln -s ../../scripts/pre-commit-validation.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

## 📋 Checklist de Prevenção

### Antes de Cada Commit

- [ ] `pnpm run lint` - SEM warnings
- [ ] `pnpm run typecheck` - SEM erros
- [ ] `pnpm run build` - Build bem-sucedido
- [ ] Remover console.log desnecessários
- [ ] Verificar se next.config.ts está correto

### Antes de Cada Deploy

- [ ] Testar build local
- [ ] Verificar logs de build
- [ ] Confirmar que não há warnings
- [ ] Testar funcionalidades críticas

## 🚀 Workflow Recomendado

### 1. Desenvolvimento

```bash
# Iniciar desenvolvimento
pnpm run dev

# Durante o desenvolvimento
pnpm run lint  # Verificar código
pnpm run typecheck  # Verificar tipos
```

### 2. Antes do Commit

```bash
# Executar validação completa
./scripts/pre-commit-validation.sh

# Se houver erros, corrigir e repetir
pnpm run lint --fix  # Auto-corrigir problemas simples
```

### 3. Antes do Deploy

```bash
# Build local para testar
pnpm run build

# Verificar se não há warnings
pnpm run lint
```

## 🔍 Como Identificar Problemas

### Logs de Build com Problemas

```
⚠ Compiled with warnings in 52s

./src/file.ts
8:5  Warning: '_param' is defined but never used. @typescript-eslint/no-unused-vars
```

### Como Corrigir

1. Identificar o arquivo e linha do warning
2. Verificar se o parâmetro é necessário
3. Usar o parâmetro ou removê-lo
4. Executar `pnpm run lint` novamente

## 📚 Recursos Adicionais

- [Documentação do ESLint](https://eslint.org/docs/rules/)
- [Configuração do Next.js](https://nextjs.org/docs/api-reference/next.config.js/introduction)
- [Supabase Edge Runtime](https://supabase.com/docs/guides/functions/runtime)
- [TypeScript ESLint Rules](https://typescript-eslint.io/rules/)

## 🆘 Suporte

Se encontrar problemas persistentes:

1. Verificar se `next.config.ts` está correto
2. Executar `pnpm run lint` e corrigir warnings
3. Executar `pnpm run typecheck` e corrigir erros
4. Consultar `.cursor/rules/build-prevention-rules.mdc`
5. Verificar se todas as dependências estão atualizadas

---

**Última atualização:** $(date)
**Versão:** 1.0
