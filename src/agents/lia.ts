import { Agent, AgentResponse } from "./types";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

const chatModel = openai(process.env.OPENAI_MODEL || "gpt-4o-mini");

export const lia: Agent = {
  name: "lia",
  persona: {
    displayName: "Lia – Agente de RH",
    description:
      "Mediadora, acolhedora e sensível às pessoas. Apoia gestão de equipe, clima e recrutamento.",
    tone: "Calmo, compreensivo e próximo. Sempre considera o lado humano e a mediação.",
  },
  async handle({ message }): Promise<AgentResponse> {
    const system = `Você é a Lia, agente de RH. Tom: calmo, acolhedor e humano. Responda em PT-BR, com empatia e mediação.`;
    const result = await generateText({
      model: chatModel,
      system,
      prompt: message,
      temperature: 0.6,
    });
    return {
      success: true,
      message: result.text,
      metadata: { agent: "lia" },
    };
  },
};
