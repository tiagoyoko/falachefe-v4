import { AgentSquad } from "agent-squad";
import { OpenAIClassifier } from "agent-squad";

import { DrizzleChatStorage } from "./drizzle-storage";
import { extractAgentMessage } from "./response";
import { createLeoOpenAIAgent } from "@/agents/squad/leo-openai-agent";
import { createMaxOpenAIAgent } from "@/agents/squad/max-openai-agent";
import { createLiaOpenAIAgent } from "@/agents/squad/lia-openai-agent";

let orchestratorSingleton: AgentSquad | null = null;

export function getOrchestrator(): AgentSquad {
  if (orchestratorSingleton) return orchestratorSingleton;

  const storage = new DrizzleChatStorage();

  const classifier = new OpenAIClassifier({
    apiKey: process.env.OPENAI_API_KEY || "",
  });

  const orchestrator = new AgentSquad({
    storage,
    classifier,
    config: {
      USE_DEFAULT_AGENT_IF_NONE_IDENTIFIED: true,
      MAX_MESSAGE_PAIRS_PER_AGENT: 5,
      LOG_EXECUTION_TIMES: false,
    },
  });

  // Registrar agentes com base de conhecimento personalizada
  const leo = createLeoOpenAIAgent({});
  const max = createMaxOpenAIAgent({});
  const lia = createLiaOpenAIAgent({});

  orchestrator.addAgent(leo);
  orchestrator.addAgent(max);
  orchestrator.addAgent(lia);
  orchestrator.setDefaultAgent(max);

  orchestratorSingleton = orchestrator;
  return orchestratorSingleton;
}

/**
 * Processa uma mensagem com um agente específico
 */
export async function processMessageWithSpecificAgent(
  message: string,
  userId: string,
  sessionId: string,
  agentName: "leo" | "max" | "lia"
) {
  const orchestrator = getOrchestrator();

  // Usar o orquestrador para processar a mensagem
  const response = await orchestrator.routeRequest(message, userId, sessionId);

  // Extrair mensagem da resposta
  const messageContent = await extractAgentMessage(response);

  return {
    message: messageContent || "Resposta não disponível",
    agentName: agentName,
    success: true,
  };
}
