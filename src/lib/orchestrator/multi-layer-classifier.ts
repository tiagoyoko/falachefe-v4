import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

// Schema para classificação multi-camada
const MultiLayerClassificationSchema = z.object({
  // Camada 1: Intenção principal
  primaryIntent: z.enum([
    "financeiro", // Leo - questões financeiras, transações, relatórios
    "marketing", // Max - vendas, campanhas, clientes, promoções
    "rh", // Lia - gestão de pessoas, contratação, clima organizacional
    "geral" // Questões gerais ou não classificadas
  ]),
  
  // Camada 2: Sub-intenção específica
  secondaryIntent: z.object({
    // Para financeiro
    financial: z.enum([
      "registrar_transacao",
      "consultar_saldo",
      "criar_categoria",
      "gerar_relatorio",
      "planejar_orcamento",
      "analisar_margem",
      "consultar_historico",
      "outro"
    ]).optional(),
    
    // Para marketing
    marketing: z.enum([
      "criar_campanha",
      "analisar_concorrencia",
      "estrategia_vendas",
      "gestao_redes_sociais",
      "segmentacao_clientes",
      "promocao_produto",
      "metricas_performance",
      "outro"
    ]).optional(),
    
    // Para RH
    hr: z.enum([
      "contratacao_funcionario",
      "avaliacao_desempenho",
      "gestao_conflitos",
      "treinamento_equipe",
      "politica_empresa",
      "clima_organizacional",
      "plano_carreira",
      "outro"
    ]).optional(),
    
    // Para geral
    general: z.enum([
      "duvida_conceitual",
      "orientacao_geral",
      "apoio_emocional",
      "informacao_basica",
      "outro"
    ]).optional()
  }),
  
  // Camada 3: Nível de urgência
  urgency: z.enum([
    "baixa", // Questões que podem esperar
    "media", // Questões normais de negócio
    "alta", // Questões que precisam de atenção rápida
    "critica" // Questões que precisam de atenção imediata
  ]),
  
  // Camada 4: Contexto da conversa
  conversationContext: z.enum([
    "inicial", // Primeira interação ou nova conversa
    "continuidade", // Continuação de conversa anterior
    "esclarecimento", // Pedido de esclarecimento sobre resposta anterior
    "correcao", // Correção de informação anterior
    "aprofundamento" // Aprofundamento de tópico já discutido
  ]),
  
  // Confiança na classificação (0-1)
  confidence: z.number().min(0).max(1),
  
  // Razão para a classificação
  reasoning: z.string()
});

export type MultiLayerClassification = z.infer<typeof MultiLayerClassificationSchema>;

export class MultiLayerClassifier {
  private model;
  
  constructor() {
    this.model = openai(process.env.OPENAI_API_KEY || "");
  }
  
