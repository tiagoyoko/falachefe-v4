/**
 * Serviço para extração de dados de transações usando LLM
 */

import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export interface TransactionExtractionResult {
  isTransaction: boolean;
  description?: string;
  amount?: number;
  type?: "receita" | "despesa";
  category?: string;
  date?: string;
  confidence: number;
  reasoning?: string;
}

export interface ContextResponseResult {
  isResponse: boolean;
  responseType?: "date" | "category" | "confirmation" | "other";
  extractedData?: {
    date?: string;
    category?: string;
    confirmation?: boolean;
  };
  confidence: number;
}

export class LLMExtractionService {
  private static instance: LLMExtractionService;
  private model = openai(process.env.OPENAI_MODEL || "gpt-4o-mini");

  public static getInstance(): LLMExtractionService {
    if (!LLMExtractionService.instance) {
      LLMExtractionService.instance = new LLMExtractionService();
    }
    return LLMExtractionService.instance;
  }

  /**
   * Extrair dados de transação de uma mensagem usando LLM
   */
  async extractTransactionData(
    message: string
  ): Promise<TransactionExtractionResult> {
    const systemPrompt = `Você é um especialista em extrair dados de transações financeiras de mensagens em português brasileiro.

Sua tarefa é analisar uma mensagem e determinar se ela contém uma solicitação de registro de transação financeira, extraindo os dados relevantes.

DADOS A EXTRAIR:
- description: Descrição da transação (ex: "materiais de escritório", "venda de produto")
- amount: Valor numérico em reais (ex: 150, 500.50)
- type: "receita" ou "despesa" baseado no contexto
- category: Categoria mencionada (opcional)
- date: Data mencionada (opcional)

PALAVRAS-CHAVE DE TRANSAÇÃO:
- Registrar, registre, adicionar, criar, inserir
- Receita, despesa, gasto, venda, compra, pagamento
- R$, reais, real

EXEMPLOS:
"registre 150 reais de materiais de escritorio" → {
  isTransaction: true,
  description: "materiais de escritorio",
  amount: 150,
  type: "despesa",
  confidence: 0.95
}

"adicionar receita de R$ 500 da venda de produto" → {
  isTransaction: true,
  description: "venda de produto",
  amount: 500,
  type: "receita",
  confidence: 0.98
}

"criar despesa de 300 reais para fornecedor ontem" → {
  isTransaction: true,
  description: "fornecedor",
  amount: 300,
  type: "despesa",
  date: "ontem",
  confidence: 0.92
}

"olá, como você está?" → {
  isTransaction: false,
  confidence: 0.99
}

Responda APENAS com um objeto JSON válido, sem explicações adicionais.`;

    try {
      const result = await generateText({
        model: this.model,
        system: systemPrompt,
        prompt: `Mensagem: "${message}"`,
        temperature: 0.1, // Baixa temperatura para consistência
      });

      // Tentar fazer parse do JSON
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const extracted = JSON.parse(jsonMatch[0]);
        return {
          isTransaction: extracted.isTransaction || false,
          description: extracted.description,
          amount: extracted.amount,
          type: extracted.type,
          category: extracted.category,
          date: extracted.date,
          confidence: extracted.confidence || 0.5,
          reasoning: extracted.reasoning,
        };
      }

      // Fallback se não conseguir fazer parse
      return {
        isTransaction: false,
        confidence: 0.1,
        reasoning: "Não foi possível extrair dados da resposta da LLM",
      };
    } catch (error) {
      console.error("Erro na extração de dados:", error);
      return {
        isTransaction: false,
        confidence: 0.0,
        reasoning: `Erro: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`,
      };
    }
  }

  /**
   * Verificar se uma mensagem é uma resposta a uma transação pendente
   */
  async detectContextResponse(
    message: string,
    missingFields: string[]
  ): Promise<ContextResponseResult> {
    const systemPrompt = `Você é um especialista em detectar respostas a transações financeiras pendentes.

Sua tarefa é analisar uma mensagem e determinar se ela é uma resposta a uma transação que está aguardando informações adicionais.

CAMPOS FALTANTES: ${missingFields.join(", ")}

TIPOS DE RESPOSTA:
- date: Resposta sobre data (ex: "hoje", "ontem", "15/01/2025", "3 dias atrás")
- category: Resposta sobre categoria (ex: "categorizar automaticamente", "categoria Vendas")
- confirmation: Confirmação (ex: "sim", "confirmar", "ok", "certo")
- other: Outras respostas não relacionadas

PALAVRAS-CHAVE DE DATA:
- hoje, ontem, amanhã, amanhã
- Formatos de data: 15/01/2025, 15/01/25, 2025-01-15
- Relativos: "3 dias atrás", "1 semana atrás"

PALAVRAS-CHAVE DE CATEGORIA:
- categorizar automaticamente
- categoria [nome]
- sugerir categorias

PALAVRAS-CHAVE DE CONFIRMAÇÃO:
- sim, confirmar, ok, certo, registrar

EXEMPLOS:
"ontem" (com missingFields: ["data"]) → {
  isResponse: true,
  responseType: "date",
  extractedData: { date: "ontem" },
  confidence: 0.95
}

"categorizar automaticamente" (com missingFields: ["categoria"]) → {
  isResponse: true,
  responseType: "category",
  extractedData: { category: "auto" },
  confidence: 0.98
}

"sim" (com missingFields: []) → {
  isResponse: true,
  responseType: "confirmation",
  extractedData: { confirmation: true },
  confidence: 0.9
}

"olá" (com qualquer missingFields) → {
  isResponse: false,
  confidence: 0.95
}

Responda APENAS com um objeto JSON válido, sem explicações adicionais.`;

    try {
      const result = await generateText({
        model: this.model,
        system: systemPrompt,
        prompt: `Mensagem: "${message}"`,
        temperature: 0.1,
      });

      // Tentar fazer parse do JSON
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const extracted = JSON.parse(jsonMatch[0]);
        return {
          isResponse: extracted.isResponse || false,
          responseType: extracted.responseType,
          extractedData: extracted.extractedData,
          confidence: extracted.confidence || 0.5,
        };
      }

      // Fallback
      return {
        isResponse: false,
        confidence: 0.1,
      };
    } catch (error) {
      console.error("Erro na detecção de resposta de contexto:", error);
      return {
        isResponse: false,
        confidence: 0.0,
      };
    }
  }

  /**
   * Extrair informações específicas de uma mensagem (data, categoria, etc.)
   */
  async extractSpecificInfo(
    message: string,
    infoType: "date" | "category" | "amount" | "description"
  ): Promise<{ value: string | number | null; confidence: number }> {
    const systemPrompt = `Você é um especialista em extrair informações específicas de mensagens em português brasileiro.

Sua tarefa é extrair uma informação específica de uma mensagem.

TIPO DE INFORMAÇÃO: ${infoType}

Para DATA:
- Extrair datas em qualquer formato: "hoje", "ontem", "15/01/2025", "3 dias atrás"
- Retornar a data exatamente como mencionada na mensagem

Para CATEGORIA:
- Extrair nome da categoria mencionada
- Se for "categorizar automaticamente", retornar "auto"
- Se não mencionar categoria, retornar null

Para AMOUNT:
- Extrair valor numérico em reais
- Converter para número (ex: "150 reais" → 150)
- Se não mencionar valor, retornar null

Para DESCRIPTION:
- Extrair descrição da transação
- Remover palavras como "registrar", "adicionar", "R$", "reais"
- Manter apenas a descrição do item/serviço

EXEMPLOS:
"ontem" (infoType: "date") → { value: "ontem", confidence: 0.95 }
"categorizar automaticamente" (infoType: "category") → { value: "auto", confidence: 0.98 }
"150 reais" (infoType: "amount") → { value: 150, confidence: 0.95 }
"materiais de escritorio" (infoType: "description") → { value: "materiais de escritorio", confidence: 0.9 }

Responda APENAS com um objeto JSON válido, sem explicações adicionais.`;

    try {
      const result = await generateText({
        model: this.model,
        system: systemPrompt,
        prompt: `Mensagem: "${message}"`,
        temperature: 0.1,
      });

      // Tentar fazer parse do JSON
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const extracted = JSON.parse(jsonMatch[0]);
        return {
          value: extracted.value,
          confidence: extracted.confidence || 0.5,
        };
      }

      return { value: null, confidence: 0.1 };
    } catch (error) {
      console.error(`Erro na extração de ${infoType}:`, error);
      return { value: null, confidence: 0.0 };
    }
  }
}

export const llmExtractionService = LLMExtractionService.getInstance();
