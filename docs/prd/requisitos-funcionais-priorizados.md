# 🔧 **4. REQUISITOS FUNCIONAIS PRIORIZADOS**

## 4.1 MUST HAVE (Fase 1 - MVP)

### **4.1.1 Orquestração de Agentes Core**
- **RF001**: Sistema deve orquestrar múltiplos agentes especializados (Leo, Max, Lia)
- **RF002**: Sistema deve rotear mensagens para o agente mais adequado baseado em classificação multi-layer
- **RF003**: Sistema deve suportar fallback para agente padrão (Max) quando nenhum especialista for identificado
- **RF004**: Sistema deve permitir configuração dinâmica de agentes (ativação/desativação via admin)

### **4.1.2 Memória Híbrida**
- **RF005**: Sistema deve manter memória quente (Upstash Redis) para contexto imediato
- **RF006**: Sistema deve manter memória semântica (PostgreSQL + pgvector) para histórico de longo prazo
- **RF007**: Sistema deve recuperar contexto relevante baseado em similaridade semântica
- **RF027**: Sistema deve implementar TTL de 24 horas para dados em Redis

### **4.1.3 Multi-Canal Básico**
- **RF009**: Sistema deve atender usuários via chat web com streaming em tempo real
- **RF010**: Sistema deve atender usuários via WhatsApp com enhanced agent routing
- **RF011**: Sistema deve manter sessões separadas por canal e usuário com sincronização

### **4.1.4 Admin Panel Básico**
- **RF017**: Interface deve listar todos os agentes configurados com status
- **RF018**: Interface deve permitir ativar/desativar agentes sem restart
- **RF020**: Interface deve mostrar status e métricas básicas em tempo real

## 4.2 SHOULD HAVE (Fase 2)

### **4.2.1 Observabilidade Completa**
- **RF021**: Sistema deve integrar com LangSmith para rastreamento completo
- **RF022**: Sistema deve registrar métricas de performance por agente
- **RF023**: Sistema deve registrar custos de API por agente e conversa
- **RF024**: Sistema deve gerar alertas para problemas de performance

### **4.2.2 Features Avançadas**
- **RF008**: Sistema deve gerar embeddings assíncronos para otimizar latência
- **RF013**: Sistema deve permitir criação de agentes OpenAI e Anthropic
- **RF014**: Sistema deve permitir configuração de parâmetros por agente (modelo, temperatura, tokens)
- **RF015**: Sistema deve permitir ativação/desativação de agentes sem reinicialização
- **RF019**: Interface deve permitir ajustar parâmetros de agentes em tempo real

## 4.3 COULD HAVE (Fase 3+)

### **4.3.1 Integrações Brasileiras**
- **RFB001**: Sistema deve implementar compliance LGPD automatizado
- **RFB002**: Sistema deve integrar com PIX e Open Banking brasileiro
- **RFB003**: Sistema deve automatizar processos do Simples Nacional
- **RFB004**: Sistema deve integrar com marketplaces brasileiros (ML, Amazon)

### **4.3.2 Automações Avançadas**
- **RFB005**: Sistema deve suportar workflows automatizados custom
- **RFB006**: Sistema deve integrar com ERPs e CRMs brasileiros
- **RFB007**: Sistema deve fornecer insights proativos baseados em dados
- **RFB008**: Sistema deve suportar multi-tenancy para resellers
