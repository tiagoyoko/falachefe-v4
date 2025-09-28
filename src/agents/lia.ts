import { Agent, AgentResponse } from "./types";
import { agentProfileService } from "@/lib/agent-profile-service";
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
  async handle({ userId, message }): Promise<AgentResponse> {
    try {
      // Obtém contexto de conversa e perfil do usuário
      const context = await agentProfileService.getConversationContext(userId, "lia");
      
      // Salva mensagem do usuário
      await agentProfileService.saveMessage(context.sessionId, "user", message);

      // Constrói contexto da conversa
      const conversationHistory = context.recentMessages
        .slice(-6) // Últimas 6 mensagens
        .map(msg => `${msg.role === "user" ? "Usuário" : "Lia"}: ${msg.content}`)
        .join("\n");

      // Constrói contexto de negócio
      const businessContext = context.businessContext;
      const businessInfo = businessContext ? `
Contexto do negócio:
- Indústria: ${businessContext.industry || "Não informado"}
- Tamanho: ${businessContext.businessSize || "micro"}
- Faturamento mensal: ${businessContext.monthlyRevenue || "Não informado"}
- Funcionários: ${businessContext.employeeCount || "Não informado"}
- Objetivos principais: ${businessContext.mainGoals?.join(", ") || "Não informado"}
- Principais dores: ${businessContext.painPoints?.join(", ") || "Não informado"}
` : "";

      const system = `Você é a Lia, agente de RH especializada em pequenos negócios.

${businessInfo}

Tom: ${context.userPreferences.persona?.tone || "calmo, acolhedor e humano"}
Estilo: ${context.userPreferences.preferences?.responseStyle || "friendly"}
Detalhamento: ${context.userPreferences.preferences?.detailLevel || "detailed"}

Responda em PT-BR, com empatia e mediação. Considere sempre o lado humano das situações e ofereça soluções práticas para gestão de pessoas.

Histórico da conversa:
${conversationHistory}`;

      const result = await generateText({
        model: chatModel,
        system,
        prompt: message,
        temperature: 0.6,
      });

      const response = {
        success: true,
        message: result.text,
        metadata: { 
          agent: "lia",
          sessionId: context.sessionId,
          businessContext: businessContext ? true : false
        },
      };

      // Salva resposta do agente
      await agentProfileService.saveMessage(context.sessionId, "assistant", result.text, {
        businessContext: businessContext ? true : false
      });

      return response;

    } catch (error) {
      console.error("Erro no agente Lia:", error);
      return {
        success: false,
        message: "Desculpe, estou com dificuldades agora. Pode tentar novamente? Estou aqui para te ajudar.",
        metadata: { agent: "lia", error: true }
      };
    }
  },
};
