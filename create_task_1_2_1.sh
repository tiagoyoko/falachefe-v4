#!/bin/bash
curl -X POST -H "Authorization: Bearer $CLICKUP_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"1.2.1 - Auditoria Sistema Classificação Multi-Camada\",
    \"description\": \"# Objetivo\\nAnalisar implementação atual do MultiLayerClassifier e identificar gaps.\\n\\n## Tasks\\n- [ ] Revisar src/lib/orchestrator/multi-layer-classifier.ts\\n- [ ] Documentar problemas de integração com orquestrador\\n- [ ] Validar schema de classificação 4-camadas\\n- [ ] Identificar oportunidades de otimização\\n\\n## Critérios de Aceite\\n- [ ] Documentação completa do estado atual\\n- [ ] Lista de problemas identificados\\n- [ ] Plano de correções priorizado\",
    \"priority\": 2,
    \"due_date\": $DUE_DATE_1,
    \"start_date\": $START_DATE,
    \"tags\": [\"classification\", \"audit\", \"phase-1\"]
  }" \
  "https://api.clickup.com/api/v2/list/$LIST_ID/task"
