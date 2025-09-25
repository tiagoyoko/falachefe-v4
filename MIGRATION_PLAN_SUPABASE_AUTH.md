# Plano de Migração: Better Auth → Supabase Auth

## 📋 Resumo da Situação Atual

### ✅ **Já Migrados para Supabase:**

- `src/lib/supabase-client.ts` - Cliente Supabase para browser
- `src/lib/supabase-server.ts` - Cliente Supabase para servidor
- `src/lib/supabase.ts` - Cliente Supabase básico
- `src/lib/auth-server.ts` - Funções de autenticação do servidor
- `src/hooks/use-auth.ts` - Hook de autenticação para React
- `src/middleware.ts` - Middleware de autenticação
- Todas as páginas de autenticação (`src/app/auth/*`)
- Componentes de autenticação (`src/components/auth/*`)

### ❌ **Ainda Usando Better Auth:**

- `src/app/settings/agents/page.tsx` - Importa `@/lib/auth-client` (deletado)
- Vários arquivos de teste que referenciam Better Auth
- Documentação que menciona Better Auth

## 🎯 Arquivos que Precisam ser Atualizados

### 1. **Arquivos com Imports Quebrados (CRÍTICO)**

#### `src/app/settings/agents/page.tsx`

```typescript
// ❌ ATUAL (quebrado)
import { getSession } from "@/lib/auth-client";

// ✅ NOVO
import { getSession } from "@/lib/auth-server";
```

### 2. **Arquivos de Teste (LIMPEZA)**

#### Arquivos para Deletar:

- `test-auth.js`
- `test-auth-simple.js`

#### Arquivos para Atualizar:

- `scripts/validate-frontend-implementation.js` - Remover referências ao Better Auth
- `scripts/validate-implementation.js` - Atualizar validações

### 3. **Documentação (ATUALIZAÇÃO)**

#### `docs/features/architecture.md`

- Linha 5: "Better Auth" → "Supabase Auth"
- Linha 20: "Better Auth" → "Supabase Auth"
- Linha 48: "auth.ts" → "auth-server.ts"
- Linha 58: "user (id, name, email, emailVerified, image)" → Atualizar para schema Supabase
- Linha 160: "Better Auth" → "Supabase Auth"

### 4. **Package.json (LIMPEZA)**

#### Dependências para Remover:

```json
// Remover se existir
"@better-auth/core": "^x.x.x",
"@better-auth/nextjs": "^x.x.x"
```

#### Dependências Já Presentes (✅):

```json
"@supabase/ssr": "^0.7.0",
"@supabase/supabase-js": "^2.58.0"
```

## 🚀 Plano de Execução

### **Fase 1: Correções Críticas (Prioridade ALTA)**

1. **Corrigir Import Quebrado**

   ```bash
   # Arquivo: src/app/settings/agents/page.tsx
   # Mudança: auth-client → auth-server
   ```

2. **Verificar Funcionamento**
   ```bash
   npm run typecheck
   npm run lint
   ```

### **Fase 2: Limpeza de Arquivos (Prioridade MÉDIA)**

1. **Deletar Arquivos de Teste Obsoletos**

   ```bash
   rm test-auth.js
   rm test-auth-simple.js
   ```

2. **Atualizar Scripts de Validação**
   - Remover referências ao Better Auth
   - Atualizar validações para Supabase

### **Fase 3: Atualização de Documentação (Prioridade BAIXA)**

1. **Atualizar Architecture.md**
   - Substituir todas as menções ao Better Auth
   - Atualizar diagramas e exemplos de código

2. **Verificar Outros Docs**
   - `README.md`
   - `VALIDATION_REPORT.md`
   - Outros arquivos de documentação

### **Fase 4: Validação Final (Prioridade ALTA)**

1. **Testes de Funcionamento**

   ```bash
   npm run dev
   # Testar login/logout
   # Testar páginas protegidas
   # Testar middleware
   ```

2. **Verificação de Build**
   ```bash
   npm run build
   npm run typecheck
   npm run lint
   ```

