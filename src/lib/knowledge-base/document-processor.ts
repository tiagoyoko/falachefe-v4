import { nanoid } from "nanoid";
import * as fs from "fs";
import * as path from "path";

// Tipos para processamento de documentos
export interface ProcessedDocument {
  id: string;
  title: string;
  content: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  metadata: Record<string, unknown>;
  chunks: Chunk[];
}

export interface Chunk {
  id: string;
  content: string;
  chunkIndex: number;
  tokenCount: number;
  metadata: Record<string, unknown>;
}

export interface DocumentMetadata {
  title: string;
  author?: string;
  createdAt?: Date;
  modifiedAt?: Date;
  pages?: number;
  wordCount?: number;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface ProcessOptions {
  title: string;
  agentIds?: string[];
  isGlobal?: boolean;
  metadata?: Record<string, unknown>;
}

// Configurações de chunking
const CHUNKING_CONFIG = {
  maxChunkSize: 1000,
  minChunkSize: 100,
  overlap: 100,
  preserveParagraphs: true,
  splitBy: "paragraph" as const,
};

// Tipos de arquivo suportados
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
  "text/html",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export class DocumentProcessor {
  /**
   * Processa um arquivo e retorna o documento processado
   */
  async processDocument(
    file: File,
    options: ProcessOptions
  ): Promise<ProcessedDocument> {
    // Validar arquivo
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Extrair conteúdo
    const content = await this.extractContent(file);

    // Extrair metadados
    const metadata = await this.extractMetadata(file);

    // Chunking do conteúdo
    const chunks = this.chunkContent(content);

    // Salvar arquivo
    const filePath = await this.saveFile(file);

    return {
      id: nanoid(),
      title: options.title,
      content,
      filePath,
      fileType: file.type,
      fileSize: file.size,
      metadata: { ...metadata, ...options.metadata },
      chunks,
    };
  }

  /**
   * Valida se o arquivo é suportado
   */
  private validateFile(file: File): ValidationResult {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error:
          "Tipo de arquivo não suportado. Formatos aceitos: PDF, DOCX, TXT, MD, HTML",
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `Arquivo muito grande. Tamanho máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      };
    }

    return { valid: true };
  }

  /**
   * Extrai conteúdo do arquivo baseado no tipo
   */
  private async extractContent(file: File): Promise<string> {
    switch (file.type) {
      case "text/plain":
        return await this.extractTextContent(file);
      case "text/markdown":
        return await this.extractTextContent(file);
      case "text/html":
        return await this.extractHtmlContent(file);
      case "application/pdf":
        return await this.extractPdfContent(file);
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return await this.extractDocxContent(file);
      default:
        throw new Error(`Tipo de arquivo não suportado: ${file.type}`);
    }
  }

  /**
   * Extrai conteúdo de arquivos de texto
   */
  private async extractTextContent(file: File): Promise<string> {
    return await file.text();
  }

  /**
   * Extrai conteúdo de arquivos HTML
   */
  private async extractHtmlContent(file: File): Promise<string> {
    const html = await file.text();
    // Remover tags HTML e extrair texto
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Extrai conteúdo de arquivos PDF
   */
  private async extractPdfContent(file: File): Promise<string> {
    // TODO: Implementar extração de PDF
    // Por enquanto, retorna placeholder
    console.log("Tentativa de extração de PDF para arquivo:", file.name);
    throw new Error(
      "Extração de PDF ainda não implementada. Use arquivos TXT ou MD por enquanto."
    );
  }

  /**
   * Extrai conteúdo de arquivos DOCX
   */
  private async extractDocxContent(file: File): Promise<string> {
    // TODO: Implementar extração de DOCX
    // Por enquanto, retorna placeholder
    console.log("Tentativa de extração de DOCX para arquivo:", file.name);
    throw new Error(
      "Extração de DOCX ainda não implementada. Use arquivos TXT ou MD por enquanto."
    );
  }

  /**
   * Extrai metadados do arquivo
   */
  private async extractMetadata(file: File): Promise<DocumentMetadata> {
    return {
      title: file.name.replace(/\.[^/.]+$/, ""), // Remove extensão
      createdAt: new Date(),
      modifiedAt: new Date(),
      wordCount: 0, // Será calculado após extração do conteúdo
    };
  }

  /**
   * Divide o conteúdo em chunks otimizados
   */
  private chunkContent(content: string): Chunk[] {
    if (!content || content.trim().length === 0) {
      return [];
    }

    const chunks: Chunk[] = [];
    const paragraphs = this.splitByParagraphs(content);

    let currentChunk = "";
    let chunkIndex = 0;
    let tokenCount = 0;

    for (const paragraph of paragraphs) {
      const paragraphTokens = this.estimateTokenCount(paragraph);

      // Se adicionar este parágrafo exceder o limite, finalizar chunk atual
      if (
        currentChunk &&
        tokenCount + paragraphTokens > CHUNKING_CONFIG.maxChunkSize
      ) {
        if (currentChunk.trim().length >= CHUNKING_CONFIG.minChunkSize) {
          chunks.push({
            id: nanoid(),
            content: currentChunk.trim(),
            chunkIndex: chunkIndex++,
            tokenCount,
            metadata: {},
          });
        }

        // Iniciar novo chunk com sobreposição
        currentChunk = this.getOverlap(currentChunk) + paragraph;
        tokenCount = this.estimateTokenCount(currentChunk);
      } else {
        currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
        tokenCount += paragraphTokens;
      }
    }

    // Adicionar último chunk se não estiver vazio
    if (currentChunk.trim().length >= CHUNKING_CONFIG.minChunkSize) {
      chunks.push({
        id: nanoid(),
        content: currentChunk.trim(),
        chunkIndex: chunkIndex++,
        tokenCount,
        metadata: {},
      });
    }

    return chunks;
  }

  /**
   * Divide texto por parágrafos
   */
  private splitByParagraphs(text: string): string[] {
    return text
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }

  /**
   * Estima o número de tokens (aproximação: 1 token ≈ 4 caracteres)
   */
  private estimateTokenCount(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Obtém sobreposição do chunk anterior
   */
  private getOverlap(chunk: string): string {
    if (!CHUNKING_CONFIG.overlap || chunk.length < CHUNKING_CONFIG.overlap) {
      return "";
    }

    const words = chunk.split(/\s+/);
    const overlapWords = Math.floor(CHUNKING_CONFIG.overlap / 4); // Aproximação
    return words.slice(-overlapWords).join(" ") + " ";
  }

  /**
   * Salva arquivo no sistema de arquivos
   */
  private async saveFile(file: File): Promise<string> {
    const uploadDir = path.join(process.cwd(), "uploads", "knowledge-base");

    // Criar diretório se não existir
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${nanoid()}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    return filePath;
  }

  /**
   * Sanitiza conteúdo removendo caracteres maliciosos
   */
  private sanitizeContent(content: string): string {
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove scripts
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "") // Remove iframes
      .replace(/javascript:/gi, "") // Remove javascript: URLs
      .replace(/on\w+\s*=/gi, "") // Remove event handlers
      .trim();
  }
}

// Instância singleton
export const documentProcessor = new DocumentProcessor();
