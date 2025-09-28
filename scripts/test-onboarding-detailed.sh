#!/bin/bash

echo "🧪 Teste detalhado da API de onboarding..."

# Aguardar o servidor inicializar
sleep 3

# Dados de teste
TEST_DATA='{
  "selectedFeatures": ["marketing", "vendas", "financeiro"],
  "companyInfo": {
    "name": "Empresa Teste",
    "segment": "varejo",
    "businessSize": "pequeno",
    "monthlyRevenue": "10k-50k",
    "employeeCount": "1-10",
    "description": "Empresa de teste para onboarding",
    "city": "São Paulo",
    "state": "SP",
    "phone": "11999999999"
  },
  "whatsappNumber": "11999999999",
  "categoriesData": {
    "selectedCategories": ["vendas-produtos", "aluguel", "marketing"],
    "customCategories": []
  }
}'

echo "📤 Enviando dados de teste..."
echo "$TEST_DATA" | jq .

# Fazer a requisição com logs detalhados
echo "🔄 Fazendo requisição para /api/onboarding..."

RESPONSE=$(curl -s -w "\n%{http_code}\n%{time_total}" -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "$TEST_DATA" \
  http://localhost:3000/api/onboarding)

# Separar resposta, código de status e tempo
HTTP_CODE=$(echo "$RESPONSE" | tail -n 2 | head -n 1)
TIME_TOTAL=$(echo "$RESPONSE" | tail -n 1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -2)

echo ""
echo "📊 Resultado da requisição:"
echo "Status HTTP: $HTTP_CODE"
echo "Tempo total: ${TIME_TOTAL}s"
echo ""

if [ "$HTTP_CODE" -eq 200 ]; then
  echo "✅ API funcionando corretamente!"
  echo "📥 Resposta:"
  echo "$RESPONSE_BODY" | jq . 2>/dev/null || echo "$RESPONSE_BODY"
elif [ "$HTTP_CODE" -eq 401 ]; then
  echo "❌ Erro 401: Não autorizado"
  echo "💡 O usuário precisa estar logado para testar o onboarding"
  echo "📥 Resposta:"
  echo "$RESPONSE_BODY" | jq . 2>/dev/null || echo "$RESPONSE_BODY"
elif [ "$HTTP_CODE" -eq 400 ]; then
  echo "❌ Erro 400: Dados inválidos"
  echo "📥 Resposta:"
  echo "$RESPONSE_BODY" | jq . 2>/dev/null || echo "$RESPONSE_BODY"
elif [ "$HTTP_CODE" -eq 500 ]; then
  echo "❌ Erro 500: Erro interno do servidor"
  echo "📥 Resposta:"
  echo "$RESPONSE_BODY" | jq . 2>/dev/null || echo "$RESPONSE_BODY"
else
  echo "❌ Erro inesperado: $HTTP_CODE"
  echo "📥 Resposta:"
  echo "$RESPONSE_BODY" | jq . 2>/dev/null || echo "$RESPONSE_BODY"
fi

echo ""
echo "🔍 Para testar com usuário logado:"
echo "1. Acesse http://localhost:3000"
echo "2. Faça login"
echo "3. Acesse /onboarding"
echo "4. Complete o fluxo até a última etapa"
