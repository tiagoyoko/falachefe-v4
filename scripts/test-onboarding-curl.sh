#!/bin/bash

echo "🧪 Testando API de onboarding..."

# Aguardar o servidor inicializar
sleep 5

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

# Fazer a requisição
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA" \
  http://localhost:3000/api/onboarding)

# Separar resposta e código de status
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)

echo "📊 Status HTTP: $HTTP_CODE"
echo "📥 Resposta:"
echo "$RESPONSE_BODY" | jq . 2>/dev/null || echo "$RESPONSE_BODY"

if [ "$HTTP_CODE" -eq 200 ]; then
  echo "✅ API funcionando corretamente!"
else
  echo "❌ Erro na API: $HTTP_CODE"
fi
