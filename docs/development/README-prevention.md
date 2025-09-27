# 🛡️ Sistema de Prevenção de Erros de Build - FalaChefe v4

## 📋 Visão Geral

Este sistema foi criado para prevenir os erros de build mais comuns que causavam falhas no deploy do Vercel, especialmente:

1. **Avisos do Supabase com Edge Runtime**
2. **Variáveis não utilizadas (ESLint)**
3. **Imports duplicados**
4. **Configurações incorretas**

## 🚀 Como Usar

### Validação Automática

```bash
# Executar validação completa antes de cada commit
./scripts/pre-commit-validation.sh
```

### Validação Manual

```bash
# Verificar código
pnpm run lint

# Verificar tipos
pnpm run typecheck

# Testar build
pnpm run build
```

## 📁 Arquivos Criados

### 1. Regras de Prevenção

- **`.cursor/rules/build-prevention-rules.mdc`** - Regras detalhadas de prevenção
- **`docs/development/build-prevention-guide.md`** - Guia prático com exemplos

### 2. Scripts de Validação

- **`scripts/pre-commit-validation.sh`** - Script automático de validação

### 3. Configurações

- **`eslint.config.mjs`** - Configuração ESLint otimizada
- **`next.config.ts`** - Configuração Next.js para Supabase

## ✅ Checklist de Prevenção

### Antes de Cada Commit

- [ ] Executar `./scripts/pre-commit-validation.sh`
- [ ] Verificar se todas as validações passaram
- [ ] Corrigir qualquer erro antes de fazer commit

### Antes de Cada Deploy

- [ ] Testar build local: `pnpm run build`
- [ ] Verificar logs de build no Vercel
- [ ] Confirmar que não há warnings

## 🔧 Configurações Aplicadas

### ESLint (eslint.config.mjs)

```javascript
// Regras críticas que causam falha de build
"@typescript-eslint/no-unused-vars": "error",
"no-duplicate-imports": "error",
"no-undef": "error",
"no-unreachable": "error",

// Regras de boa prática
"no-var": "error",
"prefer-const": "error",

// Console.log permitido para desenvolvimento
"no-console": "off"
```

### Next.js (next.config.ts)

```typescript
// Configuração para Supabase com Edge Runtime
serverExternalPackages: ["@supabase/ssr", "@supabase/supabase-js"],
experimental: {
  serverComponentsExternalPackages: ["@supabase/ssr", "@supabase/supabase-js"],
},
webpack: (config, { isServer }) => {
  if (isServer) {
    config.externals.push({
      "@supabase/realtime-js": "commonjs @supabase/realtime-js",
      "@supabase/supabase-js": "commonjs @supabase/supabase-js",
    });
  }
  return config;
}
```

## 🚨 Erros Prevenidos

### 1. Supabase Edge Runtime

**Problema:** `A Node.js API is used (process.versions) which is not supported in the Edge Runtime`
**Solução:** Configuração do webpack no `next.config.ts`

### 2. Variáveis Não Utilizadas

**Problema:** `Warning: '_param' is defined but never used`
**Solução:** Regra ESLint rigorosa + uso correto de parâmetros

### 3. Imports Duplicados

**Problema:** `Error: 'module' import is duplicated`
**Solução:** Regra ESLint + consolidação de imports

### 4. React Undefined

**Problema:** `Error: 'React' is not defined`
**Solução:** Configuração ESLint específica para arquivos TSX

## 📊 Resultados

### Antes da Implementação

```
⚠ Compiled with warnings in 52s
- 2 avisos do Supabase Edge Runtime
- 9 avisos de variáveis não utilizadas
- Build com warnings
```

### Após Implementação

```
✅ Compiled successfully in 6.0s
- 0 avisos
- 0 erros
- Build limpo
```

## 🔄 Workflow Recomendado

### 1. Desenvolvimento

```bash
# Iniciar desenvolvimento
pnpm run dev

# Durante desenvolvimento, verificar código
pnpm run lint
```

### 2. Antes do Commit

```bash
# Validação automática
./scripts/pre-commit-validation.sh

# Se houver erros, corrigir e repetir
```

### 3. Deploy

```bash
# Build local para testar
pnpm run build

# Push para GitHub (deploy automático no Vercel)
git push origin main
```

## 🆘 Solução de Problemas

### Se o Script Falhar

1. Verificar se `next.config.ts` está correto
2. Executar `pnpm run lint` manualmente
3. Corrigir erros específicos
4. Executar script novamente

### Se o Build Falhar no Vercel

1. Verificar logs de build no Vercel
2. Executar build local: `pnpm run build`
3. Comparar com logs do Vercel
4. Verificar variáveis de ambiente

### Se Houver Novos Warnings

1. Executar `pnpm run lint`
2. Identificar origem do warning
3. Corrigir ou adicionar exceção ao ESLint
4. Atualizar documentação se necessário

## 📚 Recursos Adicionais

- [Documentação do ESLint](https://eslint.org/docs/rules/)
- [Configuração do Next.js](https://nextjs.org/docs/api-reference/next.config.js/introduction)
- [Supabase Edge Runtime](https://supabase.com/docs/guides/functions/runtime)
- [Guia de Prevenção Detalhado](./build-prevention-guide.md)

## 🎯 Manutenção

### Atualizações Regulares

- Revisar regras ESLint mensalmente
- Verificar compatibilidade com novas versões
- Atualizar documentação conforme necessário

### Monitoramento

- Verificar logs de build no Vercel
- Monitorar warnings em produção
- Ajustar configurações conforme necessário

---

**Criado em:** $(date)
**Versão:** 1.0
**Status:** ✅ Ativo e Funcionando
