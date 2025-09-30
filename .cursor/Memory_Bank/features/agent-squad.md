# Agent Squad — FalaChefe v4

## Visão Geral do Agent Squad

O Agent Squad é o sistema de agentes especializados do FalaChefe v4, composto por três agentes principais que trabalham de forma coordenada para fornecer suporte completo aos micro e pequenos empresários.

## Arquitetura do Sistema

### Orquestrador Central
```typescript
class AgentOrchestrator {
  private agents: Map<string, Agent> = new Map();
  private classifier: MultiLayerClassifier;
  private storage: DrizzleStorage;
  
  async processMessage(message: string, context: UserContext): Promise<Response> {
    // 1. Classificar mensagem
    const classification = await this.classifier.classify(message, context);
    
    // 2. Selecionar agente apropriado
    const agent = this.agents.get(classification.agentType);
    
    // 3. Processar com contexto
    return await agent.process(message, context);
  }
}
```

### Sistema de Classificação Multi-Camada
```typescript
interface ClassificationResult {
  intention: string;        // O que o usuário quer fazer
  subIntention: string;     // Detalhamento da intenção
  urgency: 'low' | 'medium' | 'high' | 'critical';
  context: BusinessContext; // Situação específica do negócio
  confidence: number;       // Confiança da classificação (0-1)
  agentType: 'leo' | 'max' | 'lia' | 'orchestrator';
}
```

## Agentes Especializados

### 1. Leo - Agente Financeiro 🏦
**Especialização**: Gestão financeira e contabilidade básica

**Capacidades**:
- Registro de receitas e despesas
- Controle de contas a pagar e receber
- Relatórios financeiros simples
- Análise de fluxo de caixa
- Categorização automática de transações
- Lembretes de vencimentos

**Base de Conhecimento**:
- Princípios de contabilidade básica
- Gestão de fluxo de caixa
- Categorização de despesas
- Análise de rentabilidade
- Planejamento financeiro

**Exemplos de Interação**:
- "Quero registrar uma venda de R$ 500"
- "Qual foi meu lucro este mês?"
- "Lembre-me de pagar a conta de luz"
- "Categorize esta despesa de combustível"

### 2. Max - Agente de Marketing 📈
**Especialização**: Estratégias de marketing e vendas

**Capacidades**:
- Estratégias de vendas personalizadas
- Análise de mercado e concorrência
- Sugestões de campanhas promocionais
- Gestão de relacionamento com clientes
- Análise de performance de vendas
- Identificação de oportunidades

**Base de Conhecimento**:
- Marketing digital para pequenas empresas
- Estratégias de vendas
- Análise de concorrência
- Gestão de clientes
- Métricas de marketing

**Exemplos de Interação**:
- "Como posso aumentar minhas vendas?"
- "Que estratégia usar para o Black Friday?"
- "Analise meus concorrentes"
- "Sugira uma campanha para novos clientes"

### 3. Lia - Agente de Vendas 💼
**Especialização**: Processo de vendas e negociação

**Capacidades**:
- Acompanhamento de leads e prospects
- Técnicas de negociação
- Scripts de vendas personalizados
- Follow-up com clientes
- Análise de conversão
- Identificação de objeções

**Base de Conhecimento**:
- Processo de vendas
- Técnicas de negociação
- Gestão de leads
- Atendimento ao cliente
- Métricas de vendas

**Exemplos de Interação**:
- "Como abordar este cliente?"
- "Qual a melhor forma de fechar esta venda?"
- "Sugira um script para ligação"
- "Analise por que não fechei esta venda"

## Sistema de Memória e Contexto

### User Context
```typescript
interface UserContext {
  userId: string;
  businessProfile: BusinessProfile;
  preferences: UserPreferences;
  sessionHistory: SessionHistory[];
  financialData: FinancialData;
  conversationContext: ConversationContext;
}
```

### Business Profile
```typescript
interface BusinessProfile {
  sector: string;           // Setor de atuação
  size: 'micro' | 'small' | 'medium';
  objectives: string[];     // Objetivos de negócio
  communicationStyle: 'formal' | 'informal' | 'mixed';
  experience: 'beginner' | 'intermediate' | 'advanced';
}
```

### Session Management
```typescript
interface ConversationSession {
  id: string;
  userId: string;
  agentType: 'leo' | 'max' | 'lia';
  status: 'active' | 'paused' | 'completed';
  context: ConversationContext;
  createdAt: Date;
  updatedAt: Date;
}
```

## Integração com Dados Financeiros

