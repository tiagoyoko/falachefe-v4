# System Patterns — FalaChefe v4

## Padrões Arquiteturais

### 1. Agent Squad Pattern
**Descrição**: Sistema de agentes especializados coordenados por um orquestrador central.

**Implementação**:
```typescript
// Orquestrador central
class AgentOrchestrator {
  private agents: Map<string, Agent> = new Map();
  
  async processMessage(message: string, context: UserContext): Promise<Response> {
    const classification = await this.classifier.classify(message, context);
    const agent = this.agents.get(classification.agentType);
    return await agent.process(message, context);
  }
}

// Agentes especializados
class LeoAgent extends Agent {
  // Especializado em finanças
}

class MaxAgent extends Agent {
  // Especializado em marketing
}

class LiaAgent extends Agent {
  // Especializado em vendas
}
```

**Vantagens**:
- Especialização por domínio
- Escalabilidade horizontal
- Manutenibilidade
- Testabilidade individual

### 2. Multi-Layer Classification Pattern
**Descrição**: Sistema de classificação em múltiplas camadas para roteamento inteligente.

**Camadas**:
1. **Intenção**: O que o usuário quer fazer
2. **Sub-intenção**: Detalhamento da intenção
3. **Urgência**: Prioridade da mensagem
4. **Contexto**: Situação específica do negócio

**Implementação**:
```typescript
interface ClassificationResult {
  intention: string;
  subIntention: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  context: BusinessContext;
  confidence: number;
  agentType: 'leo' | 'max' | 'lia' | 'orchestrator';
}
```

### 3. Storage Pattern com Drizzle
**Descrição**: Mapeamento de dados conversacionais usando Drizzle ORM.

**Schema**:
```typescript
// conversationSessions
export const conversationSessions = pgTable('conversationSessions', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  agentType: text('agentType').notNull(),
  status: text('status').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

// conversationMessages
export const conversationMessages = pgTable('conversationMessages', {
  id: text('id').primaryKey(),
  sessionId: text('sessionId').notNull().references(() => conversationSessions.id),
  role: text('role').notNull(), // 'user' | 'assistant'
  content: text('content').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
});
```

### 4. Knowledge Retrieval Pattern
**Descrição**: Sistema de recuperação de conhecimento personalizado por agente.

**Implementação**:
```typescript
class LeoKnowledgeRetriever extends KnowledgeRetriever {
  async retrieve(context: UserContext, query: string): Promise<Knowledge[]> {
    // Busca específica para contexto financeiro
    return await this.searchFinancialKnowledge(context, query);
  }
}
```

## Padrões de Integração

### 1. WhatsApp Integration Pattern
**Descrição**: Integração robusta com Evolution API para comunicação WhatsApp.

**Fluxo**:
```
WhatsApp → Evolution API → Webhook → Orquestrador → Agente → Resposta → Evolution API → WhatsApp
```

**Implementação**:
```typescript
// Webhook handler
app.post('/webhook/whatsapp', async (req, res) => {
  const message = req.body;
  const response = await orchestrator.processMessage(message.text, message.context);
  await uazapiService.sendMessage(message.chatId, response);
});
```

### 2. UAZAPI Service Pattern
**Descrição**: Serviço centralizado para comunicação com Evolution API.

**Funcionalidades**:
- Envio de mensagens
- Recebimento de webhooks
- Gerenciamento de sessões
- Tratamento de erros

### 3. Flowise Integration Pattern
**Descrição**: Integração com Flowise para lógica de agentes.

**Uso**:
- Prompts personalizados
- Fluxos de conversação
- Lógica de negócio complexa
- Integração com APIs externas

## Padrões de Dados

### 1. User Context Pattern
**Descrição**: Contexto persistente do usuário para personalização.

**Estrutura**:
```typescript
interface UserContext {
  userId: string;
  businessProfile: BusinessProfile;
  preferences: UserPreferences;
  sessionHistory: SessionHistory[];
  financialData: FinancialData;
}
```

### 2. Business Profile Pattern
**Descrição**: Perfil do negócio para personalização de agentes.

**Campos**:
- Setor de atuação
- Tamanho da empresa
- Objetivos de negócio
- Preferências de comunicação
- Dados financeiros

### 3. Session Management Pattern
**Descrição**: Gerenciamento de sessões conversacionais.

