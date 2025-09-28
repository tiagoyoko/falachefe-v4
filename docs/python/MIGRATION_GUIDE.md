# Guia de Migração: TypeScript para Python

## Visão Geral

Este guia explica como migrar funcionalidades do Agent Squad Framework TypeScript para a implementação Python, mantendo compatibilidade e aproveitando as funcionalidades nativas do Python.

## Diferenças Arquiteturais

### TypeScript (Existente)
```typescript
// src/lib/orchestrator/agent-squad.ts
import { AgentSquad, OpenAIClassifier } from "agent-squad";

const orchestrator = new AgentSquad({
  storage: new DrizzleChatStorage(),
  classifier: new OpenAIClassifier({ apiKey: process.env.OPENAI_API_KEY }),
  config: { USE_DEFAULT_AGENT_IF_NONE_IDENTIFIED: true }
});
```

### Python (Nova Implementação)
```python
# src/core/agent_squad_orchestrator.py
from agent_squad import AgentSquad, OpenAIClassifier
from agent_squad.storage import MemoryStorage

orchestrator = AgentSquad(
    classifier=OpenAIClassifier(api_key=config.openai_api_key),
    storage=MemoryStorage(),
    config={"USE_DEFAULT_AGENT_IF_NONE_IDENTIFIED": True}
)
```

## Migração de Agentes

### 1. Leo (Financeiro)

#### TypeScript
```typescript
// src/agents/squad/leo-openai-agent.ts
export function createLeoOpenAIAgent(params: { userId?: string }): OpenAIAgent {
  const knowledgeRetriever = new LeoKnowledgeRetriever({
    userId: params.userId,
    topK: 5,
  });

  return new OpenAIAgent({
    name: "leo",
    description: "Mentor financeiro experiente...",
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.4,
    retriever: knowledgeRetriever,
    customSystemPrompt: { /* prompt config */ }
  });
}
```

#### Python
```python
# src/core/agent_squad_orchestrator.py
def _create_leo_agent(self) -> OpenAIAgent:
    knowledge_retriever = LeoKnowledgeRetriever(self.config)
    
    agent_config = {
        "name": "leo",
        "description": "Mentor financeiro experiente...",
        "api_key": self.config.openai_api_key,
        "model": self.config.openai_model,
        "temperature": 0.4,
        "retriever": knowledge_retriever,
        "system_prompt": self._get_leo_system_prompt()
    }
    
    return OpenAIAgent(**agent_config)
```

### 2. Max (Marketing)

#### TypeScript
```typescript
// src/agents/squad/max-openai-agent.ts
export function createMaxOpenAIAgent(params: { userId?: string }): OpenAIAgent {
  const knowledgeRetriever = new MaxKnowledgeRetriever({
    userId: params.userId,
    topK: 5,
  });

  return new OpenAIAgent({
    name: "max",
    description: "Especialista em marketing e vendas...",
    temperature: 0.6,
    retriever: knowledgeRetriever,
    // ... outras configurações
  });
}
```

#### Python
```python
# src/core/agent_squad_orchestrator.py
def _create_max_agent(self) -> OpenAIAgent:
    knowledge_retriever = MaxKnowledgeRetriever(self.config)
    
    agent_config = {
        "name": "max",
        "description": "Especialista em marketing e vendas...",
        "temperature": 0.6,
        "retriever": knowledge_retriever,
        "system_prompt": self._get_max_system_prompt()
    }
    
    return OpenAIAgent(**agent_config)
```

### 3. Lia (RH)

#### TypeScript
```typescript
// src/agents/squad/lia-openai-agent.ts
export function createLiaOpenAIAgent(params: { userId?: string }): OpenAIAgent {
  const knowledgeRetriever = new LiaKnowledgeRetriever({
    userId: params.userId,
    topK: 5,
  });

  return new OpenAIAgent({
    name: "lia",
    description: "Especialista em recursos humanos...",
    temperature: 0.5,
    retriever: knowledgeRetriever,
    // ... outras configurações
  });
}
```

