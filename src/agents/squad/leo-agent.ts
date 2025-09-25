import {
  Agent as SquadAgent,
  AgentOptions,
} from "agent-squad/dist/agents/agent";
import { ConversationMessage, ParticipantRole } from "agent-squad/dist/types";
import { leo as LocalLeo } from "@/agents/leo";

export class LeoSquadAgent extends SquadAgent {
  constructor(options: Partial<AgentOptions> = {}) {
    super({
      name: "leo",
      description: "Agente financeiro (fluxo de caixa, categorias, relatórios)",
      saveChat: true,
      ...options,
    });
  }

  async processRequest(
    inputText: string,
    userId: string
  ): Promise<ConversationMessage> {
    const res = await LocalLeo.handle({ userId, message: inputText });
    return {
      role: ParticipantRole.ASSISTANT,
      content: [{ text: res.message }],
    } as unknown as ConversationMessage;
  }
}
