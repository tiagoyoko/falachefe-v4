Guia para implementar o Agent Squad sem AWS com agentes modulares e memória híbrida

Visão geral

Este guia descreve como implantar o Agent Squad no projeto falachefe‑v4 em um ambiente sem AWS, utilizando somente modelos da OpenAI ou Anthropic. O objetivo é orquestrar um squad de agentes de IA especializados que atendam usuários via chat web e WhatsApp, mantendo contexto de curto prazo (memória quente) e longo prazo (memória semântica), permitindo ativação/desativação de agentes pelo administrador e fornecendo observabilidade via LangSmith.

1 Pré‑requisitos e dependências
	1.	Ambiente de desenvolvimento
	•	Certifique‑se de ter Node.js e npm instalados para o backend em TypeScript/Next.js. Caso use scripts auxiliares em Python (por exemplo, para geração de embeddings ou RAG), instale Python 3.11+.
	•	Nenhum serviço da AWS será utilizado; portanto, não é necessário configurar AWS CLI ou credenciais.
	2.	Instalação da biblioteca Agent Squad
	•	Instale a biblioteca principal via npm:
	npm install agent-squad

	•	Para scripts em Python, instale as dependências específicas do provedor escolhido. Por exemplo, para usar agentes OpenAI e Anthropic:
	pip install "agent-squad[openai]"  # inclui classes para OpenAI
pip install "agent-squad[anthropic]"  # inclui classes para Anthropic

	•	Os pacotes extras fornecem classes OpenAIAgent e AnthropicAgent com suporte a múltiplos modelos, opções de streaming e configurações de inferência ￼ ￼.

	3.	Instalação do LangSmith
	•	Para observabilidade, instale a SDK do LangSmith em Python e a wrapper para o provedor LLM:
	pip install -U langsmith openai  # ou anthropic
pip install "langsmith[otel]"

	•	Em TypeScript/Node, utilize a SDK JS/TS conforme a documentação da LangChain; ela oferece funções wrapOpenAI e wrapAnthropic para instrumentar chamadas.

2 Orquestrador e armazenamento personalizado
	1.	Criar o orquestrador
	•	Importe AgentSquad e instancie‑o com um objeto de configuração que habilite logs de agente, logs do classificador e limites de mensagens:
	import { AgentSquad, AgentSquadConfig } from 'agent-squad';
const orchestrator = new AgentSquad({
  config: {
    LOG_AGENT_CHAT: true,
    LOG_CLASSIFIER_CHAT: true,
    LOG_EXECUTION_TIMES: true,
    MAX_RETRIES: 3,
    MAX_MESSAGE_PAIRS_PER_AGENT: 10,
    USE_DEFAULT_AGENT_IF_NONE_IDENTIFIED: true
  }
});

	•	Esses parâmetros correspondem às opções de configuração do Agent Squad: controle de logs, tentativas de reclassificação e política de fallback ￼.

	2.	Implementar armazenamento de conversas
	•	O Agent Squad identifica cada conversa por userId, sessionId e agentId ￼. Para garantir persistência fora da AWS, crie uma classe CustomStorage que implemente a interface ConversationStorage e persista dados em dois níveis:
	•	Memória quente (curto prazo): use Upstash Redis para armazenar as últimas N mensagens por sessão (LPUSH/LTRIM) com TTL (ex.: 24 horas). Esta camada fornece contexto rápido para o classificador e agentes.
	•	Memória semântica (longo prazo): utilize Supabase (PostgreSQL) com a extensão pgvector para salvar cada mensagem e seu embedding. Crie tabelas sessions, messages e memories (com coluna embedding vector(1536)), permitindo buscas por similaridade e auditoria.
	•	No método saveConversation, escreva cada turno nas duas camadas; no método getConversation, recupere as últimas mensagens do Redis e, se necessário, faça consultas semânticas no Postgres para complementar o contexto.
	•	Passe a instância do CustomStorage no storage do orquestrador:
	const orchestrator = new AgentSquad({ config: { ... }, storage: new CustomStorage() });

	3.	Persistir configuração de agentes
	•	Crie uma tabela agents no Supabase com colunas: id (uuid), name, description, provider (openai/anthropic), model, streaming, active (booleano) e parâmetros de inferência.
	•	Desenvolva uma função loadAgents() que consulta essa tabela e registra apenas os agentes com active = true. Assim, administradores podem ativar ou desativar agentes via painel de administração sem reiniciar o serviço.

