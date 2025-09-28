import { Agent, AgentResponse } from "./types";
import { llmService } from "@/lib/llm-service";
import { searchRAG as ragSearch } from "@/lib/rag";
import { agentProfileService } from "@/lib/agent-profile-service";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

const chatModel = openai(process.env.OPENAI_MODEL || "gpt-4o-mini");

function isKnowledgeQuery(message: string): boolean {
  const t = (message || "").toLowerCase();
  return /(^como\s)|(^o que\s)|(^qual\s)|(^quando\s)|(^por que\s)|(^porque\s)|relat[óo]rio|balan[çc]o|lucro|margem|demonstra[çc][aã]o|conceito/.test(
    t
  );
}

export const leo: Agent = {
  name: "leo",
  persona: {
    displayName: "Leo – Agente Financeiro",
    description:
      "Mentor experiente, organizado e confiável. Ajuda a entender números e planejar o caixa.",
    tone: "Racional, objetivo, claro e firme, mas amigável. Evita jargão e traz segurança.",
  },
  async handle({ userId, message, agent }): Promise<AgentResponse> {
    try {
      // Obtém contexto de conversa e perfil do usuário
      const context = await agentProfileService.getConversationContext(userId, "leo");
      
      // Salva mensagem do usuário
      await agentProfileService.saveMessage(context.sessionId, "user", message);

      // Constrói contexto da conversa
      const conversationHistory = context.recentMessages
        .slice(-6) // Últimas 6 mensagens
        .map(msg => `${msg.role === "user" ? "Usuário" : "Leo"}: ${msg.content}`)
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

      // Se for pergunta conceitual/explicativa, usar RAG financeiro
      if (isKnowledgeQuery(message)) {
        const chunks = await ragSearch({ userId, query: message, topK: 5 });
        const system = `Você é o Leo, agente financeiro especializado em pequenos negócios.

${businessInfo}

Tom: ${context.userPreferences.persona?.tone || "claro, firme e amigável"}
Estilo: ${context.userPreferences.preferences?.responseStyle || "friendly"}
Detalhamento: ${context.userPreferences.preferences?.detailLevel || "detailed"}

Explique conceitos financeiros de forma objetiva e prática. Sempre em PT-BR. Cite 2-3 pontos práticos aplicáveis ao negócio do usuário.

Histórico da conversa:
${conversationHistory}`;

        const contextChunks = chunks.map((c) => `- ${c.content}`).join("\n");
        const prompt = `Pergunta: ${message}\n\nBase de conhecimento:\n${contextChunks}`;
        
        const out = await generateText({
          model: chatModel,
          system,
          prompt,
          temperature: 0.5,
        });

        const response = {
          success: true,
          message: out.text,
          metadata: { 
            agent: "leo", 
            mode: "rag",
            sessionId: context.sessionId,
            businessContext: businessContext ? true : false
          },
        };

        // Salva resposta do agente
        await agentProfileService.saveMessage(context.sessionId, "assistant", out.text, {
          mode: "rag",
          businessContext: businessContext ? true : false
        });

        return response;
      }

      // Caso contrário, usar LLMService com contexto personalizado
      const enhancedMessage = `${message}\n\nContexto do negócio:${businessInfo}\nHistórico: ${conversationHistory}`;
      
      const response = await llmService.processUserMessage(
        userId,
        enhancedMessage,
        true,
        agent || "leo"
      );

      // Salva resposta do agente
      if (response.success) {
        await agentProfileService.saveMessage(context.sessionId, "assistant", response.message, {
          mode: "llm_service",
          businessContext: businessContext ? true : false
        });
      }

      return {
        ...response,
        metadata: {
          ...response.metadata,
          sessionId: context.sessionId,
          businessContext: businessContext ? true : false
        }
      };

    } catch (error) {
      console.error("Erro no agente Leo:", error);
      return {
        success: false,
        message: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.",
        metadata: { agent: "leo", error: true }
      };
    }
  },
};
