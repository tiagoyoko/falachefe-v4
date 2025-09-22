export interface UazapiSendTextPayload {
  number: string; // E.164 sem '+' ou ID de grupo terminando com @g.us
  text: string;
  linkPreview?: boolean;
  linkPreviewTitle?: string;
  linkPreviewDescription?: string;
  linkPreviewImage?: string;
  linkPreviewLarge?: boolean;
  replyid?: string;
  mentions?: string; // números separados por vírgula
  readchat?: boolean;
  readmessages?: boolean;
  delay?: number; // ms
  forward?: boolean;
}

export interface UazapiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

export interface UazapiSendMediaPayload {
  number: string;
  type:
    | "image"
    | "video"
    | "document"
    | "audio"
    | "myaudio"
    | "ptt"
    | "sticker";
  file: string; // URL ou base64
  caption?: string;
  replyid?: string;
  readchat?: boolean;
  readmessages?: boolean;
  delay?: number;
}

export class UazapiService {
  private readonly baseUrl: string;
  private readonly token: string;

  constructor(baseUrl?: string, token?: string) {
    const envBase = baseUrl || process.env.UAZAPI_BASE_URL;
    const envToken = token || process.env.UAZAPI_TOKEN;

    if (!envBase) {
      throw new Error("UAZAPI_BASE_URL não configurado no ambiente");
    }
    if (!envToken) {
      throw new Error("UAZAPI_TOKEN não configurado no ambiente");
    }

    this.baseUrl = envBase.replace(/\/$/, "");
    this.token = envToken;
  }

  async sendText(payload: UazapiSendTextPayload): Promise<UazapiResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/send/text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: this.token,
        } as Record<string, string>,
        body: JSON.stringify(payload),
      });

      const status = res.status;
      const json = await safeJson(res);

      if (!res.ok) {
        const errorMessage =
          json && typeof json.error === "string"
            ? json.error
            : `Falha ao enviar mensagem (status ${status})`;
        return {
          success: false,
          error: errorMessage,
          status,
        };
      }

      return { success: true, data: json, status };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  async sendMedia(payload: UazapiSendMediaPayload): Promise<UazapiResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/send/media`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: this.token,
        } as Record<string, string>,
        body: JSON.stringify(payload),
      });

      const status = res.status;
      const json = await safeJson(res);

      if (!res.ok) {
        const errorMessage =
          json && typeof json.error === "string"
            ? json.error
            : `Falha ao enviar mídia (status ${status})`;
        return {
          success: false,
          error: errorMessage,
          status,
        };
      }

      return { success: true, data: json, status };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }
}

async function safeJson(
  res: Response
): Promise<Record<string, unknown> | null> {
  try {
    const json = await res.json();
    if (json && typeof json === "object") {
      return json as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

let singletonInstance: UazapiService | null = null;

export function getUazapiService(): UazapiService {
  if (singletonInstance) return singletonInstance;
  const base = process.env.UAZAPI_BASE_URL;
  const token = process.env.UAZAPI_TOKEN;
  if (!base) throw new Error("UAZAPI_BASE_URL não configurado no ambiente");
  if (!token) throw new Error("UAZAPI_TOKEN não configurado no ambiente");
  singletonInstance = new UazapiService(base, token);
  return singletonInstance;
}
