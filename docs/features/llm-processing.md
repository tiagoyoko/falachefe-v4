# Processamento de Mensagens com LLM

## Visão Geral

Este documento descreve a implementação do sistema de processamento de mensagens usando Large Language Models (LLM) no projeto Fala Chefe!. O sistema permite que usuários interajam com agentes de IA especializados em diferentes áreas de negócio através de uma interface conversacional inteligente.

## Arquitetura

### Componentes Principais

1. **LLMService** (`/src/lib/llm-service.ts`)

   - Serviço principal para processamento de mensagens com LLM
   - Gerencia contexto do usuário e geração de respostas
   - Suporte a diferentes tipos de comandos de negócio

2. **API Routes**

   - `/api/agent` - Processamento geral de mensagens
   - `/api/agent/business` - Comandos especializados de negócio

3. **Hook React** (`/src/hooks/use-llm-agent.ts`)

   - Interface React para interação com o serviço LLM
   - Gerenciamento de estado e tratamento de erros

4. **Componente de Interface** (`/src/components/chat/llm-chat-interface.tsx`)
   - Interface de chat completa com suporte a diferentes modos
   - Ações sugeridas e insights proativos

## Funcionalidades

### 1. Processamento Inteligente de Mensagens

- **Contexto do Usuário**: O sistema busca automaticamente informações relevantes do usuário (transações recentes, categorias, saldo)
- **Respostas Personalizadas**: Gera respostas baseadas no contexto específico do negócio do usuário
- **Suporte a Markdown**: Respostas formatadas com suporte completo a Markdown

### 2. Comandos Especializados

O sistema suporta diferentes tipos de comandos:

- **Financeiro**: Foco em gestão financeira, fluxo de caixa, análise de custos
- **Marketing**: Estratégias de marketing, análise de clientes, campanhas
- **Vendas**: Técnicas de vendas, prospecção, negociação
- **Geral**: Conselhos gerais de negócios e gestão empresarial

### 3. Insights Proativos

- **Análise Automática**: Gera insights baseados nos dados do usuário
- **Sugestões de Ações**: Oferece ações específicas que o usuário pode executar
- **Alertas Inteligentes**: Identifica oportunidades e riscos no negócio

### 4. Histórico e Persistência

- **Armazenamento de Conversas**: Todas as interações são salvas no banco de dados
- **Metadados**: Informações adicionais sobre comandos e respostas
- **Rastreabilidade**: Histórico completo para análise e melhoria

## Como Usar

### 1. Interface Web

```tsx
import { LLMChatInterface } from "@/components/chat/llm-chat-interface";

function ChatPage() {
  return (
    <LLMChatInterface
      userId={session.user.id}
      initialMessage="Olá! Como posso ajudar seu negócio hoje?"
    />
  );
}
```

### 2. Hook React

```tsx
import { useLLMAgent } from "@/hooks/use-llm-agent";

function MyComponent() {
  const { sendMessage, sendBusinessCommand, isLoading } = useLLMAgent({
    userId: "user-id",
    onSuccess: (response) => console.log(response),
    onError: (error) => console.error(error),
  });

  const handleSendMessage = async () => {
    await sendMessage("Preciso de ajuda com meu fluxo de caixa");
  };

  const handleBusinessCommand = async () => {
    await sendBusinessCommand("Como posso aumentar minhas vendas?", "sales");
  };
}
```

### 3. API Direta

```javascript
// Envio de mensagem geral
const response = await fetch("/api/agent", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    userId: "user-id",
    command: "Preciso de ajuda com meu negócio",
  }),
});

// Comando especializado
const businessResponse = await fetch("/api/agent/business", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    userId: "user-id",
    command: "Como posso melhorar meu marketing?",
    commandType: "marketing",
  }),
});

// Insights proativos
const insights = await fetch("/api/agent?userId=user-id&type=insights");
```

## Configuração

### Variáveis de Ambiente

```env
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini
```

### Modelos Suportados

- `gpt-4o-mini` (padrão)
- `gpt-4o`
- `gpt-4-turbo`
- Qualquer modelo compatível com OpenAI API

## Estrutura de Resposta

```typescript
interface LLMResponse {
  success: boolean;
  message: string;
  action?: string;
  suggestedActions?: Array<{
    action: string;
    description: string;
    params: Record<string, unknown>;
  }>;
  metadata?: Record<string, unknown>;
}
```

## Exemplos de Uso

### 1. Consulta Financeira

**Entrada**: "Qual é meu saldo atual?"

**Resposta**:

```markdown
📊 **Seu Saldo Atual**

Baseado nas suas transações registradas, seu saldo atual é de **R$ 2.450,00**.

**Resumo dos últimos 30 dias:**

- Receitas: R$ 5.200,00
- Despesas: R$ 2.750,00
- Saldo: R$ 2.450,00

**Ações sugeridas:**

- Analisar categorias de maior gasto
- Criar reserva de emergência
- Planejar investimentos
```

### 2. Consulta de Marketing

**Entrada**: "Como posso aumentar minhas vendas?"

**Resposta**:

```markdown
🚀 **Estratégias para Aumentar Vendas**

Com base no seu perfil de negócio, aqui estão algumas estratégias:

**1. Marketing Digital**

- Criar presença nas redes sociais
- Implementar email marketing
- Otimizar para mecanismos de busca

**2. Relacionamento com Clientes**

- Programa de fidelidade
- Follow-up pós-venda
- Coleta de depoimentos

**3. Expansão de Produtos/Serviços**

- Análise de demanda
- Novos nichos de mercado
- Parcerias estratégicas
```

## Tratamento de Erros

O sistema inclui tratamento robusto de erros:

- **Timeout de API**: Retry automático com fallback
- **Limite de Tokens**: Truncamento inteligente de contexto
- **Erros de Validação**: Mensagens claras para o usuário
- **Fallback Local**: Respostas pré-definidas em caso de falha

## Monitoramento e Logs

- **Logs de Conversação**: Todas as interações são logadas
- **Métricas de Performance**: Tempo de resposta e taxa de sucesso
- **Análise de Uso**: Padrões de comandos e respostas
- **Alertas**: Notificações para falhas críticas

## Segurança

- **Validação de Usuário**: Verificação de autenticação em todas as requisições
- **Sanitização de Input**: Limpeza de dados de entrada
- **Rate Limiting**: Proteção contra abuso
- **Logs de Auditoria**: Rastreamento de todas as ações

## Futuras Melhorias

1. **Cache Inteligente**: Cache de respostas frequentes
2. **Aprendizado Contínuo**: Melhoria baseada no feedback
3. **Integração com WhatsApp**: API nativa do WhatsApp
4. **Análise de Sentimento**: Detecção de humor e intenção
5. **Multimodal**: Suporte a imagens e áudio
6. **Agentes Especializados**: Agentes dedicados por área de negócio

## Troubleshooting

### Problemas Comuns

1. **Resposta Lenta**

   - Verificar conectividade com OpenAI
   - Reduzir tamanho do contexto
   - Implementar cache

2. **Respostas Irrelevantes**

   - Verificar prompt do sistema
   - Ajustar temperatura do modelo
   - Melhorar contexto do usuário

3. **Erros de Autenticação**
   - Verificar OPENAI_API_KEY
   - Confirmar limites da API
   - Validar formato da chave

### Logs Úteis

```bash
# Verificar logs do servidor
npm run dev

# Monitorar requisições
tail -f logs/api.log

# Verificar erros
grep "ERROR" logs/application.log
```
