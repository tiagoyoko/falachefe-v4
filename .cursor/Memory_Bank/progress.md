# Progresso — Plano de Integração Agent Squad

## Milestone M1 — Fundação (Semanas 1–2) ✅ CONCLUÍDO
- ✅ T1: Adicionar dependência `agent-squad` e variáveis de ambiente
- ✅ T2: Criar `src/lib/orchestrator/agent-squad.ts` (bootstrap + config)
- ✅ T3: Implementar `DrizzleStorage` mapeando `conversationSessions`/`conversationMessages`
- ✅ T4: Criar wrappers `leo-agent.ts`, `max-agent.ts`, `lia-agent.ts`
- ✅ T5: Integrar `/api/agent` ao orquestrador
- ✅ T6: Integrar webhook UAZAPI → orquestrador → resposta
- ✅ T7: Testes de fluxo (scripts existentes + novos testes e2e do orquestrador)
- ✅ Aceite: consultas básicas respondidas via API e WhatsApp; P95 < 5s

## Milestone M2 — Especialização (Semanas 3–5) 🔄 EM ANDAMENTO
- 🔄 T8: Classificação multi-camada (intenção/sub-intenção/urgência/contexto) - **EM PROGRESSO**
- ⏳ T9: Perfil/memória por agente (financeiro, marketing, vendas) - **PENDENTE**
- ⏳ T10: Integração profunda com dados (categorias, transações, saldo) em cada agente - **PENDENTE**
- ⏳ T11: Avaliação de precisão e ajustes de prompts - **PENDENTE**
- 🎯 Aceite: contexto mantido entre conversas; respostas especializadas

## Milestone M3 — WhatsApp Avançado (Semanas 6–8)
- T12: Áudio (transcrição) e imagens (OCR) no webhook
- T13: Notificações e interface unificada de chat
- Aceite: suporte multimídia e UX consistente

## Milestone M4 — Otimização e Observabilidade (Semanas 9–10)
- T14: Cache, pooling de conexões e tuning de prompts
- T15: KPIs e dashboard (métricas por agente/classificador)
- T16: Documentação final (dev + operação)
- Aceite: P95 < 30s; dashboard operando

## Notas Operacionais
- Rollout progressivo: manter `supervisor.ts` como fallback até M1 concluído
- Testes: smoke tests em `/api/agent` e no webhook a cada entrega
- Segurança: validar payloads, rate limit por `chatId`, logs de auditoria
