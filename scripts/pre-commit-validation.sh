#!/bin/bash

# Script de Validação Pré-Commit para FalaChefe v4
# Previne erros de build e mantém código limpo

echo "🔍 Iniciando validação pré-commit..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de erros
ERRORS=0

# Função para exibir erros
show_error() {
    echo -e "${RED}❌ ERRO: $1${NC}"
    ERRORS=$((ERRORS + 1))
}

# Função para exibir sucesso
show_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Função para exibir warning
show_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo "📋 Executando checklist de validação..."

# 1. Verificar se next.config.ts está correto
echo "1️⃣ Verificando configuração do Next.js..."
if grep -q "serverExternalPackages.*@supabase" next.config.ts; then
    show_success "Configuração do Supabase no next.config.ts está correta"
else
    show_error "Configuração do Supabase no next.config.ts está faltando ou incorreta"
fi

# 2. Executar ESLint
echo "2️⃣ Executando ESLint..."
if pnpm run lint > /dev/null 2>&1; then
    show_success "ESLint passou sem warnings ou erros"
else
    show_error "ESLint encontrou warnings ou erros"
    echo "Executando ESLint para mostrar detalhes..."
    pnpm run lint
fi

# 3. Executar TypeCheck
echo "3️⃣ Executando TypeCheck..."
if pnpm run typecheck > /dev/null 2>&1; then
    show_success "TypeCheck passou sem erros"
else
    show_error "TypeCheck encontrou erros de tipos"
    echo "Executando TypeCheck para mostrar detalhes..."
    pnpm run typecheck
fi

# 4. Verificar variáveis não utilizadas
echo "4️⃣ Verificando variáveis não utilizadas..."
UNUSED_VARS=$(pnpm run lint 2>&1 | grep -c "Warning.*defined but never used" || true)
if [ "$UNUSED_VARS" -eq 0 ]; then
    show_success "Nenhuma variável não utilizada encontrada"
else
    show_error "Encontradas $UNUSED_VARS variáveis não utilizadas"
fi

# 5. Verificar se build local funciona
echo "5️⃣ Testando build local..."
if pnpm run build > /dev/null 2>&1; then
    show_success "Build local executado com sucesso"
else
    show_error "Build local falhou"
    echo "Executando build para mostrar detalhes..."
    pnpm run build
fi

# 6. Verificar configurações do Supabase
echo "6️⃣ Verificando configurações do Supabase..."
if [ -f ".env.local" ] || [ -f ".env" ]; then
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local 2>/dev/null || grep -q "NEXT_PUBLIC_SUPABASE_URL" .env 2>/dev/null; then
        show_success "Variáveis do Supabase configuradas"
    else
        show_warning "Variáveis do Supabase podem não estar configuradas"
    fi
else
    show_warning "Arquivos de ambiente não encontrados"
fi

# Resultado final
echo ""
echo "📊 RESUMO DA VALIDAÇÃO:"
echo "========================="

if [ $ERRORS -eq 0 ]; then
    show_success "Todas as validações passaram! Commit permitido."
    echo ""
    echo "🎉 Seu código está pronto para commit!"
    exit 0
else
    show_error "Encontrados $ERRORS erros. Commit rejeitado."
    echo ""
    echo "🔧 CORREÇÕES NECESSÁRIAS:"
    echo "- Execute 'pnpm run lint' e corrija todos os warnings"
    echo "- Execute 'pnpm run typecheck' e corrija todos os erros"
    echo "- Verifique se next.config.ts está configurado corretamente"
    echo "- Remova ou use todas as variáveis não utilizadas"
    echo ""
    echo "📚 Consulte .cursor/rules/build-prevention-rules.mdc para mais detalhes"
    exit 1
fi
