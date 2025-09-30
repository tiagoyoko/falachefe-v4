#!/bin/bash
curl -X POST -H "Authorization: Bearer $CLICKUP_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"1.2.2 - Integração MultiLayerClassifier com Orquestrador\",
    \"description\": \"# Objetivo\\nIntegrar completamente o MultiLayerClassifier no enhanced-agent-squad.ts\\n\\n## Tasks\\n- [ ] Modificar enhanced-agent-squad.ts para usar MultiLayerClassifier\\n- [ ] Implementar fallback inteligente baseado em confidence\\n- [ ] Adicionar validação antes do roteamento de agentes\\n- [ ] Testar integração end-to-end\\n\\n## Critérios de Aceite\\n- [ ] Classificação multi-camada funcionando no orquestrador\\n- [ ] Fallback baseado em confidence implementado\\n- [ ] Testes de integração passando\",
    \"priority\": 2,
    \"due_date\": $DUE_DATE_2,
    \"start_date\": $DUE_DATE_1,
    \"tags\": [\"classification\", \"integration\", \"phase-1\"]
  }" \
  "https://api.clickup.com/api/v2/list/$LIST_ID/task"