  async classify(message: string, conversationHistory?: string[]): Promise<MultiLayerClassification> {
    const historyContext = conversationHistory ? 
      `\nHistórico da conversa:\n${conversationHistory.slice(-5).join('\n')}` : '';
    
    const systemPrompt = `Você é um classificador especializado em análise de mensagens de empreendedores brasileiros via WhatsApp.

Analise a mensagem do usuário e classifique em 4 camadas:

CAMADA 1 - INTENÇÃO PRINCIPAL:
- "financeiro": Questões sobre dinheiro, transações, relatórios, categorias, saldo, orçamento
- "marketing": Questões sobre vendas, clientes, campanhas, redes sociais, promoções
- "rh": Questões sobre pessoas, contratação, gestão de equipe, clima organizacional
- "geral": Questões gerais, dúvidas conceituais, orientações básicas

CAMADA 2 - SUB-INTENÇÃO:
Para cada intenção principal, identifique a ação específica:
- Financeiro: registrar_transacao, consultar_saldo, criar_categoria, gerar_relatorio, planejar_orcamento, analisar_margem, consultar_historico
- Marketing: criar_campanha, analisar_concorrencia, estrategia_vendas, gestao_redes_sociais, segmentacao_clientes, promocao_produto, metricas_performance
- RH: contratacao_funcionario, avaliacao_desempenho, gestao_conflitos, treinamento_equipe, politica_empresa, clima_organizacional, plano_carreira
- Geral: duvida_conceitual, orientacao_geral, apoio_emocional, informacao_basica

CAMADA 3 - URGÊNCIA:
- "baixa": Questões que podem esperar, curiosidades, planejamento futuro
- "media": Questões normais de negócio, dúvidas operacionais
- "alta": Questões que precisam de atenção rápida, problemas que afetam operação
- "critica": Emergências, problemas urgentes que afetam receita ou operação

CAMADA 4 - CONTEXTO:
- "inicial": Primeira interação ou nova conversa
- "continuidade": Continuação natural da conversa anterior
- "esclarecimento": Pedido de esclarecimento sobre resposta anterior
- "correcao": Correção de informação anterior
- "aprofundamento": Aprofundamento de tópico já discutido

Seja preciso e considere o contexto brasileiro de pequenos empreendedores.`;

    try {
      const result = await generateObject({
        model: this.model.chat("gpt-4o-mini"),
        system: systemPrompt,
        prompt: `Mensagem do usuário: "${message}"${historyContext}`,
        schema: MultiLayerClassificationSchema,
        temperature: 0.3, // Baixa temperatura para classificação consistente
      });
      
      return result.object;
    } catch (error) {
      console.error('Erro na classificação multi-camada:', error);
      
      // Fallback para classificação simples
      return this.fallbackClassification(message, conversationHistory);
    }
  }
  
  private fallbackClassification(message: string, conversationHistory?: string[]): MultiLayerClassification {
    const text = message.toLowerCase();
    
    // Classificação heurística simples como fallback
    let primaryIntent: "financeiro" | "marketing" | "rh" | "geral" = "geral";
    
    if (/(fluxo de caixa|despesa|receita|categoria|saldo|relat[óo]rio|dinheiro|or[çc]amento)/.test(text)) {
      primaryIntent = "financeiro";
    } else if (/(marketing|instagram|whatsapp|campanha|venda|clientes|promo[cç][aã]o|vendas)/.test(text)) {
      primaryIntent = "marketing";
    } else if (/(contrata[cç][aã]o|recrutamento|clima|lideran[çc]a|conflito|feedback|rh|funcion[áa]rio)/.test(text)) {
      primaryIntent = "rh";
    }
    
    // Determinar contexto baseado no histórico
    let conversationContext: "inicial" | "continuidade" | "esclarecimento" | "correcao" | "aprofundamento" = "inicial";
    
    if (conversationHistory && conversationHistory.length > 0) {
      // Se há histórico, é continuação
      conversationContext = "continuidade";
      
      // Verificar se é esclarecimento
      if (/(esclarecer|dúvida|não entendi|pode explicar|como assim)/.test(text)) {
        conversationContext = "esclarecimento";
      }
      
      // Verificar se é correção
      if (/(corrigir|errado|não é isso|mudei de ideia)/.test(text)) {
        conversationContext = "correcao";
      }
      
      // Verificar se é aprofundamento do mesmo tópico
      if (/(mais detalhes|aprofundar|entender melhor|como funciona)/.test(text)) {
        conversationContext = "aprofundamento";
      }
    }
    
    return {
      primaryIntent,
      secondaryIntent: { [primaryIntent]: "outro" },
      urgency: "media",
      conversationContext,
      confidence: 0.6,
      reasoning: "Classificação heurística de fallback"
    };
  }
  
  // Método para obter o agente recomendado baseado na classificação
  getRecommendedAgent(classification: MultiLayerClassification): "leo" | "max" | "lia" | "max" {
    switch (classification.primaryIntent) {
      case "financeiro":
        return "leo";
      case "marketing":
        return "max";
      case "rh":
        return "lia";
      default:
        return "max"; // Default para Max (marketing) que é mais versátil
    }
  }
  
  // Método para priorizar baseado na urgência
  getPriority(classification: MultiLayerClassification): number {
    switch (classification.urgency) {
      case "critica":
        return 3;
      case "alta":
        return 2;
      case "media":
        return 1;
      case "baixa":
        return 0;
      default:
        return 1;
    }
  }
}