### Mapeamento de Dados
```typescript
// Tabelas do banco mapeadas para o Agent Squad
const conversationSessions = pgTable('conversationSessions', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  agentType: text('agentType').notNull(),
  status: text('status').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

const conversationMessages = pgTable('conversationMessages', {
  id: text('id').primaryKey(),
  sessionId: text('sessionId').notNull(),
  role: text('role').notNull(),
  content: text('content').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
});
```

### Acesso a Dados Financeiros
- **Transações**: Histórico de receitas e despesas
- **Categorias**: Categorização de transações
- **Saldo**: Saldo atual e histórico
- **Relatórios**: Relatórios financeiros gerados

## APIs e Endpoints

### API Principal
```typescript
// POST /api/agent
{
  "message": "string",
  "userId": "string",
  "context": {
    "businessProfile": {...},
    "preferences": {...},
    "sessionHistory": [...]
  }
}
```

### API de Agente Específico
```typescript
// POST /api/agent/specific
{
  "agentType": "leo" | "max" | "lia",
  "message": "string",
  "userId": "string",
  "context": {...}
}
```

## Configuração e Inicialização

### Dependências
```json
{
  "agent-squad": "^1.0.1",
  "openai": "^4.0.0",
  "drizzle-orm": "^0.29.0"
}
```

### Variáveis de Ambiente
```env
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

### Inicialização
```typescript
// src/lib/orchestrator/agent-squad.ts
import { AgentOrchestrator } from 'agent-squad';

const orchestrator = new AgentOrchestrator({
  openaiApiKey: process.env.OPENAI_API_KEY,
  storage: new DrizzleStorage(db),
  agents: {
    leo: new LeoAgent(),
    max: new MaxAgent(),
    lia: new LiaAgent()
  }
});
```

## Métricas e Monitoramento

### Métricas de Performance
- **Tempo de Resposta**: P95 < 10s
- **Taxa de Classificação**: >90% de precisão
- **Satisfação do Usuário**: NPS > 8
- **Disponibilidade**: 99.9% uptime

### Métricas por Agente
- **Leo**: Transações processadas, relatórios gerados
- **Max**: Estratégias sugeridas, campanhas criadas
- **Lia**: Leads acompanhados, vendas fechadas

### Logs e Debugging
```typescript
// Estrutura de logs
{
  "timestamp": "2025-01-29T10:00:00Z",
  "level": "INFO",
  "agent": "leo",
  "userId": "user123",
  "message": "Transação registrada com sucesso",
  "metadata": {
    "amount": 500,
    "type": "income",
    "category": "sales"
  }
}
```

## Roadmap de Desenvolvimento

### Milestone M1 - Fundação ✅ CONCLUÍDO
- ✅ Framework Agent Squad integrado
- ✅ Orquestrador implementado
- ✅ Storage customizado com Drizzle
- ✅ Sistema de classificação ativo
- ✅ Integração com WhatsApp via UAZAPI

### Milestone M2 - Especialização ✅ CONCLUÍDO
- ✅ Sistema de classificação multi-camada
- ✅ Perfil e memória persistente por agente
- ✅ Integração profunda com dados financeiros
- ✅ Avaliação de precisão e otimização de prompts

### Milestone M3 - Integração Avançada 🔄 EM ANDAMENTO
- 🔄 Sistema de notificações inteligentes
- 🔄 Dashboard de métricas em tempo real
- 🔄 Integração com APIs externas

### Milestone M4 - Otimização e Observabilidade 📋 PLANEJADO
- 📋 Cache, pooling de conexões e tuning de prompts
- 📋 KPIs e dashboard (métricas por agente/classificador)
- 📋 Documentação final (dev + operação)

## Troubleshooting

### Problemas Comuns
1. **Classificação Incorreta**: Verificar prompts e contexto
2. **Resposta Lenta**: Otimizar prompts e cache
3. **Erro de Conexão**: Verificar APIs e banco de dados
4. **Memória Perdida**: Verificar persistência de sessão

### Debugging
```typescript
// Ativar logs detalhados
process.env.LOG_LEVEL = 'DEBUG';

// Verificar classificação
const classification = await classifier.classify(message, context);
console.log('Classification:', classification);

// Verificar contexto do agente
const agentContext = await agent.getContext(userId);
console.log('Agent Context:', agentContext);
```

---

**Última atualização**: 29/01/2025  
**Versão**: 1.0  
**Status**: ✅ M1 e M2 Concluídos | 🔄 M3 Em Andamento

