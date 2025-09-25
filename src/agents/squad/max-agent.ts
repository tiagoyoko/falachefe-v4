import {
  Agent as SquadAgent,
  AgentOptions,
} from "agent-squad/dist/agents/agent";
import { ConversationMessage, ParticipantRole } from "agent-squad/dist/types";
import { max as LocalMax } from "@/agents/max";

export class MaxSquadAgent extends SquadAgent {
  constructor(options: Partial<AgentOptions> = {}) {
    super({
      name: "max",
      description: "Agente de marketing e vendas",
      saveChat: true,
      ...options,
    });
  }

  async processRequest(
    inputText: string,
    userId: string
  ): Promise<ConversationMessage> {
    const res = await LocalMax.handle({ userId, message: inputText });
    return {
      role: ParticipantRole.ASSISTANT,
      content: [{ text: res.message }],
    } as unknown as ConversationMessage;
  }
}
