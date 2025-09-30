#!/bin/bash
curl -X POST -H "Authorization: Bearer $CLICKUP_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"1.2.4 - Otimização e Validação Final\",
    \"description\": \"# Objetivo\\nOtimizar performance e validar accuracy do sistema\\n\\n## Tasks\\n- [ ] Implementar cache de classificações frequentes\\n- [ ] Otimizar prompts para melhor accuracy\\n- [ ] Criar suite de testes para classificação\\n- [ ] Validar accuracy com dataset de teste\\n\\n## Critérios de Aceite\\n- [ ] Accuracy > 85% em dataset de teste\\n- [ ] Response time < 2s para classificação\\n- [ ] Cache implementado e funcionando\\n- [ ] Testes automatizados passando\",
    \"priority\": 3,
    \"due_date\": $DUE_DATE_4,
    \"start_date\": $DUE_DATE_3,
    \"tags\": [\"optimization\", \"testing\", \"phase-1\"]
  }" \
  "https://api.clickup.com/api/v2/list/$LIST_ID/task"
