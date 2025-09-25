import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { db } from "@/lib/db";
import { user, transactions, categories, agentCommands } from "@/lib/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { nanoid } from "nanoid";
import { categorizationService } from "./categorization-service";
import { dateParser } from "./date-parser";
import { contextService } from "./context-service";
import { llmExtractionService } from "./llm-extraction-service";
import { persistentMemoryService } from "./persistent-memory-service";

export interface LLMResponse {
  success: boolean;
  message: string;
  action?: string;
  suggestedActions?: Array<{
    action: string;
    description: string;
    params: Record<string, unknown>;
  }>;
  metadata?: Record<string, unknown>;
}

export interface UserContext {
  userId: string;
  userName?: string;
  userEmail?: string;
  recentTransactions?: Array<{
    description: string;
    amount: string;
    type: string;
    date: string;
  }>;
  categories?: Array<{
    name: string;
    type: string;
  }>;
  totalBalance?: number;
  conversationHistory?: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
  }>;
}

export class LLMService {
  private model = openai(process.env.OPENAI_MODEL || "gpt-4o-mini");

  async processUserMessage(
    userId: string,
    message: string,
    saveToHistory: boolean = true,
    agent: string = "geral"
  ): Promise<LLMResponse> {
    try {
      // Limpar contextos expirados periodicamente
      contextService.cleanupExpiredContexts();

      // Obter ou criar sessão de conversa persistente
      const sessionId = await persistentMemoryService.getOrCreateSession(
        userId,
        agent
      );

      // Salvar mensagem do usuário
      await persistentMemoryService.saveMessage(sessionId, "user", message);

      // Verificar se é uma resposta a uma transação pendente usando LLM
      const isResponseToTransaction =
        await contextService.isResponseToPendingTransaction(userId, message);

      if (isResponseToTransaction) {
        const response = await this.handleTransactionResponse(userId, message);
        // Salvar resposta do assistente
        await persistentMemoryService.saveMessage(
          sessionId,
          "assistant",
          response.message
        );
        return response;
      }

      // Detectar comando de transação usando LLM
      const transactionCommand = await this.detectTransactionCommand(message);

      if (transactionCommand) {
        const userContext = await this.getUserContext(userId);
        const response = await this.handleTransactionCommand(
          userContext,
          transactionCommand
        );
        // Salvar resposta do assistente
        await persistentMemoryService.saveMessage(
          sessionId,
          "assistant",
          response.message
        );
        return response;
      }

      // Buscar contexto do usuário com memória persistente
      const userContext = await this.getUserContextWithMemory(userId, agent);

      // Processar mensagem com LLM
      const response = await this.generateResponse(userContext, message);

      // Salvar no histórico se solicitado
      if (saveToHistory) {
        await this.saveToHistory(userId, message, response);
      }

      // Salvar resposta do assistente na memória persistente
      await persistentMemoryService.saveMessage(
        sessionId,
        "assistant",
        response.message
      );

      // Sempre atualizar contexto de conversa para manter memória
      contextService.createOrUpdateConversationContext(
        userId,
        message,
        response.message,
        response.action
      );

      return response;
    } catch (error) {
      console.error("Erro no processamento LLM:", error);
      return {
        success: false,
        message:
          "❌ Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente em alguns instantes.",
        action: "error",
        metadata: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  private async getUserContextWithMemory(
    userId: string,
    agent: string
  ): Promise<UserContext> {
    // Obter contexto básico do usuário
    const basicContext = await this.getUserContext(userId);

    // Obter histórico de conversa persistente
    const conversationHistory = await persistentMemoryService.getRecentHistory(
      userId,
      agent,
      5 // Últimas 5 mensagens
    );

    // Adicionar histórico ao contexto
    return {
      ...basicContext,
      conversationHistory: conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      })),
    };
  }

  private async getUserContext(userId: string): Promise<UserContext> {
    // Buscar dados do usuário
    const userData = await db
      .select({ name: user.name, email: user.email })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    // Buscar transações recentes (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTransactions = await db
      .select({
        description: transactions.description,
        amount: transactions.amount,
        type: transactions.type,
        transactionDate: transactions.transactionDate,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.transactionDate, thirtyDaysAgo)
        )
      )
      .orderBy(transactions.transactionDate)
      .limit(10);

    // Buscar categorias do usuário
    const userCategories = await db
      .select({
        name: categories.name,
        type: categories.type,
      })
      .from(categories)
      .where(eq(categories.userId, userId));

    // Calcular saldo total
    const allTransactions = await db
      .select({
        amount: transactions.amount,
        type: transactions.type,
      })
      .from(transactions)
      .where(eq(transactions.userId, userId));

    let totalBalance = 0;
    allTransactions.forEach((transaction) => {
      const amount = parseFloat(transaction.amount);
      if (transaction.type === "receita") {
        totalBalance += amount;
      } else {
        totalBalance -= amount;
      }
    });