#### Python
```python
# src/core/agent_squad_orchestrator.py
def _create_lia_agent(self) -> OpenAIAgent:
    knowledge_retriever = LiaKnowledgeRetriever(self.config)
    
    agent_config = {
        "name": "lia",
        "description": "Especialista em recursos humanos...",
        "temperature": 0.5,
        "retriever": knowledge_retriever,
        "system_prompt": self._get_lia_system_prompt()
    }
    
    return OpenAIAgent(**agent_config)
```

## Migração de Retrievers

### TypeScript
```typescript
// src/lib/knowledge-base/knowledge-retriever.ts
export class LeoKnowledgeRetriever extends Retriever {
  async retrieve(text: string): Promise<Array<{ content: string; score: number }>> {
    // Implementação TypeScript
  }
}
```

### Python
```python
# src/core/knowledge_retrievers.py
class LeoKnowledgeRetriever(BaseKnowledgeRetriever):
    async def retrieve(self, text: str) -> List[Dict[str, Any]]:
        # Implementação Python
        results = []
        text_lower = text.lower()
        
        for key, knowledge_item in self.knowledge_base.items():
            score = self._calculate_relevance_score(text_lower, knowledge_item)
            if score > 0.3:
                results.append({
                    "content": knowledge_item.get("content", ""),
                    "score": score,
                    "source": knowledge_item.get("source", "knowledge_base"),
                    "agent": self.agent_id
                })
        
        return sorted(results, key=lambda x: x["score"], reverse=True)[:5]
```

## Migração de APIs

### Processamento de Mensagens

#### TypeScript
```typescript
// src/lib/orchestrator/agent-squad.ts
export async function processMessageWithSpecificAgent(
  message: string,
  userId: string,
  sessionId: string,
  agentName: "leo" | "max" | "lia"
) {
  const orchestrator = getOrchestrator();
  const response = await orchestrator.routeRequest(message, userId, sessionId);
  const messageContent = await extractAgentMessage(response);
  
  return {
    message: messageContent || "Resposta não disponível",
    agentName: agentName,
    success: true,
  };
}
```

#### Python
```python
# src/core/agent_squad_orchestrator.py
async def process_message_with_specific_agent(
    self, 
    message: str, 
    user_id: str, 
    session_id: str, 
    agent_name: str
) -> Dict[str, Any]:
    agent = self.agent_squad.get_agent(agent_name)
    if not agent:
        raise ValueError(f"Agente {agent_name} não encontrado")
    
    response = await agent.process_message(
        message=message,
        user_id=user_id,
        session_id=session_id
    )
    
    return {
        "message": str(response),
        "agent_name": agent_name,
        "user_id": user_id,
        "session_id": session_id,
        "timestamp": datetime.now().isoformat(),
        "success": True
    }
```

## Migração de Configurações

### TypeScript
```typescript
// Configuração via variáveis de ambiente
const config = {
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
};
```

### Python
```python
# src/utils/config.py
class Config(BaseSettings):
    openai_api_key: str = Field(..., env="OPENAI_API_KEY")
    openai_model: str = Field("gpt-4-turbo-preview", env="OPENAI_MODEL")
    supabase_url: str = Field(..., env="SUPABASE_URL")
    supabase_anon_key: str = Field(..., env="SUPABASE_ANON_KEY")
    
    class Config:
        env_file = ".env.python"
        env_file_encoding = "utf-8"
```

## Migração de Testes

### TypeScript
```typescript
// test/agent-squad.test.ts
describe('Agent Squad', () => {
  it('should process message with Leo agent', async () => {
    const result = await processMessageWithSpecificAgent(
      'Preciso de ajuda financeira',
      'user123',
      'session456',
      'leo'
    );
    
    expect(result.success).toBe(true);
    expect(result.agentName).toBe('leo');
  });
});
```