3 Definir e carregar agentes OpenAI/Anthropic
	1.	Agentes OpenAI
	•	O OpenAIAgent integra‑se à API de chat da OpenAI e suporta vários modelos (GPT‑4, GPT‑3.5, etc.), streaming de tokens, configuração de temperatura, número máximo de tokens e system prompts personalizados ￼. Campos obrigatórios: name, description e autenticação (apiKey ou client) ￼.
	•	Exemplo de criação:
	import { OpenAIAgent } from 'agent-squad';
const financeAgent = new OpenAIAgent({
  name: 'Financeiro',
  description: 'Assistente para questões financeiras e contábeis',
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4o-mini',
  streaming: true,
  inferenceConfig: { maxTokens: 1000, temperature: 0.2 }
});
orchestrator.addAgent(financeAgent);

	2.	Agentes Anthropic
	•	O AnthropicAgent utiliza a API da Anthropic (Claude) e oferece recursos similares: escolha de modelo (por exemplo, claude-3-sonnet), resposta em streaming, personalização de prompts e integração com retrievers ￼. Requer name, description e apiKey ou client ￼.
	•	Exemplo:
	import { AnthropicAgent } from 'agent-squad';
const marketingAgent = new AnthropicAgent({
  name: 'Marketing',
  description: 'Assistente para campanhas e anúncios',
  apiKey: process.env.ANTHROPIC_API_KEY,
  modelId: 'claude-3-sonnet',
  streaming: false,
  inferenceConfig: { maxTokens: 800, temperature: 0.3 }
});
orchestrator.addAgent(marketingAgent);

	3.	Classificador e roteamento
	•	Escolha um classificador compatível com os agentes, como OpenAIClassifier ou AnthropicClassifier. Ele analisa a mensagem do usuário e decide qual agente responderá ￼.
	•	Se precisar de um roteamento mais sofisticado, implemente um classificador personalizado que use heurísticas, palavras‑chave ou embeddings para mapear mensagens a agentes. Registre‑o no orquestrador via o campo classifier.
	4.	Carregar agentes de forma modular
	•	Ao iniciar a aplicação, execute loadAgents() para consultar a tabela agents e criar instâncias (OpenAIAgent ou AnthropicAgent) apenas para as entradas com active = true.
	•	Forneça rotas de API para que administradores atualizem o status active ou parâmetros (model, temperature, streaming), permitindo ativar/desativar agentes e ajustar comportamentos sem redeploy.
	5.	Ferramentas e retrievers opcionais
	•	Utilize AgentTool e AgentTools para adicionar funções personalizadas (consultar CRM, gerar relatórios, enviar e‑mails). Cada ferramenta define o esquema de entrada e a função a executar, permitindo que agentes invocam ações além de respostas textuais.
	•	Para memória semântica, implemente um retriever que consulta a tabela memories via pgvector e fornece documentos relevantes ao modelo; informe‑o no parâmetro retriever do agente para enriquecer respostas.

4 Memória híbrida e recuperação de contexto
	1.	Estrutura de dados
	•	Redis (Upstash): armazene as últimas N mensagens por sessionId em uma lista (LPUSH), limite o comprimento com LTRIM e defina TTL para expirar conversas antigas. Esta camada constitui a memória quente.
	•	Supabase (Postgres + pgvector): crie tabelas sessions, messages e memories. Em memories, salve o texto e o embedding de cada mensagem; os embeddings podem ser gerados assíncronamente usando a API da OpenAI ou Anthropic. Essa camada é a memória semântica, permitindo busca por similaridade de longo prazo.
	•	Identifique cada registro por session_id, user_id, agent_id e timestamp para manter o histórico ￼.
	2.	Fluxo de recuperação
	•	Ao receber uma mensagem: (1) recupere as últimas mensagens da memória quente; (2) opcionalmente, busque os k documentos mais similares no Postgres via pgvector para enriquecer o contexto; (3) forneça esse contexto ao classificador ou ao campo messages ao chamar routeRequest().
	•	Após o agente responder, salve a nova pergunta e a resposta tanto na memória quente quanto na semântica. Geração de embeddings pode ser feita em background para não impactar a latência.
	3.	Política de expiração e tamanho
	•	Defina o tamanho máximo da lista (por exemplo, 20 pares de mensagem/resposta) e TTL (12–24 horas) no Redis para equilibrar custo e contexto. No Postgres, mantenha histórico completo ou aplique retenção (ex.: 90 dias) conforme requisitos de privacidade.

