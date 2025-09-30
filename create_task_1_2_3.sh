#!/bin/bash
curl -X POST -H "Authorization: Bearer $CLICKUP_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"1.2.3 - Implementar Métricas de Classificação\",
    \"description\": \"# Objetivo\\nImplementar coleta e visualização de métricas de classificação\\n\\n## Tasks\\n- [ ] Criar estrutura de coleta de estatísticas\\n- [ ] Implementar endpoint /api/metrics/classification\\n- [ ] Adicionar logging de classificações\\n- [ ] Criar dashboard básico para métricas\\n\\n## Critérios de Aceite\\n- [ ] Métricas sendo coletadas automaticamente\\n- [ ] Endpoint de métricas funcionando\\n- [ ] Dashboard básico implementado\",
    \"priority\": 3,
    \"due_date\": $DUE_DATE_3,
    \"start_date\": $DUE_DATE_2,
    \"tags\": [\"metrics\", \"monitoring\", \"phase-1\"]
  }" \
  "https://api.clickup.com/api/v2/list/$LIST_ID/task"