    return {
      userId,
      userName: userData[0]?.name,
      userEmail: userData[0]?.email,
      recentTransactions: recentTransactions.map((t) => ({
        description: t.description,
        amount: t.amount,
        type: t.type,
        date: t.transactionDate.toLocaleDateString("pt-BR"),
      })),
      categories: userCategories,
      totalBalance,
    };
  }

  private async generateResponse(
    context: UserContext,
    message: string
  ): Promise<LLMResponse> {
    // Consultas simples (responder sem LLM)
    const simpleQuery = this.detectSimpleQuery(message);
    if (simpleQuery) {
      return this.handleSimpleQuery(context, simpleQuery);
    }

    // Detectar consultas de relatórios/fluxo de caixa primeiro
    const reportCommand = this.detectReportCommand(message);
    if (reportCommand) {
      return this.handleReportCommand(context.userId, reportCommand);
    }

    // Verificar se é um comando de registro de transação
    const transactionCommand = await this.detectTransactionCommand(message);
    if (transactionCommand) {
      return this.handleTransactionCommand(context, transactionCommand);
    }

    // Verificar se é um comando de categorização
    const categorizationCommand = this.detectCategorizationCommand(message);
    if (categorizationCommand) {
      return this.handleCategorizationCommand(context, categorizationCommand);
    }

    // Obter histórico de conversa recente (usar persistente se disponível)
    const recentHistory =
      context.conversationHistory ||
      contextService.getRecentConversationHistory(context.userId, 5);

    const systemPrompt = `Você é o "Fala Chefe!", um assistente de IA especializado em gestão financeira para pequenos empresários brasileiros.

CONTEXTO DO USUÁRIO:
- Nome: ${context.userName || "Usuário"}
- Saldo atual: R$ ${context.totalBalance?.toFixed(2) || "0,00"}
- Transações recentes: ${
      context.recentTransactions?.length || 0
    } transações nos últimos 30 dias
- Categorias disponíveis: ${
      context.categories?.map((c) => `${c.name} (${c.type})`).join(", ") ||
      "Nenhuma categoria criada"
    }

HISTÓRICO DA CONVERSA RECENTE:
${
  recentHistory.length > 0
    ? recentHistory
        .map((h, i) => {
          if ("userMessage" in h) {
            // Formato antigo (contextService)
            return `${i + 1}. Usuário: "${h.userMessage}"\n   Assistente: "${h.systemResponse}"`;
          } else {
            // Formato novo (persistentMemoryService)
            return `${i + 1}. ${h.role === "user" ? "Usuário" : "Assistente"}: "${h.content}"`;
          }
        })
        .join("\n")
    : "Nenhuma conversa anterior encontrada."
}

INSTRUÇÕES:
1. Responda sempre em português brasileiro, de forma amigável e profissional
2. Use emojis para tornar as respostas mais amigáveis
3. Foque em ajudar com gestão financeira, fluxo de caixa e negócios
4. Seja proativo - sugira ações que podem ajudar o usuário
5. Se não entender o comando, peça esclarecimentos de forma educada
6. Sempre que possível, forneça dados específicos baseados no contexto do usuário
7. **IMPORTANTE**: Considere o histórico da conversa para manter contexto e continuidade
8. Faça referência a conversas anteriores quando relevante para dar melhor suporte
9. Se o usuário fizer perguntas relacionadas a tópicos já discutidos, use esse contexto

COMANDOS QUE VOCÊ PODE PROCESSAR:
- Registrar receitas e despesas (com validação de campos obrigatórios)
- Consultar saldo e relatórios
- Criar e gerenciar categorias
- Categorizar transações automaticamente
- Alterar categoria de transações existentes
- Processar datas em linguagem natural (hoje, ontem, 15/01/2025, etc.)
- Solicitar informações faltantes antes do registro
- Dar conselhos financeiros
- Explicar conceitos de gestão financeira
- Fornecer insights sobre o negócio

FORMATO DE RESPOSTA:
- Use markdown para formatação
- Inclua ações sugeridas quando apropriado
- Seja específico com valores e datas quando possível`;

    const userPrompt = `Mensagem atual do usuário: "${message}"

Com base no contexto do usuário e no histórico da conversa acima, processe esta mensagem e forneça uma resposta útil e acionável. 

${
  recentHistory.length > 0
    ? "IMPORTANTE: Considere as mensagens anteriores para manter continuidade na conversa e fornecer respostas mais contextualizadas."
    : "Esta é a primeira mensagem da conversa."
}`;

    try {
      const result = await generateText({
        model: this.model,
        system: systemPrompt,
        prompt: userPrompt,
        temperature: 0.7,
      });

      const response = this.parseLLMResponse(result.text);
      return response;
    } catch (error) {
      console.error("Erro na geração de texto:", error);
      throw error;
    }
  }

  // Detectar comandos de registro de transações usando LLM
  private async detectTransactionCommand(message: string): Promise<{
    type: "register_transaction";
    description?: string;
    amount?: number;
    transactionType?: "receita" | "despesa";
    category?: string;
    date?: string;
  } | null> {
    try {
      const extraction =
        await llmExtractionService.extractTransactionData(message);

      if (!extraction.isTransaction || extraction.confidence < 0.7) {
        return null;
      }

      return {
        type: "register_transaction",
        description: extraction.description,
        amount: extraction.amount,
        transactionType: extraction.type,
        category: extraction.category,
        date: extraction.date,
      };
    } catch (error) {
      console.error("Erro na detecção de comando de transação:", error);
      return null;
    }
  }

  // Detectar comandos de categorização
  private detectCategorizationCommand(message: string): {
    type: "categorize" | "suggest_categories" | "change_category";
    description?: string;
    transactionType?: "receita" | "despesa";
    amount?: number;
    transactionId?: string;
    newCategoryId?: string;
  } | null {
    const lowerMessage = message.toLowerCase();

    // Comandos de categorização automática
    if (
      lowerMessage.includes("categorizar") ||
      lowerMessage.includes("categoria para") ||
      lowerMessage.includes("que categoria")
    ) {
      // Extrair descrição e tipo da mensagem
      const descriptionMatch =
        message.match(/[""]([^""]+)[""]/) ||
        message.match(/categorizar\s+(.+?)(?:\s+como|$)/i);
      const description = descriptionMatch?.[1]?.trim();

      // Detectar tipo (receita ou despesa)
      let transactionType: "receita" | "despesa" = "despesa";
      if (lowerMessage.includes("receita") || lowerMessage.includes("venda")) {
        transactionType = "receita";
      } else if (
        lowerMessage.includes("despesa") ||
        lowerMessage.includes("gasto")
      ) {
        transactionType = "despesa";
      }

      // Extrair valor se mencionado
      const amountMatch = message.match(/R\$\s*([\d.,]+)/);
      const amount = amountMatch
        ? parseFloat(amountMatch[1].replace(",", "."))
        : undefined;

      return {
        type: "categorize",
        description,
        transactionType,
        amount,
      };
    }

    // Comandos para sugerir categorias
    if (
      lowerMessage.includes("sugerir categorias") ||
      lowerMessage.includes("quais categorias") ||
      lowerMessage.includes("opções de categoria")
    ) {
      const descriptionMatch =
        message.match(/[""]([^""]+)[""]/) ||
        message.match(/para\s+(.+?)(?:\s+como|$)/i);
      const description = descriptionMatch?.[1]?.trim();

      let transactionType: "receita" | "despesa" = "despesa";
      if (lowerMessage.includes("receita")) {
        transactionType = "receita";
      } else if (lowerMessage.includes("despesa")) {
        transactionType = "despesa";
      }

      const amountMatch = message.match(/R\$\s*([\d.,]+)/);
      const amount = amountMatch
        ? parseFloat(amountMatch[1].replace(",", "."))
        : undefined;

      return {
        type: "suggest_categories",
        description,
        transactionType,
        amount,
      };
    }

    // Comandos para alterar categoria
    if (
      lowerMessage.includes("alterar categoria") ||
      lowerMessage.includes("mudar categoria") ||
      lowerMessage.includes("trocar categoria")
    ) {
      // Extrair ID da transação e nova categoria
      const transactionIdMatch = message.match(/transa[çc][ãa]o\s+(\w+)/i);
      const categoryMatch =
        message.match(/para\s+[""]([^""]+)[""]/i) ||
        message.match(/categoria\s+[""]([^""]+)[""]/i);

      return {
        type: "change_category",
        transactionId: transactionIdMatch?.[1],
        newCategoryId: categoryMatch?.[1],
      };
    }

    return null;
  }

  // Processar resposta a transação pendente
  private async handleTransactionResponse(
    userId: string,
    message: string
  ): Promise<LLMResponse> {
    const result = await contextService.processTransactionResponse(
      userId,
      message
    );

    if (!result.updated && result.responseType === "none") {
      return {
        success: false,
        message: "❌ Não entendi sua resposta. Pode repetir?",
        action: "unclear_response",
      };
    }

    const transactionContext = result.transactionContext;
    if (!transactionContext) {
      return {
        success: false,
        message: "❌ Não há transação pendente para processar.",
        action: "no_pending_transaction",
      };
    }

    // Processar resposta de data
    if (result.responseType === "date" && transactionContext.date) {
      const dateResult = dateParser.parseDate(transactionContext.date);
      if (dateResult.success && dateResult.date) {
        const validation = dateParser.validateDate(dateResult.date);
        if (validation.valid) {
          transactionContext.parsedDate = dateResult.date;
          contextService.updateTransactionContext(userId, transactionContext);

          // Verificar se ainda faltam informações
          if (transactionContext.missingFields.length > 0) {
            return this.buildMissingInfoResponse(transactionContext);
          } else {
            return this.buildConfirmationResponse(transactionContext);
          }
        } else {
          return {
            success: false,
            message: `❌ Data inválida: ${
              validation.error
            }\n\nFormatos aceitos: ${dateParser
              .getAcceptedFormats()
              .join(", ")}`,
            action: "invalid_date",
          };
        }
      } else {
        return {
          success: false,
          message: `❌ Não consegui entender a data "${
            transactionContext.date
          }".\n\nFormatos aceitos: ${dateParser
            .getAcceptedFormats()
            .join(", ")}`,
          action: "date_parse_error",
        };
      }
    }

    // Processar resposta de categoria
    if (
      result.responseType === "category" ||
      result.responseType === "auto_categorize"
    ) {
      if (transactionContext.category === "auto") {
        // Categorização automática
        try {
          const categorizationResult =
            await categorizationService.categorizeTransaction(
              userId,
              transactionContext.description || "",
              transactionContext.type || "despesa",
              transactionContext.amount
            );

          if (categorizationResult.suggestedCategoryId) {
            transactionContext.categoryId =
              categorizationResult.suggestedCategoryId;
            transactionContext.category =
              categorizationResult.suggestedCategoryName ||
              "Categoria sugerida";
            transactionContext.missingFields =
              transactionContext.missingFields.filter((f) => f !== "categoria");
            contextService.updateTransactionContext(userId, transactionContext);
          }
        } catch (error) {
          console.error("Erro na categorização automática:", error);
        }
      }

      // Verificar se ainda faltam informações
      if (transactionContext.missingFields.length > 0) {
        return this.buildMissingInfoResponse(transactionContext);
      } else {
        return this.buildConfirmationResponse(transactionContext);
      }
    }

    // Processar confirmação
    if (result.responseType === "confirm") {
      return this.buildConfirmationResponse(transactionContext);
    }

    return {
      success: false,
      message: "❌ Não entendi sua resposta. Pode repetir?",
      action: "unclear_response",
    };
  }

  // Construir resposta para informações faltantes
  private buildMissingInfoResponse(transactionContext: {
    description?: string;
    amount?: number;
    type?: string;
    parsedDate?: Date;
    missingFields: string[];
  }): LLMResponse {
    const missingFields = transactionContext.missingFields;
    let message = `📝 **Transação identificada:**\n\n`;

    if (transactionContext.description) {
      message += `**Descrição:** ${transactionContext.description}\n`;
    }
    if (transactionContext.amount) {
      message += `**Valor:** R$ ${transactionContext.amount.toFixed(2)}\n`;
    }
    if (transactionContext.type) {
      message += `**Tipo:** ${transactionContext.type}\n`;
    }
    if (transactionContext.parsedDate) {
      message += `**Data:** ${dateParser.formatDate(
        transactionContext.parsedDate
      )}\n`;
    }

    message += `\n❓ **Ainda preciso de:** ${missingFields.join(", ")}.\n\n`;

    const suggestedActions = [];

    if (missingFields.includes("categoria")) {
      message += `**Para categoria:**\n`;
      message += `- "categorizar automaticamente"\n`;
      message += `- "categoria NomeDaCategoria"\n`;
      message += `- "sugerir categorias"\n\n`;

      suggestedActions.push({
        action: "auto_categorize",
        description: "Categorizar automaticamente",
        params: {
          description: transactionContext.description,
          type: transactionContext.type,
          amount: transactionContext.amount,
        },
      });
    }

    if (missingFields.includes("data")) {
      message += `**Para data:**\n`;
      message += `- "hoje", "ontem", "amanhã"\n`;
      message += `- "15/01/2025", "3 dias atrás"\n\n`;
    }

    return {
      success: false,
      message,
      action: "missing_info",
      suggestedActions,
      metadata: {
        type: "transaction_missing_info",
        missingFields,
        transactionContext,
      },
    };
  }

  // Construir resposta de confirmação
  private buildConfirmationResponse(transactionContext: {
    description?: string;
    amount?: number;
    type?: string;
    category?: string;
    categoryId?: string;
    parsedDate?: Date;
  }): LLMResponse {
    let message = `✅ **Transação pronta para registro:**\n\n`;

    if (transactionContext.description) {
      message += `**Descrição:** ${transactionContext.description}\n`;
    }
    if (transactionContext.amount) {
      message += `**Valor:** R$ ${transactionContext.amount.toFixed(2)}\n`;
    }
    if (transactionContext.type) {
      message += `**Tipo:** ${transactionContext.type}\n`;
    }
    if (transactionContext.category) {
      message += `**Categoria:** ${transactionContext.category}\n`;
    }
    if (transactionContext.parsedDate) {
      message += `**Data:** ${dateParser.formatDate(
        transactionContext.parsedDate
      )}\n`;
    }

    message += `\nDeseja confirmar o registro?`;

    return {
      success: true,
      message,
      action: "confirm_transaction",
      suggestedActions: [
        {
          action: "confirm_transaction",
          description: "Confirmar e registrar transação",
          params: {
            description: transactionContext.description,
            amount: transactionContext.amount,
            type: transactionContext.type,
            category: transactionContext.category,
            categoryId: transactionContext.categoryId,
            date: transactionContext.parsedDate?.toISOString(),
          },
        },
        {
          action: "edit_transaction",
          description: "Editar informações",
          params: {
            description: transactionContext.description,
            amount: transactionContext.amount,
            type: transactionContext.type,
            category: transactionContext.category,
            date: transactionContext.parsedDate?.toISOString(),
          },
        },
      ],
      metadata: {
        type: "transaction_confirmation",
        transactionContext,
      },
    };
  }

  // Processar comandos de registro de transação
  private async handleTransactionCommand(
    context: UserContext,
    command: {
      type: "register_transaction";
      description?: string;
      amount?: number;
      transactionType?: "receita" | "despesa";
      category?: string;
      date?: string;
    }
  ): Promise<LLMResponse> {
    // Verificar se tem informações suficientes
    const missingInfo = [];

    if (!command.description) {
      missingInfo.push("descrição");
    }

    if (!command.amount) {
      missingInfo.push("valor");
    }

    if (!command.transactionType) {
      missingInfo.push("tipo (receita ou despesa)");
    }

    if (missingInfo.length > 0) {
      return {
        success: false,
        message: `❌ Para registrar a transação, preciso das seguintes informações: ${missingInfo.join(
          ", "
        )}.\n\nExemplo: "Registre receita de R$ 500 da venda de produto"`,
        action: "missing_transaction_info",
        suggestedActions: [
          {
            action: "provide_missing_info",
            description: "Fornecer informações faltantes",
            params: { missingFields: missingInfo },
          },
        ],
        metadata: {
          type: "transaction_validation",
          missingFields: missingInfo,
        },
      };
    }

    // Processar data se fornecida
    let parsedDate: Date | undefined;
    if (command.date) {
      const dateResult = dateParser.parseDate(command.date);
      if (dateResult.success && dateResult.date) {
        const validation = dateParser.validateDate(dateResult.date);
        if (validation.valid) {
          parsedDate = dateResult.date;
        } else {
          return {
            success: false,
            message: `❌ Data inválida: ${
              validation.error
            }\n\nFormatos aceitos: ${dateParser
              .getAcceptedFormats()
              .join(", ")}`,
            action: "invalid_date",
            metadata: {
              type: "date_validation_error",
              error: validation.error,
            },
          };
        }
      } else {
        return {
          success: false,
          message: `❌ Não consegui entender a data "${
            command.date
          }".\n\nFormatos aceitos: ${dateParser
            .getAcceptedFormats()
            .join(", ")}`,
          action: "date_parse_error",
          metadata: {
            type: "date_parse_error",
            error: dateResult.error,
          },
        };
      }
    }

    // Se não tem data, usar hoje como padrão
    if (!parsedDate) {
      parsedDate = new Date();
    }

    // Inferir categoria automaticamente a partir da descrição e categorias do usuário
    let inferredCategory: string | undefined = command.category || undefined;
    if (!inferredCategory && command.description && command.transactionType) {
      const inferred = this.inferCategoryFromDescription(
        command.description,
        command.transactionType,
        context.categories || []
      );
      if (inferred) inferredCategory = inferred;
    }

    // Se após a inferência ainda não tem categoria, criar contexto de transação pendente
    if (!inferredCategory) {
      const missingFields = ["categoria"];

      // Criar contexto de transação pendente
      const transactionContext = contextService.setTransactionContext(
        context.userId,
        {
          description: command.description,
          amount: command.amount,
          type: command.transactionType,
          parsedDate,
          missingFields,
        }
      );

      return {
        success: false,
        message: `📝 **Transação identificada:**\n\n**Descrição:** ${
          command.description
        }\n**Valor:** R$ ${command.amount?.toFixed(2)}\n**Tipo:** ${
          command.transactionType
        }\n**Data:** ${dateParser.formatDate(
          parsedDate
        )}\n\n❓ **Preciso saber a categoria.** Você pode:\n\n1. **Categorizar automaticamente** - "categorizar automaticamente"\n2. **Escolher uma categoria** - "categoria Vendas"\n3. **Ver sugestões** - "sugerir categorias"`,
        action: "missing_category",
        suggestedActions: [
          {
            action: "auto_categorize",
            description: "Categorizar automaticamente",
            params: {
              description: command.description,
              type: command.transactionType,
              amount: command.amount,
              date: parsedDate.toISOString(),
            },
          },
          {
            action: "suggest_categories",
            description: "Ver sugestões de categorias",
            params: {
              description: command.description,
              type: command.transactionType,
              amount: command.amount,
            },
          },
        ],
        metadata: {
          type: "transaction_ready",
          transactionContext,
        },
      };
    }

    // Se tem todas as informações, processar a transação
    return {
      success: true,
      message: `✅ **Transação pronta para registro:**\n\n**Descrição:** ${
        command.description
      }\n**Valor:** R$ ${command.amount?.toFixed(2)}\n**Tipo:** ${
        command.transactionType
      }\n**Categoria:** ${inferredCategory}\n**Data:** ${dateParser.formatDate(
        parsedDate
      )}\n\nDeseja confirmar o registro?`,
      action: "confirm_transaction",
      suggestedActions: [
        {
          action: "confirm_transaction",
          description: "Confirmar e registrar transação",
          params: {
            description: command.description,
            amount: command.amount,
            type: command.transactionType,
            category: inferredCategory,
            date: parsedDate.toISOString(),
          },
        },
        {
          action: "edit_transaction",
          description: "Editar informações",
          params: {
            description: command.description,
            amount: command.amount,
            type: command.transactionType,
            category: inferredCategory,
            date: parsedDate.toISOString(),
          },
        },
      ],
      metadata: {
        type: "transaction_confirmation",
        transactionData: {
          description: command.description,
          amount: command.amount,
          type: command.transactionType,
          category: inferredCategory,
          date: parsedDate.toISOString(),
        },
      },
    };
  }

  // Processar comandos de categorização
  private async handleCategorizationCommand(
    context: UserContext,
    command: {
      type: "categorize" | "suggest_categories" | "change_category";
      description?: string;
      transactionType?: "receita" | "despesa";
      amount?: number;
      transactionId?: string;
      newCategoryId?: string;
    }
  ): Promise<LLMResponse> {
    switch (command.type) {
      case "categorize":
        if (!command.description || !command.transactionType) {
          return {
            success: false,
            message:
              "❌ Para categorizar, preciso da descrição e tipo da transação.\n\nExemplo: \"Categorizar 'Compra de material' como despesa\"",
            action: "categorization_error",
          };
        }
        return this.categorizeTransaction(
          context.userId,
          command.description,
          command.transactionType,
          command.amount
        );

      case "suggest_categories":
        if (!command.description || !command.transactionType) {
          return {
            success: false,
            message:
              "❌ Para sugerir categorias, preciso da descrição e tipo da transação.\n\nExemplo: \"Sugerir categorias para 'Venda de produto' como receita\"",
            action: "suggestion_error",
          };
        }
        return this.suggestCategories(
          context.userId,
          command.description,
          command.transactionType,
          command.amount
        );

      case "change_category":
        if (!command.transactionId || !command.newCategoryId) {
          return {
            success: false,
            message:
              "❌ Para alterar categoria, preciso do ID da transação e da nova categoria.\n\nExemplo: \"Alterar categoria da transação ABC123 para 'Vendas'\"",
            action: "change_error",
          };
        }
        return this.changeTransactionCategory(
          context.userId,
          command.transactionId,
          command.newCategoryId
        );

      default:
        return {
          success: false,
          message: "❌ Comando de categorização não reconhecido.",
          action: "unknown_command",
        };
    }
  }

  private parseLLMResponse(text: string): LLMResponse {
    // Extrair ações sugeridas se houver
    const actionMatch = text.match(/\[ACTION:([^\]]+)\]/);
    const suggestedActions = [];

    if (actionMatch) {
      try {
        const actionData = JSON.parse(actionMatch[1]);
        if (Array.isArray(actionData)) {
          suggestedActions.push(...actionData);
        } else {
          suggestedActions.push(actionData);
        }
      } catch (e) {
        console.warn("Erro ao parsear ação sugerida:", e);
      }
    }

    // Limpar o texto removendo marcadores de ação
    const cleanText = text.replace(/\[ACTION:[^\]]+\]/g, "").trim();

    // Determinar se a resposta indica sucesso ou erro
    const isSuccess =
      !cleanText.toLowerCase().includes("erro") &&
      !cleanText.toLowerCase().includes("❌") &&
      !cleanText.toLowerCase().includes("não consegui");

    return {
      success: isSuccess,
      message: cleanText,
      suggestedActions:
        suggestedActions.length > 0 ? suggestedActions : undefined,
      metadata: {
        processedAt: new Date().toISOString(),
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      },
    };
  }

  private async saveToHistory(
    userId: string,
    command: string,
    response: LLMResponse
  ): Promise<void> {
    try {
      await db.insert(agentCommands).values({
        id: nanoid(),
        userId,
        command,
        response: response.message,
        success: response.success,
        metadata: response.metadata || {},
      });
    } catch (error) {
      console.error("Erro ao salvar no histórico:", error);
      // Não falhar se não conseguir salvar no histórico
    }
  }

  // Método para processar comandos específicos de negócio
  async processBusinessCommand(
    userId: string,
    command: string,
    commandType: "finance" | "marketing" | "sales" | "general"
  ): Promise<LLMResponse> {
    // Buscar contexto do usuário para validação
    await this.getUserContext(userId);

    // Obter histórico de conversa recente para comandos de negócio
    const recentHistory = contextService.getRecentConversationHistory(
      userId,
      3
    );

    let specializedPrompt = "";

    switch (commandType) {
      case "finance":
        specializedPrompt = `Foque em questões financeiras, fluxo de caixa, análise de custos, e gestão de receitas/despesas.`;
        break;
      case "marketing":
        specializedPrompt = `Foque em estratégias de marketing, análise de clientes, campanhas promocionais, e crescimento de vendas.`;
        break;
      case "sales":
        specializedPrompt = `Foque em técnicas de vendas, prospecção de clientes, negociação, e fechamento de negócios.`;
        break;
      default:
        specializedPrompt = `Forneça conselhos gerais de negócios e gestão empresarial.`;
    }

    let enhancedMessage = `${specializedPrompt}\n\nComando do usuário: "${command}"`;

    // Incluir contexto da conversa se houver histórico relevante
    if (recentHistory.length > 0) {
      const historyContext = recentHistory
        .map(
          (h, i) =>
            `${i + 1}. Usuário: "${h.userMessage}"\n   Assistente: "${
              h.systemResponse
            }"`
        )
        .join("\n");

      enhancedMessage += `\n\nCONTEXTO DA CONVERSA ANTERIOR:\n${historyContext}\n\nConsidere este contexto ao responder.`;
    }

    return this.processUserMessage(userId, enhancedMessage);
  }

  // Método para categorizar transação automaticamente
  async categorizeTransaction(
    userId: string,
    description: string,
    type: "receita" | "despesa",
    amount?: number
  ): Promise<LLMResponse> {
    try {
      const result = await categorizationService.categorizeTransaction(
        userId,
        description,
        type,
        amount
      );

      if (result.suggestedCategoryId) {
        return {
          success: true,
          message: `✅ Categoria sugerida: **${
            result.suggestedCategoryName
          }**\n\nConfiança: ${Math.round(result.confidence * 100)}%\n\nRazão: ${
            result.reasoning
          }`,
          action: "categorize_transaction",
          suggestedActions: [
            {
              action: "apply_categorization",
              description: `Aplicar categoria "${result.suggestedCategoryName}"`,
              params: {
                categoryId: result.suggestedCategoryId,
                confidence: result.confidence,
              },
            },
            {
              action: "suggest_other_categories",
              description: "Ver outras sugestões de categoria",
              params: {
                description,
                type,
                amount,
              },
            },
          ],
          metadata: {
            type: "categorization",
            suggestedCategory: result,
          },
        };
      } else {
        return {
          success: false,
          message: `❌ Não consegui categorizar automaticamente esta transação.\n\n**Descrição:** ${description}\n**Tipo:** ${type}\n\nRazão: ${result.reasoning}\n\nQue tal criar uma nova categoria ou escolher manualmente?`,
          action: "categorization_failed",
          suggestedActions: [
            {
              action: "create_category",
              description: "Criar nova categoria",
              params: {
                type,
                suggestedName: this.suggestCategoryName(description, type),
              },
            },
            {
              action: "manual_categorization",
              description: "Escolher categoria manualmente",
              params: {
                description,
                type,
                amount,
              },
            },
          ],
          metadata: {
            type: "categorization_failed",
            reason: result.reasoning,
          },
        };
      }
    } catch (error) {
      console.error("Erro na categorização:", error);
      return {
        success: false,
        message: "❌ Erro ao categorizar transação. Tente novamente.",
        action: "error",
        metadata: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  // Método para sugerir múltiplas categorias
  async suggestCategories(
    userId: string,
    description: string,
    type: "receita" | "despesa",
    amount?: number
  ): Promise<LLMResponse> {
    try {
      const suggestions = await categorizationService.suggestCategories(
        userId,
        description,
        type,
        amount
      );

      if (suggestions.length > 0) {
        const suggestionsText = suggestions
          .map(
            (s, index) =>
              `${index + 1}. **${s.name}** (Confiança: ${Math.round(
                s.confidence * 100
              )}%)`
          )
          .join("\n");

        return {
          success: true,
          message: `🎯 **Sugestões de categorias para:** "${description}"\n\n${suggestionsText}\n\nEscolha uma categoria ou crie uma nova!`,
          action: "suggest_categories",
          suggestedActions: suggestions.map((suggestion) => ({
            action: "apply_categorization",
            description: `Aplicar categoria "${suggestion.name}"`,
            params: {
              categoryId: suggestion.id,
              confidence: suggestion.confidence,
            },
          })),
          metadata: {
            type: "category_suggestions",
            suggestions,
          },
        };
      } else {
        return {
          success: false,
          message: `❌ Nenhuma categoria encontrada para "${description}".\n\nQue tal criar uma nova categoria?`,
          action: "no_categories_found",
          suggestedActions: [
            {
              action: "create_category",
              description: "Criar nova categoria",
              params: {
                type,
                suggestedName: this.suggestCategoryName(description, type),
              },
            },
          ],
          metadata: {
            type: "no_categories_found",
          },
        };
      }
    } catch (error) {
      console.error("Erro ao sugerir categorias:", error);
      return {
        success: false,
        message: "❌ Erro ao sugerir categorias. Tente novamente.",
        action: "error",
        metadata: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  // Método para alterar categoria de transação
  async changeTransactionCategory(
    userId: string,
    transactionId: string,
    newCategoryId: string
  ): Promise<LLMResponse> {
    try {
      const result = await categorizationService.updateTransactionCategory(
        userId,
        transactionId,
        newCategoryId
      );

      if (result.success) {
        return {
          success: true,
          message: `✅ Categoria da transação alterada com sucesso!`,
          action: "category_updated",
          metadata: {
            type: "category_update",
            transactionId,
            newCategoryId,
          },
        };
      } else {
        return {
          success: false,
          message: `❌ ${result.message}`,
          action: "category_update_failed",
          metadata: {
            type: "category_update_failed",
            reason: result.message,
          },
        };
      }
    } catch (error) {
      console.error("Erro ao alterar categoria:", error);
      return {
        success: false,
        message: "❌ Erro ao alterar categoria. Tente novamente.",
        action: "error",
        metadata: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  // Método auxiliar para sugerir nome de categoria
  private suggestCategoryName(
    description: string,
    type: "receita" | "despesa"
  ): string {
    const lowerDesc = description.toLowerCase();

    // Palavras-chave para diferentes tipos de categorias
    const keywords = {
      vendas: ["venda", "cliente", "produto"],
      serviços: ["serviço", "consultoria", "atendimento"],
      fornecedores: ["fornecedor", "compra", "matéria-prima"],
      marketing: ["marketing", "publicidade", "anúncio"],
      operacionais: ["operacional", "manutenção", "equipamento"],
      combustível: ["combustível", "gasolina", "posto"],
      alimentação: ["alimentação", "comida", "restaurante"],
      transporte: ["transporte", "uber", "taxi"],
      telefone: ["telefone", "celular", "internet"],
      energia: ["energia", "luz", "eletricidade"],
      água: ["água", "saneamento"],
      aluguel: ["aluguel", "locação", "imóvel"],
    };

    for (const [categoryName, words] of Object.entries(keywords)) {
      if (words.some((word) => lowerDesc.includes(word))) {
        return categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
      }
    }

    // Fallback baseado no tipo
    return type === "receita" ? "Outras Receitas" : "Outras Despesas";
  }

  private normalize(text: string): string {
    return (text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");
  }

  private detectSimpleQuery(
    message: string
  ): "user_name" | "user_email" | "current_balance" | null {
    const text = this.normalize(message);
    if (
      text.includes("qual o meu nome") ||
      text.includes("qual meu nome") ||
      text.includes("meu nome")
    ) {
      return "user_name";
    }
    if (text.includes("meu email") || text.includes("qual meu email")) {
      return "user_email";
    }
    if (text.includes("saldo atual") || text.includes("meu saldo")) {
      return "current_balance";
    }
    return null;
  }

  private handleSimpleQuery(
    context: UserContext,
    type: "user_name" | "user_email" | "current_balance"
  ): LLMResponse {
    if (type === "user_name") {
      if (context.userName) {
        return {
          success: true,
          message: `Seu nome é **${context.userName}**. 😊`,
        };
      }
      return {
        success: false,
        message:
          "❌ Não encontrei seu nome no cadastro. Tente sair e entrar novamente.",
      };
    }
    if (type === "user_email") {
      if (context.userEmail) {
        return {
          success: true,
          message: `Seu e-mail é **${context.userEmail}**. ✉️`,
        };
      }
      return {
        success: false,
        message:
          "❌ Não encontrei seu e-mail no cadastro. Tente sair e entrar novamente.",
      };
    }
    // current_balance
    const balance = context.totalBalance ?? 0;
    return {
      success: true,
      message: `Seu saldo atual é **R$ ${balance.toFixed(2)}**. 💰`,
      metadata: { type: "current_balance" },
    };
  }

  // =====================
  // Relatórios / Consultas
  // =====================
  private detectReportCommand(message: string): {
    type:
      | "cashflow_summary"
      | "expenses_by_category"
      | "revenues_by_category"
      | "list_transactions";
    days?: number; // período em dias (default 30)
  } | null {
    const text = this.normalize(message);

    // Período
    let days: number | undefined;
    const lastNDaysMatch = text.match(/ultimos?\s+(\d{1,3})\s+dias?/);
    if (lastNDaysMatch) {
      days = parseInt(lastNDaysMatch[1], 10);
    } else if (text.includes("mes atual") || text.includes("mês atual")) {
      // Trataremos no handler como mês atual
      days = undefined;
    }

    // Despesas por categoria
    if (
      (text.includes("despesa") && text.includes("categoria")) ||
      text.includes("despesas por categoria")
    ) {
      return { type: "expenses_by_category", days: days ?? 30 };
    }

    // Receitas por categoria
    if (
      (text.includes("receita") && text.includes("categoria")) ||
      text.includes("receitas por categoria")
    ) {
      return { type: "revenues_by_category", days: days ?? 30 };
    }

    // Resumo de fluxo de caixa
    if (
      text.includes("fluxo de caixa") ||
      text.includes("resumo financeiro") ||
      text.includes("saldo atual")
    ) {
      return { type: "cashflow_summary", days: days ?? 30 };
    }

    // Listar transações
    if (
      text.includes("listar transacoes") ||
      text.includes("listar transações") ||
      text.includes("consultar registros") ||
      text.includes("consultar transacoes") ||
      text.includes("consultar transações")
    ) {
      return { type: "list_transactions", days: days ?? 30 };
    }

    return null;
  }

  private async handleReportCommand(
    userId: string,
    command: {
      type:
        | "cashflow_summary"
        | "expenses_by_category"
        | "revenues_by_category"
        | "list_transactions";
      days?: number;
    }
  ): Promise<LLMResponse> {
    // Período
    const now = new Date();
    let startDate: Date;
    const endDate: Date = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59
    );

    if (!command.days && command.days !== 0) {
      // Se não especificado, usar mês atual
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    } else {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - (command.days ?? 30));
      startDate.setHours(0, 0, 0, 0);
    }

    // Buscar dados conforme o tipo
    if (command.type === "cashflow_summary") {
      const tx = await db
        .select({ amount: transactions.amount, type: transactions.type })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            gte(transactions.transactionDate, startDate),
            lte(transactions.transactionDate, endDate)
          )
        );

      const totalReceitas = tx
        .filter((t) => t.type === "receita")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const totalDespesas = tx
        .filter((t) => t.type === "despesa")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const message =
        `📊 **Resumo do Fluxo de Caixa (${dateParser.formatDate(
          startDate
        )} → ${dateParser.formatDate(endDate)})**\n\n` +
        `- Receitas: **R$ ${totalReceitas.toFixed(2)}**\n` +
        `- Despesas: **R$ ${totalDespesas.toFixed(2)}**\n` +
        `- Saldo: **R$ ${(totalReceitas - totalDespesas).toFixed(2)}**\n` +
        `- Transações: **${tx.length}**\n`;

      return {
        success: true,
        message,
        metadata: { type: "cashflow_summary", startDate, endDate },
      };
    }

    if (
      command.type === "expenses_by_category" ||
      command.type === "revenues_by_category"
    ) {
      const targetType =
        command.type === "expenses_by_category" ? "despesa" : "receita";

      const rows = await db
        .select({
          categoryId: transactions.categoryId,
          amount: transactions.amount,
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.type, targetType),
            gte(transactions.transactionDate, startDate),
            lte(transactions.transactionDate, endDate)
          )
        );

      // Carregar nomes de categorias
      const cats = await db
        .select({ id: categories.id, name: categories.name })
        .from(categories)
        .where(eq(categories.userId, userId));

      const idToName: Record<string, string> = {};
      cats.forEach((c) => (idToName[c.id] = c.name));

      const totals = new Map<string, number>();
      rows.forEach((r) => {
        const key = r.categoryId
          ? idToName[r.categoryId] || "Sem categoria"
          : "Sem categoria";
        const current = totals.get(key) ?? 0;
        totals.set(key, current + parseFloat(r.amount));
      });

      const sorted = Array.from(totals.entries()).sort((a, b) => b[1] - a[1]);
      const header = `| Categoria | Total (R$) |\n|---|---:|\n`;
      const body =
        sorted.length > 0
          ? sorted
              .map(([name, total]) => `| ${name} | ${total.toFixed(2)} |`)
              .join("\n")
          : `| - | 0,00 |`;

      const title =
        command.type === "expenses_by_category"
          ? "Despesas por Categoria"
          : "Receitas por Categoria";

      const message = `📚 **${title} (${dateParser.formatDate(
        startDate
      )} → ${dateParser.formatDate(endDate)})**\n\n${header}${body}`;

      return {
        success: true,
        message,
        metadata: { type: command.type, startDate, endDate },
      };
    }

    if (command.type === "list_transactions") {
      const rows = await db
        .select({
          description: transactions.description,
          amount: transactions.amount,
          type: transactions.type,
          date: transactions.transactionDate,
          categoryId: transactions.categoryId,
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, userId),
            gte(transactions.transactionDate, startDate),
            lte(transactions.transactionDate, endDate)
          )
        )
        .orderBy(transactions.transactionDate);

      const cats = await db
        .select({ id: categories.id, name: categories.name })
        .from(categories)
        .where(eq(categories.userId, userId));
      const idToName: Record<string, string> = {};
      cats.forEach((c) => (idToName[c.id] = c.name));

      const header = `| Data | Descrição | Tipo | Categoria | Valor (R$) |\n|---|---|---|---|---:|\n`;
      const body =
        rows.length > 0
          ? rows
              .map((r) => {
                const date = dateParser.formatDate(r.date);
                const cat = r.categoryId ? idToName[r.categoryId] || "-" : "-";
                return `| ${date} | ${r.description} | ${
                  r.type
                } | ${cat} | ${parseFloat(r.amount).toFixed(2)} |`;
              })
              .join("\n")
          : `| - | - | - | - | 0,00 |`;

      const message = `🧾 **Transações (${dateParser.formatDate(
        startDate
      )} → ${dateParser.formatDate(endDate)})**\n\n${header}${body}`;

      return {
        success: true,
        message,
        metadata: { type: "list_transactions", startDate, endDate },
      };
    }

    // Caso não caia em nenhum
    return {
      success: false,
      message: "❌ Não consegui entender o tipo de relatório solicitado.",
      action: "report_error",
    };
  }

  private inferCategoryFromDescription(
    description: string,
    type: "receita" | "despesa",
    categories: Array<{ name: string; type: string }>
  ): string | null {
    const normalizedDesc = this.normalize(description);

    const synonyms: Record<string, string[]> = {
      vendas: ["venda", "vendas", "faturamento"],
      servicos: ["servico", "servicos", "consultoria", "atendimento"],
      fornecedores: [
        "fornecedor",
        "fornecedores",
        "compra",
        "materia-prima",
        "insumo",
      ],
      marketing: [
        "marketing",
        "publicidade",
        "anuncio",
        "propaganda",
        "campanha",
      ],
      operacionais: ["operacional", "manutencao", "equipamento", "reparo"],
      combustivel: [
        "combustivel",
        "gasolina",
        "diesel",
        "abastecimento",
        "posto",
      ],
      alimentacao: [
        "alimentacao",
        "restaurante",
        "comida",
        "refeicao",
        "lanche",
      ],
      transporte: ["transporte", "uber", "taxi", "onibus", "passagem"],
      telefone: ["telefone", "celular", "internet", "dados", "plano"],
      energia: ["energia", "luz", "eletricidade"],
      agua: ["agua", "saneamento"],
      aluguel: ["aluguel", "locacao", "imovel", "escritorio"],
    };

    const userCategories = (categories || []).filter(
      (c) => c && this.normalize(c.type) === type
    );

    for (const c of userCategories) {
      const nameNorm = this.normalize(c.name);
      if (nameNorm && normalizedDesc.includes(nameNorm)) {
        return c.name;
      }
    }

    for (const c of userCategories) {
      const nameNorm = this.normalize(c.name);
      const syns = synonyms[nameNorm as keyof typeof synonyms];
      if (!syns) continue;
      if (syns.some((s) => normalizedDesc.includes(s))) {
        return c.name;
      }
    }

    return null;
  }

  // Método para obter insights proativos
  async generateProactiveInsights(userId: string): Promise<LLMResponse> {
    const context = await this.getUserContext(userId);

    if (
      !context.recentTransactions ||
      context.recentTransactions.length === 0
    ) {
      return {
        success: true,
        message:
          "📊 Olá! Vejo que você ainda não tem transações registradas. Que tal começar criando uma planilha de fluxo de caixa?",
        suggestedActions: [
          {
            action: "create_spreadsheet",
            description: "Criar planilha de fluxo de caixa",
            params: {
              name:
                "Fluxo de Caixa - " + new Date().toLocaleDateString("pt-BR"),
            },
          },
        ],
        metadata: { type: "proactive_insight", insightType: "onboarding" },
      };
    }

    const insights = await generateText({
      model: this.model,
      system: `Você é um consultor financeiro especializado. Analise os dados do usuário e forneça insights proativos e úteis sobre seu negócio.`,
      prompt: `Dados do usuário:
- Saldo atual: R$ ${context.totalBalance?.toFixed(2)}
- Transações recentes: ${context.recentTransactions?.length} transações
- Categorias: ${context.categories?.map((c) => c.name).join(", ") || "Nenhuma"}

Forneça 2-3 insights proativos que podem ajudar este empresário a melhorar seu negócio.`,
      temperature: 0.8,
    });

    return {
      success: true,
      message: insights.text,
      metadata: {
        type: "proactive_insight",
        generatedAt: new Date().toISOString(),
      },
    };
  }
}

// Instância singleton do serviço
export const llmService = new LLMService();