5 Observabilidade com LangSmith
	1.	Configurar variáveis de ambiente
	•	Crie uma conta no LangSmith e gere uma API Key. Defina as variáveis:
	export LANGSMITH_TRACING=true
export LANGSMITH_API_KEY=<sua-langsmith-key>
export OPENAI_API_KEY=<sua-openai-key>
# ou
export ANTHROPIC_API_KEY=<sua-anthropic-key>
export LANGSMITH_WORKSPACE_ID=<workspace-id-opcional>

	•	A documentação recomenda habilitar LANGSMITH_TRACING e definir as chaves do provedor de LLM e da LangSmith para que o exportador OpenTelemetry envie dados para o serviço.

	2.	Instrumentar chamadas LLM
	•	Em Python, use os wrappers fornecidos pelo LangSmith. Exemplo com OpenAI:
	from openai import OpenAI
from langsmith.wrappers import wrap_openai
client = wrap_openai(OpenAI(api_key=os.environ['OPENAI_API_KEY']))  # rastreia chamadas
# use client.chat.completions.create(...) normalmente

	•	Para Anthropic, utilize wrap_anthropic. Em TypeScript/Node, importe wrapOpenAI ou wrapAnthropic da SDK LangSmith.
	•	Esses wrappers registram cada chamada LLM como um run em uma trace no LangSmith.

	3.	Rastrear funções de alto nível
	•	Aplique o decorador @traceable (Python) ou a função equivalente em TS para rastrear funções complexas como o endpoint /chat. Isso gera uma trace abrangente contendo todas as sub‑chamadas, incluindo consultas ao Redis/Postgres e execução de ferramentas.
	4.	Visualização e alertas
	•	Após enviar mensagens, acesse o dashboard do LangSmith para visualizar as traces. Cada run mostrará inputs, outputs, latência e custo, permitindo diagnosticar problemas e otimizar prompts. Configure alertas para latência ou erros.

6 Integração com chat web e WhatsApp
	1.	Chat web
	•	Implemente um endpoint POST /api/chat que receba sessionId, userId, message e stream (booleano). Consulte a memória via CustomStorage e chame orchestrator.routeRequest(message, userId, sessionId, { streamResponse: stream }).
	•	Se stream = true, itere sobre o campo output da resposta e envie tokens ao cliente via Server‑Sent Events. Caso contrário, aguarde a resposta completa e retorne como JSON.
	•	Após enviar a resposta, grave a pergunta e a resposta nas memórias quente e semântica.
	2.	WhatsApp
	•	Receba mensagens via webhook do provedor (por exemplo, Evolution API ou UAZAPI). Defina sessionId = 'wa:' + numeroTelefone e userId = numeroTelefone. Encaminhe a mensagem ao endpoint /api/chat e envie a resposta retornada ao usuário.
	•	O WhatsApp não suporta streaming; portanto, defina stream=false no roteador e aguarde a resposta completa.

7 Administração e observabilidade de agentes
	1.	Painel administrativo
	•	Construa uma interface (ex.: página Next.js) para listar os registros da tabela agents. Permita aos administradores ativar/desativar agentes (alterando o campo active) e ajustar parâmetros como model, temperature, maxTokens e streaming.
	•	Ao modificar dados, chame loadAgents() para recarregar o conjunto de agentes no orquestrador sem reiniciar o servidor.
	2.	Dashboards de métricas
	•	Use o LangSmith para monitorar métricas de cada agente: tempo médio de resposta, número de consultas, custos e erros. Para dados complementares (por exemplo, contagem de mensagens, uso de ferramentas), registre logs em Supabase ou serviço de monitoramento e crie dashboards.
	•	Combine esses dados para informar decisões de ativação/desativação e otimização de agentes.

Conclusão

Este plano detalha a implantação do Agent Squad em uma infraestrutura sem AWS, utilizando OpenAI e Anthropic como provedores de LLM. Ao implementar armazenamento híbrido (Upstash Redis + Supabase/Postgres com pgvector), configurar agentes modulares e instrumentar a aplicação com LangSmith, o projeto falachefe‑v4 poderá orquestrar múltiplos agentes especializados com contexto persistente, gerenciável por administradores e observável em tempo real. O framework permite integrar ferramentas e retrievers conforme a necessidade, mantendo flexibilidade e extensibilidade para futuras evoluções ￼ ￼.