**Funcionalidades**:
- Criação de sessões
- Persistência de contexto
- Expiração automática
- Recuperação de sessões

## Padrões de Performance

### 1. Caching Pattern
**Descrição**: Cache inteligente para otimização de performance.

**Estratégias**:
- Cache de classificações
- Cache de respostas frequentes
- Cache de contexto de usuário
- Cache de conhecimento

### 2. Fallback Pattern
**Descrição**: Sistema de fallback para garantir disponibilidade.

**Níveis**:
1. **Agente Específico**: Resposta do agente especializado
2. **Orquestrador**: Resposta genérica do orquestrador
3. **Sistema**: Resposta de emergência

### 3. Rate Limiting Pattern
**Descrição**: Controle de taxa para evitar sobrecarga.

**Implementação**:
- Limite por usuário
- Limite por agente
- Limite global
- Backoff exponencial

## Padrões de Segurança

### 1. Authentication Pattern
**Descrição**: Autenticação robusta via Supabase.

**Fluxo**:
```
Login → Supabase Auth → JWT Token → Validação → Acesso
```

### 2. Authorization Pattern
**Descrição**: Controle de acesso baseado em roles.

**Níveis**:
- **User**: Acesso básico aos agentes
- **Admin**: Acesso completo ao sistema
- **System**: Acesso interno aos serviços

### 3. Data Protection Pattern
**Descrição**: Proteção de dados sensíveis.

**Estratégias**:
- Criptografia em trânsito
- Criptografia em repouso
- RLS (Row Level Security)
- Anonimização de dados

## Padrões de Monitoramento

### 1. Metrics Pattern
**Descrição**: Coleta de métricas para observabilidade.

**Métricas**:
- Performance de agentes
- Taxa de classificação
- Tempo de resposta
- Taxa de erro

### 2. Logging Pattern
**Descrição**: Sistema de logs estruturados.

**Níveis**:
- **DEBUG**: Informações detalhadas
- **INFO**: Informações gerais
- **WARN**: Avisos importantes
- **ERROR**: Erros que precisam atenção

### 3. Health Check Pattern
**Descrição**: Verificação de saúde dos serviços.

**Endpoints**:
- `/health`: Status geral
- `/health/agents`: Status dos agentes
- `/health/database`: Status do banco
- `/health/external`: Status de APIs externas

## Padrões de Testes

### 1. Unit Testing Pattern
**Descrição**: Testes unitários para cada componente.

**Cobertura**:
- Agentes individuais
- Classificador
- Serviços de integração
- Utilitários

### 2. Integration Testing Pattern
**Descrição**: Testes de integração entre componentes.

**Cenários**:
- Fluxo completo de mensagem
- Integração com WhatsApp
- Integração com banco de dados
- Integração com Flowise

### 3. E2E Testing Pattern
**Descrição**: Testes end-to-end do sistema completo.

**Fluxos**:
- Onboarding completo
- Interação com agentes
- Sistema de lembretes
- Relatórios financeiros

## Padrões de Deploy

### 1. Container Pattern
**Descrição**: Containerização com Docker.

**Estrutura**:
- Dockerfile para aplicação
- docker-compose.yml para desenvolvimento
- Docker images para produção

### 2. Environment Pattern
**Descrição**: Gerenciamento de ambientes.

**Ambientes**:
- **Development**: Desenvolvimento local
- **Staging**: Testes de integração
- **Production**: Ambiente de produção

### 3. CI/CD Pattern
**Descrição**: Pipeline de integração e deploy contínuo.

**Estágios**:
- Build e testes
- Deploy para staging
- Testes de integração
- Deploy para produção

## Padrões de Escalabilidade

### 1. Horizontal Scaling Pattern
**Descrição**: Escalabilidade horizontal de agentes.

**Estratégia**:
- Múltiplas instâncias de agentes
- Load balancing
- Distribuição de carga
- Auto-scaling

### 2. Database Scaling Pattern
**Descrição**: Escalabilidade do banco de dados.

**Estratégias**:
- Read replicas
- Connection pooling
- Query optimization
- Indexing strategy

### 3. Caching Strategy Pattern
**Descrição**: Estratégia de cache para performance.

**Níveis**:
- **L1**: Cache em memória
- **L2**: Cache distribuído (Redis)
- **L3**: Cache de banco de dados

---

**Última atualização**: 29/01/2025  
**Versão**: 1.0  
**Status**: Em implementação
