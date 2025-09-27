import { db } from "./db";
import { whatsappMessages, userSettings } from "./schema";
import { eq, or } from "drizzle-orm";
import { getUazapiService } from "./uazapi-service";
import { getOrchestrator } from "./orchestrator/agent-squad";
import { extractAgentMessage } from "./orchestrator/response";
import { nanoid } from "nanoid";

export interface UazapiWebhookData {
  messageid?: string;
  id?: string;
  chatid?: string;
  fromMe?: boolean;
  wasSentByApi?: boolean;
  isGroup?: boolean;
  isGroupMessage?: boolean;
  messageType?: string;
  type?: string;
  text?: string;
  body?: string;
  message?: {
    text?: string;
  };
  caption?: string;
  messageTimestamp?: number;
  timestamp?: number;
  sender?: string;
  from?: string;
  author?: string;
  participant?: string;
  receiver?: string;
  to?: string;
}

export interface WhatsAppMessage {
  id: string;
  messageid: string;
  chatid: string;
  fromMe: boolean;
  isGroup: boolean;
  messageType: string;
  messageText?: string;
  messageTimestamp: number;
  sender: string;
  receiver?: string;
  instanceId: string;
  raw: Record<string, unknown>;
}

export interface WhatsAppUser {
  userId: string;
  whatsappNumber: string;
  name?: string;
  isActive: boolean;
}

export class WhatsAppConversationManager {
  private static instance: WhatsAppConversationManager;

  private constructor() {}

  public static getInstance(): WhatsAppConversationManager {
    if (!WhatsAppConversationManager.instance) {
      WhatsAppConversationManager.instance = new WhatsAppConversationManager();
    }
    return WhatsAppConversationManager.instance;
  }

  /**
   * Processa uma mensagem recebida do webhook da UAZAPI
   */
  async processIncomingMessage(
    webhookData: Record<string, unknown>
  ): Promise<void> {
    try {
      console.log("[WhatsApp] Processando mensagem recebida:", webhookData);

      // Extrair dados da mensagem conforme documentação UAZAPI
      const messageData = this.extractMessageData(webhookData);

      if (!messageData) {
        console.log("[WhatsApp] Dados de mensagem inválidos, ignorando");
        return;
      }

      // Ignorar mensagens enviadas pela própria API
      if (messageData.fromMe) {
        console.log("[WhatsApp] Mensagem enviada pela API, ignorando");
        return;
      }

      // Ignorar mensagens de grupo por enquanto
      if (messageData.isGroup) {
        console.log("[WhatsApp] Mensagem de grupo, ignorando por enquanto");
        return;
      }

      // Salvar mensagem no banco
      await this.saveIncomingMessage(messageData);

      // Encontrar usuário pelo número do WhatsApp
      const user = await this.findUserByWhatsAppNumber(messageData.sender);

      if (!user) {
        console.log(
          "[WhatsApp] Usuário não encontrado para o número:",
          messageData.sender
        );
        await this.sendWelcomeMessage(
          messageData.sender,
          messageData.instanceId
        );
        return;
      }

      // Processar mensagem com agentes
      await this.processMessageWithAgents(messageData, user);
    } catch (error) {
      console.error("[WhatsApp] Erro ao processar mensagem:", error);
    }
  }

  /**
   * Extrai dados da mensagem do webhook da UAZAPI
   */
  private extractMessageData(
    webhookData: Record<string, unknown>
  ): WhatsAppMessage | null {
    try {
      const event = webhookData.event || webhookData.type;
      const instanceId = String(
        webhookData.instance || webhookData.instance_id || ""
      );
      const data = (webhookData.data || webhookData) as UazapiWebhookData;

      if (event !== "message" && event !== "messages") {
        return null;
      }

      // Extrair dados conforme estrutura da UAZAPI
      const messageId = data.messageid || data.id || nanoid();
      const chatId = data.chatid || data.id || "";
      const fromMe = Boolean(data.fromMe || data.wasSentByApi);
      const isGroup = Boolean(data.isGroup || data.isGroupMessage);
      const messageType = data.messageType || data.type || "text";
      const messageText =
        data.text || data.body || data.message?.text || data.caption || "";
      const messageTimestamp =
        data.messageTimestamp || data.timestamp || Date.now();
      const sender =
        data.sender || data.from || data.author || data.participant || "";
      const receiver = data.receiver || data.to || "";

      return {
        id: nanoid(),
        messageid: messageId,
        chatid: chatId,
        fromMe,
        isGroup,
        messageType,
        messageText: typeof messageText === "string" ? messageText : undefined,
        messageTimestamp,
        sender,
        receiver,
        instanceId: instanceId || "default",
        raw: data as Record<string, unknown>,
      };
    } catch (error) {
      console.error("[WhatsApp] Erro ao extrair dados da mensagem:", error);
      return null;
    }
  }

