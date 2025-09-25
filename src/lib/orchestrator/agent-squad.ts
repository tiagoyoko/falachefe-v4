import { AgentSquad } from "agent-squad";
import { OpenAIClassifier } from "agent-squad";

import { DrizzleChatStorage } from "./drizzle-storage";
import { createLeoOpenAIAgent } from "@/agents/squad/leo-openai-agent";
import { MaxSquadAgent } from "@/agents/squad/max-agent";
import { LiaSquadAgent } from "@/agents/squad/lia-agent";

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

  // Registrar agentes
  const leo = createLeoOpenAIAgent({});
  const max = new MaxSquadAgent();
  const lia = new LiaSquadAgent();

  orchestrator.addAgent(leo);
  orchestrator.addAgent(max);
  orchestrator.addAgent(lia);
  orchestrator.setDefaultAgent(max);

  orchestratorSingleton = orchestrator;
  return orchestratorSingleton;
}
