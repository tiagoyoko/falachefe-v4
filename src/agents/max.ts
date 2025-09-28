import { Agent, AgentResponse } from "./types";
import { searchRAG as ragSearch } from "@/lib/rag";
import { agentProfileService } from "@/lib/agent-profile-service";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

const chatModel = openai(process.env.OPENAI_MODEL || "gpt-4o-mini");

async function searchRAG(userId: string, query: string): Promise<string[]> {
  const results = await ragSearch({ userId, query, topK: 5 });
  return results.map((r) => r.content);
}

export const max: Agent = {
  name: "max",
  persona: {
    displayName: "Max – Agente de Marketing/Vendas",
    description:
      "Jovem, entusiasmado e motivador. Gera ideias práticas para atrair clientes e vender mais.",
    tone: "Inspirador, animado e positivo. Incentiva ação com passos simples e claros.",
  },
  async handle({ userId, message }): Promise<AgentResponse> {
    try {
      // Obtém contexto de conversa e perfil do usuário
      const context = await agentProfileService.getConversationContext(userId, "max");
      
      // Salva mensagem do usuário
      await agentProfileService.saveMessage(context.sessionId, "user", message);

      // Constrói contexto da conversa
      const conversationHistory = context.recentMessages
        .slice(-6) // Últimas 6 mensagens
        .map(msg => `${msg.role === "user" ? "Usuário" : "Max"}: ${msg.content}`)
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

      // Busca conhecimento relevante
      const contextChunks = await searchRAG(userId, message);
      
      const system = `Você é o Max, agente de Marketing/Vendas especializado em pequenos negócios.

${businessInfo}

Tom: ${context.userPreferences.persona?.tone || "inspirador e motivador, jovem, claro e prático"}
Estilo: ${context.userPreferences.preferences?.responseStyle || "friendly"}
Detalhamento: ${context.userPreferences.preferences?.detailLevel || "detailed"}

Sempre em PT-BR. Dê 2 ou 3 ações objetivas e práticas que o usuário pode aplicar agora, considerando o contexto do negócio dele.

Histórico da conversa:
${conversationHistory}`;

      const prompt = `Pergunta do usuário: ${message}

Base de conhecimento (resumos):
${contextChunks.map((c) => `- ${c}`).join("\n")}`;

      const result = await generateText({
        model: chatModel,
        system,
        prompt,
        temperature: 0.8,
      });

      const text = result.text || "Bora lá! Vou te dar 2 ou 3 ações práticas para avançarmos.";

      const response = {
        success: true,
        message: text,
        metadata: { 
          agent: "max",
          sessionId: context.sessionId,
          businessContext: businessContext ? true : false
        },
      };

      // Salva resposta do agente
      await agentProfileService.saveMessage(context.sessionId, "assistant", text, {
        businessContext: businessContext ? true : false
      });

      return response;

    } catch (error) {
      console.error("Erro no agente Max:", error);
      return {
        success: false,
        message: "Eita! Deu um problema aqui. Tenta de novo que eu te ajudo!",
        metadata: { agent: "max", error: true }
      };
    }
  },
};