  /**
   * Salva mensagem recebida no banco de dados
   */
  private async saveIncomingMessage(message: WhatsAppMessage): Promise<void> {
    try {
      const insertData = {
        id: message.id,
        direction: "in" as const,
        userId: null,
        instanceId: message.instanceId,
        chatId: message.chatid,
        sender: message.sender,
        receiver: message.receiver || null,
        messageType: message.messageType,
        messageText: message.messageText,
        mediaType:
          typeof message.raw.mediaType === "string"
            ? message.raw.mediaType
            : typeof message.raw.mimetype === "string"
              ? message.raw.mimetype
              : null,
        mediaUrl:
          typeof message.raw.file === "string"
            ? message.raw.file
            : typeof message.raw.url === "string"
              ? message.raw.url
              : null,
        providerMessageId: message.messageid,
        raw: message.raw,
      };

      await db.insert(whatsappMessages).values(insertData);
    } catch (error) {
      console.error("[WhatsApp] Erro ao salvar mensagem recebida:", error);
    }
  }

  /**
   * Encontra usuário pelo número do WhatsApp
   */
  private async findUserByWhatsAppNumber(
    whatsappNumber: string
  ): Promise<WhatsAppUser | null> {
    try {
      // Extrair apenas números do WhatsApp
      const numberOnly = whatsappNumber.replace(/\D/g, "");
      const last11 =
        numberOnly.length >= 11 ? numberOnly.slice(-11) : numberOnly;
      const altNoDDI = numberOnly.replace(/^55/, "");

      // Buscar usuário pelos diferentes formatos de número
      const settings = await db
        .select({
          userId: userSettings.userId,
          whatsappNumber: userSettings.whatsappNumber,
        })
        .from(userSettings)
        .where(
          // Buscar por diferentes formatos do número
          or(
            eq(userSettings.whatsappNumber, numberOnly),
            eq(userSettings.whatsappNumber, last11),
            eq(userSettings.whatsappNumber, altNoDDI)
          )
        )
        .limit(1);

      if (settings.length === 0) {
        return null;
      }

      return {
        userId: settings[0].userId,
        whatsappNumber: settings[0].whatsappNumber || "",
        name: undefined,
        isActive: true,
      };
    } catch (error) {
      console.error("[WhatsApp] Erro ao buscar usuário:", error);
      return null;
    }
  }

  /**
   * Envia mensagem de boas-vindas para usuários não cadastrados
   */
  private async sendWelcomeMessage(
    sender: string,
    instanceId: string
  ): Promise<void> {
    try {
      console.log(
        "Enviando mensagem de boas-vindas para:",
        sender,
        "instância:",
        instanceId
      );
      const welcomeText = `Olá! 👋

Bem-vindo ao Fala Chefe! 

Para começar a usar nossos serviços, você precisa estar cadastrado em nossa plataforma.

Acesse: https://falachefe-v4.vercel.app

Ou entre em contato com nosso suporte para mais informações.

Obrigado! 🚀`;

      const uazapiService = getUazapiService();
      const result = await uazapiService.sendText({
        number: sender.replace(/\D/g, ""),
        text: welcomeText,
        readchat: true,
      });

      if (result.success) {
        console.log("[WhatsApp] Mensagem de boas-vindas enviada para:", sender);
      } else {
        console.error(
          "[WhatsApp] Erro ao enviar mensagem de boas-vindas:",
          result.error
        );
      }
    } catch (error) {
      console.error(
        "[WhatsApp] Erro ao enviar mensagem de boas-vindas:",
        error
      );
    }
  }

