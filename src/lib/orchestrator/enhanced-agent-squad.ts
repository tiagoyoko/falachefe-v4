import { AgentSquad, OpenAIClassifier } from "agent-squad";
import { DrizzleChatStorage } from "./drizzle-storage";
import { extractAgentMessage } from "./response";
import { createLeoOpenAIAgent } from "@/agents/squad/leo-openai-agent";
import { createMaxOpenAIAgent } from "@/agents/squad/max-openai-agent";
import { createLiaOpenAIAgent } from "@/agents/squad/lia-openai-agent";
import { MultiLayerClassifier, MultiLayerClassification } from "./multi-layer-classifier";
import { sessionManager, SessionInfo, ConversationContext } from "./session-manager";

// Interface para resposta aprimorada com metadados de classificação
export interface EnhancedAgentResponse {
  message: string;
  agentName: string;
  success: boolean;
  classification: MultiLayerClassification;
  priority: number;
  processingTime: number;
  cacheHit: boolean;
  abTestVariant?: string;
  metadata: {
    sessionId: string;
    userId: string;
    timestamp: Date;
    confidence: number;
    reasoning: string[];
  };
}

let enhancedOrchestratorSingleton: {
  orchestrator: AgentSquad;
  multiLayerClassifier: MultiLayerClassifier;
} | null = null;

export function getEnhancedOrchestrator() {
  if (enhancedOrchestratorSingleton) return enhancedOrchestratorSingleton;

  const storage = new DrizzleChatStorage();
  const multiLayerClassifier = new MultiLayerClassifier();

  // Manter o classificador OpenAI como fallback
  const fallbackClassifier = new OpenAIClassifier({
    apiKey: process.env.OPENAI_API_KEY || "",
  });

  const orchestrator = new AgentSquad({
    storage,
    classifier: fallbackClassifier,
    config: {
      USE_DEFAULT_AGENT_IF_NONE_IDENTIFIED: true,
      MAX_MESSAGE_PAIRS_PER_AGENT: 5,
      LOG_EXECUTION_TIMES: true, // Habilitar para métricas
    },
  });

  // Registrar agentes
  const leo = createLeoOpenAIAgent({});
  const max = createMaxOpenAIAgent({});
  const lia = createLiaOpenAIAgent({});

  orchestrator.addAgent(leo);
  orchestrator.addAgent(max);
  orchestrator.addAgent(lia);
  orchestrator.setDefaultAgent(max);

  enhancedOrchestratorSingleton = {
    orchestrator,
    multiLayerClassifier,
  };
  
  return enhancedOrchestratorSingleton;
}

/**
 * Processa uma mensagem com classificação multi-camada e sessões persistentes
 */
export async function processMessageWithMultiLayerClassification(
  message: string,
  userId: string,
  chatId?: string,
  conversationHistory?: string[]
): Promise<EnhancedAgentResponse> {
  const startTime = Date.now();
  
  try {
    // 1. Gerenciar sessão persistente
    const sessionInfo = await sessionManager.getOrCreateActiveSession(userId, chatId);
    const conversationContext = await sessionManager.getConversationContext(sessionInfo.sessionId);
    
    // 2. Preparar histórico para classificação
    const historyForClassification = conversationContext.recentMessages
      .slice(-5) // Últimas 5 mensagens
      .map(msg => `${msg.role}: ${msg.content}`)
      .concat(conversationHistory || []);
    
  const { orchestrator, multiLayerClassifier } = getEnhancedOrchestrator();
    
    // 3. Classificação multi-camada com contexto e métricas
    const classificationResult = await multiLayerClassifier.classify(
      message, 
      historyForClassification, 
      userId, 
      sessionInfo.sessionId
    );
    
    // 4. Processar com o agente recomendado usando sessão persistente
    const response = await orchestrator.routeRequest(message, userId, sessionInfo.sessionId);
    const messageContent = await extractAgentMessage(response);
    
    const processingTime = Date.now() - startTime;
    
    return {
      message: messageContent || "Resposta não disponível",
      agentName: classificationResult.agentId,
      success: classificationResult.success,
      classification: classificationResult.classification,
      priority: multiLayerClassifier.getPriority(classificationResult.classification),
      processingTime,
      cacheHit: classificationResult.cacheHit,
      abTestVariant: classificationResult.abTestVariant,
          metadata: {
            sessionId: sessionInfo.sessionId,
            userId,
            timestamp: new Date(),
            confidence: classificationResult.confidence,
            reasoning: classificationResult.reasoning
          },
    };
    
  } catch (error) {
    console.error('Erro no processamento com classificação multi-camada:', error);
    
    const processingTime = Date.now() - startTime;
    
    // Fallback para processamento simples com sessão temporária
    const { orchestrator } = getEnhancedOrchestrator();
    const fallbackSessionId = `${userId}_${Date.now()}`;
    const response = await orchestrator.routeRequest(message, userId, fallbackSessionId);
    const messageContent = await extractAgentMessage(response);
    
    return {
      message: messageContent || "Erro no processamento. Tente novamente.",
      agentName: "max", // Default
      success: false,
      classification: {
        primaryIntent: "geral",
        secondaryIntent: { general: "outro" },
        urgency: "media",
        conversationContext: "inicial",
        confidence: 0.3,
        reasoning: "Fallback devido a erro no processamento"
      },
      priority: 1,
      processingTime,
      cacheHit: false,
      abTestVariant: undefined,
      metadata: {
        sessionId: fallbackSessionId,
        userId,
        timestamp: new Date(),
        confidence: 0.3,
        reasoning: ["Fallback devido a erro no processamento"]
      },
    };
  }
}