### Python
```python
# test_main.py
class TestAgentSquadOrchestrator:
    @pytest.mark.asyncio
    async def test_process_message_success(self, mock_config):
        with patch('src.core.agent_squad_orchestrator.AgentSquad'):
            orchestrator = FalaChefeAgentSquadOrchestrator(mock_config)
            
            mock_response = Mock()
            mock_response.agent_name = "leo"
            mock_response.content = "Resposta do Leo"
            
            orchestrator.agent_squad.route_request.return_value = mock_response
            
            result = await orchestrator.process_message(
                "Preciso de ajuda financeira",
                "user_123",
                "session_456"
            )
            
            assert result["success"] is True
            assert result["agent_name"] == "leo"
```

## Funcionalidades Exclusivas do Python

### 1. Análise Avançada de Dados

```python
# Análise financeira com pandas/numpy
import pandas as pd
import numpy as np

def analyze_financial_trends(data):
    df = pd.DataFrame(data)
    df['growth_rate'] = df['revenue'].pct_change()
    df['moving_avg'] = df['revenue'].rolling(window=7).mean()
    return df.to_dict('records')
```

### 2. Automação de Negócios

```python
# Agendamento de tarefas
import schedule

schedule.every().day.at("08:00").do(generate_daily_financial_report)
schedule.every().monday.at("09:00").do(analyze_marketing_campaigns)
```

### 3. Processamento de Dados em Lote

```python
# Processamento assíncrono de grandes volumes
async def process_batch_conversations(conversations):
    tasks = [process_conversation(conv) for conv in conversations]
    results = await asyncio.gather(*tasks)
    return results
```

## Estratégia de Migração

### Fase 1: Implementação Paralela
1. Implementar Agent Squad Python
2. Manter TypeScript funcionando
3. Testes de compatibilidade

### Fase 2: Migração Gradual
1. Migrar funcionalidades uma por vez
2. Comparar resultados TypeScript vs Python
3. Ajustar configurações conforme necessário

### Fase 3: Consolidação
1. Descontinuar TypeScript gradualmente
2. Migrar todas as funcionalidades
3. Otimizar performance Python

## Checklist de Migração

### Configuração
- [ ] Configurar ambiente Python
- [ ] Instalar dependências
- [ ] Configurar variáveis de ambiente
- [ ] Testar conectividade com APIs

### Agentes
- [ ] Migrar Leo (Financeiro)
- [ ] Migrar Max (Marketing)
- [ ] Migrar Lia (RH)
- [ ] Testar respostas dos agentes
- [ ] Validar base de conhecimento

### APIs
- [ ] Migrar processamento de mensagens
- [ ] Migrar classificação de intenções
- [ ] Migrar roteamento de agentes
- [ ] Testar integração com WhatsApp

### Testes
- [ ] Migrar testes unitários
- [ ] Migrar testes de integração
- [ ] Adicionar testes Python específicos
- [ ] Validar cobertura de testes

### Monitoramento
- [ ] Configurar logs Python
- [ ] Implementar health checks
- [ ] Configurar métricas
- [ ] Validar alertas

## Troubleshooting

### Problemas Comuns

1. **Diferenças de Comportamento**
   - Verificar configurações de temperatura
   - Comparar prompts de sistema
   - Validar base de conhecimento

2. **Performance**
   - Otimizar queries de banco
   - Implementar cache
   - Usar processamento assíncrono

3. **Compatibilidade**
   - Manter formato de resposta consistente
   - Validar integração com frontend
   - Testar webhooks

### Debug

```python
# Habilitar logs detalhados
import logging
logging.getLogger("falachefe").setLevel(logging.DEBUG)

# Health check detalhado
health = await falachefe.health_check()
print(json.dumps(health, indent=2))
```

## Conclusão

A migração do TypeScript para Python oferece:

- **Melhor performance** para processamento de dados
- **Funcionalidades avançadas** de análise e automação
- **Ecosystem mais rico** para IA e ML
- **Integração nativa** com ferramentas de dados

A estratégia de migração gradual garante que o sistema continue funcionando durante a transição, permitindo validação e ajustes conforme necessário.