## 📊 Mapeamento Detalhado de Arquivos

### **Arquivos que Usam Autenticação (Já Migrados ✅)**

#### API Routes (15 arquivos):

- `src/app/api/admin/agents/route.ts`
- `src/app/api/admin/agents/[id]/route.ts`
- `src/app/api/admin/agents/[id]/toggle/route.ts`
- `src/app/api/agent-config/route.ts`
- `src/app/api/default-categories/route.ts`
- `src/app/api/knowledge-base/documents/route.ts`
- `src/app/api/knowledge-base/documents/[id]/route.ts`
- `src/app/api/knowledge-base/documents/[id]/reindex/route.ts`
- `src/app/api/knowledge-base/search/route.ts`
- `src/app/api/knowledge-base/upload/route.ts`
- `src/app/api/onboarding/route.ts`

#### Páginas (8 arquivos):

- `src/app/auth/signin/page.tsx`
- `src/app/auth/signup/page.tsx`
- `src/app/auth/reset-password/page.tsx`
- `src/app/auth/verify-email/page.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/chat/page.tsx`
- `src/app/cashflow/page.tsx`
- `src/app/profile/page.tsx`
- `src/app/conversations/page.tsx`

#### Componentes (6 arquivos):

- `src/components/auth/sign-in-button.tsx`
- `src/components/auth/sign-out-button.tsx`
- `src/components/auth/user-profile.tsx`
- `src/components/auth/onboarding-guard.tsx`
- `src/components/onboarding/onboarding-flow.tsx`
- `src/components/agent-settings-form.tsx`
- `src/components/site-header.tsx`

#### Hooks (2 arquivos):

- `src/hooks/use-auth.ts`
- `src/hooks/use-onboarding.ts`

### **Arquivos que Precisam de Correção (❌)**

#### Arquivos com Imports Quebrados (1 arquivo):

- `src/app/settings/agents/page.tsx` - **CRÍTICO**

#### Arquivos de Teste para Deletar (2 arquivos):

- `test-auth.js`
- `test-auth-simple.js`

#### Scripts para Atualizar (2 arquivos):

- `scripts/validate-frontend-implementation.js`
- `scripts/validate-implementation.js`

#### Documentação para Atualizar (3 arquivos):

- `docs/features/architecture.md`
- `README.md`
- `VALIDATION_REPORT.md`

## 🔧 Comandos de Execução

### **1. Correção Crítica**

```bash
# Corrigir import quebrado
sed -i 's/@\/lib\/auth-client/@\/lib\/auth-server/g' src/app/settings/agents/page.tsx
```

### **2. Limpeza de Arquivos**

```bash
# Deletar arquivos de teste obsoletos
rm test-auth.js test-auth-simple.js

# Verificar se não há mais referências
grep -r "better-auth" . --exclude-dir=node_modules --exclude-dir=.git
```

### **3. Validação**

```bash
# Verificar tipos
npm run typecheck

# Verificar lint
npm run lint

# Testar build
npm run build
```

## 📈 Status da Migração

- ✅ **Core Auth System**: 100% migrado
- ✅ **API Routes**: 100% migrado
- ✅ **Pages**: 100% migrado
- ✅ **Components**: 100% migrado
- ✅ **Hooks**: 100% migrado
- ✅ **Middleware**: 100% migrado
- ❌ **Settings Page**: 1 arquivo com import quebrado
- ❌ **Test Files**: 2 arquivos para deletar
- ❌ **Scripts**: 2 arquivos para atualizar
- ❌ **Documentation**: 3 arquivos para atualizar

**Progresso Geral: ~85% Completo**

## 🎯 Próximos Passos

1. **Imediato**: Corrigir import em `src/app/settings/agents/page.tsx`
2. **Curto Prazo**: Deletar arquivos de teste obsoletos
3. **Médio Prazo**: Atualizar scripts de validação
4. **Longo Prazo**: Atualizar documentação

A migração está praticamente completa, restando apenas ajustes menores e limpeza de arquivos obsoletos.