  /**
   * Processa mensagem com o orquestrador
   */
  private async processMessageWithAgents(
    message: WhatsAppMessage,
    user: WhatsAppUser
  ): Promise<void> {
    try {
      if (!message.messageText) {
        console.log("[WhatsApp] Mensagem sem texto, ignorando");
        return;
      }

      // Mostrar indicador de "digitando"
      await this.sendTypingIndicator(message.sender, message.instanceId);

      console.log(
        `[WhatsApp] Processando mensagem com orquestrador para usuário: ${user.userId}`
      );

      // Usar o orquestrador para processar a mensagem
      const orchestrator = getOrchestrator();
      const sessionId = `${user.userId}-whatsapp-${message.sender}`;

      const response = await orchestrator.routeRequest(
        message.messageText || "",
        user.userId,
        sessionId
      );

      // Extrair mensagem da resposta
      const agentMessage = await extractAgentMessage(response);

      if (agentMessage) {
        // Enviar resposta
        await this.sendResponse(
          message.sender,
          agentMessage,
          message.instanceId,
          message.messageid
        );

        // Salvar mensagem enviada
        await this.saveOutgoingMessage(
          message.sender,
          agentMessage,
          message.instanceId,
          user.userId,
          message.messageid
        );
      } else {
        console.error(
          "[WhatsApp] Erro ao processar mensagem com orquestrador:",
          response
        );
        await this.sendErrorResponse(message.sender, message.instanceId);
      }
    } catch (error) {
      console.error(
        "[WhatsApp] Erro ao processar mensagem com orquestrador:",
        error
      );
      await this.sendErrorResponse(message.sender, message.instanceId);
    }
  }

  /**
   * Envia indicador de "digitando"
   */
  private async sendTypingIndicator(
    sender: string,
    instanceId: string
  ): Promise<void> {
    try {
      console.log(
        "Enviando indicador de digitando para:",
        sender,
        "instância:",
        instanceId
      );
      const uazapiService = getUazapiService();
      await uazapiService.sendPresence({
        number: sender.replace(/\D/g, ""),
        presence: "composing",
        delay: 1500,
      });
    } catch (error) {
      console.error("[WhatsApp] Erro ao enviar indicador de digitando:", error);
    }
  }

  /**
   * Envia resposta para o usuário
   */
  private async sendResponse(
    sender: string,
    message: string,
    instanceId: string,
    replyId?: string
  ): Promise<void> {
    try {
      const uazapiService = getUazapiService();
      const result = await uazapiService.sendText({
        number: sender.replace(/\D/g, ""),
        text: message,
        readchat: true,
        readmessages: true,
        replyid: replyId,
      });

      if (!result.success) {
        console.error("[WhatsApp] Erro ao enviar resposta:", result.error);
      }
    } catch (error) {
      console.error("[WhatsApp] Erro ao enviar resposta:", error);
    }
  }

  /**
   * Envia mensagem de erro
   */
  private async sendErrorResponse(
    sender: string,
    _instanceId: string
  ): Promise<void> {
    try {
      const errorText = `Desculpe, ocorreu um erro ao processar sua mensagem. 😔

Tente novamente em alguns instantes ou entre em contato com nosso suporte.

Obrigado pela compreensão! 🙏`;

      await this.sendResponse(sender, errorText, _instanceId);
    } catch (error) {
      console.error("[WhatsApp] Erro ao enviar mensagem de erro:", error);
    }
  }

  /**
   * Salva mensagem enviada no banco de dados
   */
  private async saveOutgoingMessage(
    sender: string,
    message: string,
    instanceId: string,
    userId: string,
    replyId?: string
  ): Promise<void> {
    try {
      await db.insert(whatsappMessages).values({
        id: nanoid(),
        direction: "out",
        userId,
        instanceId,
        chatId: `${sender.replace(/\D/g, "")}@s.whatsapp.net`,
        sender: "system",
        receiver: sender,
        messageType: "text",
        messageText: message,
        providerMessageId: replyId,
        raw: { replyId },
      });
    } catch (error) {
      console.error("[WhatsApp] Erro ao salvar mensagem enviada:", error);
    }
  }
}

export const whatsappConversationManager =
  WhatsAppConversationManager.getInstance();
