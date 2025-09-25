import {
  Agent as SquadAgent,
  AgentOptions,
} from "agent-squad/dist/agents/agent";
import { ConversationMessage, ParticipantRole } from "agent-squad/dist/types";
import { lia as LocalLia } from "@/agents/lia";

export class LiaSquadAgent extends SquadAgent {
  constructor(options: Partial<AgentOptions> = {}) {
    super({
      name: "lia",
      description: "Agente de RH e pessoas",
      saveChat: true,
      ...options,
    });
  }

  async processRequest(
    inputText: string,
    userId: string
  ): Promise<ConversationMessage> {
    const res = await LocalLia.handle({ userId, message: inputText });
    return {
      role: ParticipantRole.ASSISTANT,
      content: [{ text: res.message }],
    } as unknown as ConversationMessage;
  }
}