/**
 * Processa mensagem com agente específico usando sessões persistentes
 */
export async function processMessageWithSpecificAgent(
  message: string,
  userId: string,
  chatId: string | undefined,
  agentName: "leo" | "max" | "lia"
): Promise<EnhancedAgentResponse> {
  const startTime = Date.now();
  
  try {
    // 1. Gerenciar sessão persistente
    const sessionInfo = await sessionManager.getOrCreateActiveSession(userId, chatId);
    const conversationContext = await sessionManager.getConversationContext(sessionInfo.sessionId);
    
    // 2. Preparar histórico para classificação
    const historyForClassification = conversationContext.recentMessages
      .slice(-5)
      .map(msg => `${msg.role}: ${msg.content}`);
    
    const { orchestrator, multiLayerClassifier } = getEnhancedOrchestrator();
    
    // 3. Classificar mesmo quando agente é específico (para métricas)
    const classification = await multiLayerClassifier.classify(message, historyForClassification);
    
    // 4. Processar com o agente específico usando sessão persistente
    const response = await orchestrator.routeRequest(message, userId, sessionInfo.sessionId);
    const messageContent = await extractAgentMessage(response);
    
    const processingTime = Date.now() - startTime;
    const priority = multiLayerClassifier.getPriority(classification.classification);
    
    return {
      message: messageContent || "Resposta não disponível",
      agentName,
      success: true,
      classification: classification.classification,
      priority,
      processingTime,
      cacheHit: classification.cacheHit,
      abTestVariant: classification.abTestVariant,
      metadata: {
        sessionId: sessionInfo.sessionId,
        userId,
        timestamp: new Date(),
        confidence: classification.confidence,
        reasoning: classification.reasoning
      },
    };
    
  } catch (error) {
    console.error('Erro no processamento com agente específico:', error);
    
    const processingTime = Date.now() - startTime;
    
    return {
      message: "Erro no processamento. Tente novamente.",
      agentName,
      success: false,
      classification: {
        primaryIntent: "geral",
        secondaryIntent: { general: "outro" },
        urgency: "media",
        conversationContext: "inicial",
        confidence: 0.3,
        reasoning: "Erro no processamento"
      },
      priority: 1,
      processingTime,
      cacheHit: false,
      abTestVariant: undefined,
      metadata: {
        sessionId: `${userId}_${Date.now()}`,
        userId,
        timestamp: new Date(),
        confidence: 0.3,
        reasoning: ["Fallback devido a erro no processamento"]
      },
    };
  }
}

/**
 * Obtém estatísticas de classificação para métricas
 */
export async function getClassificationStats(
  _userId?: string,
  _timeRange?: { start: Date; end: Date }
): Promise<{
  totalMessages: number;
  intentDistribution: Record<string, number>;
  urgencyDistribution: Record<string, number>;
  averageConfidence: number;
  averageProcessingTime: number;
}> {
  // TODO: Implementar coleta de estatísticas do banco de dados
  // Por enquanto, retorna estrutura básica
  return {
    totalMessages: 0,
    intentDistribution: {
      financeiro: 0,
      marketing: 0,
      rh: 0,
      geral: 0,
    },
    urgencyDistribution: {
      baixa: 0,
      media: 0,
      alta: 0,
      critica: 0,
    },
    averageConfidence: 0,
    averageProcessingTime: 0,
  };
}
