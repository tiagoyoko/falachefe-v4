/**
 * Serviço para processar datas em linguagem natural
 */

export interface DateParseResult {
  success: boolean;
  date?: Date;
  error?: string;
  originalInput?: string;
}

export class DateParser {
  private static instance: DateParser;

  public static getInstance(): DateParser {
    if (!DateParser.instance) {
      DateParser.instance = new DateParser();
    }
    return DateParser.instance;
  }

  /**
   * Processa uma string de data em linguagem natural
   */
  parseDate(input: string): DateParseResult {
    if (!input || typeof input !== "string") {
      return {
        success: false,
        error: "Entrada inválida para data",
        originalInput: input,
      };
    }

    const normalizedInput = input.toLowerCase().trim();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    try {
      // Casos especiais de linguagem natural
      if (normalizedInput === "hoje" || normalizedInput === "today") {
        return {
          success: true,
          date: today,
          originalInput: input,
        };
      }

      if (normalizedInput === "ontem" || normalizedInput === "yesterday") {
        return {
          success: true,
          date: yesterday,
          originalInput: input,
        };
      }

      if (normalizedInput === "amanhã" || normalizedInput === "tomorrow") {
        return {
          success: true,
          date: tomorrow,
          originalInput: input,
        };
      }

      // Processar datas relativas (ex: "3 dias atrás", "1 semana atrás")
      const relativeMatch = normalizedInput.match(
        /(\d+)\s*(dia|dias|semana|semanas|mês|meses|ano|anos)\s*(atrás|atras|antes)/
      );
      if (relativeMatch) {
        const amount = parseInt(relativeMatch[1]);
        const unit = relativeMatch[2];
        const date = new Date(today);

        switch (unit) {
          case "dia":
          case "dias":
            date.setDate(date.getDate() - amount);
            break;
          case "semana":
          case "semanas":
            date.setDate(date.getDate() - amount * 7);
            break;
          case "mês":
          case "meses":
            date.setMonth(date.getMonth() - amount);
            break;
          case "ano":
          case "anos":
            date.setFullYear(date.getFullYear() - amount);
            break;
        }

        return {
          success: true,
          date,
          originalInput: input,
        };
      }

      // Processar datas no formato brasileiro (DD/MM/YYYY ou DD/MM/YY)
      const brazilianDateMatch = normalizedInput.match(
        /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/
      );
      if (brazilianDateMatch) {
        const day = parseInt(brazilianDateMatch[1]);
        const month = parseInt(brazilianDateMatch[2]) - 1; // JavaScript months are 0-indexed
        let year = parseInt(brazilianDateMatch[3]);

        // Se o ano tem apenas 2 dígitos, assumir 20xx
        if (year < 100) {
          year += 2000;
        }

        const date = new Date(year, month, day);

        // Verificar se a data é válida
        if (
          date.getDate() === day &&
          date.getMonth() === month &&
          date.getFullYear() === year
        ) {
          return {
            success: true,
            date,
            originalInput: input,
          };
        }
      }

      // Processar datas no formato ISO (YYYY-MM-DD)
      const isoDateMatch = normalizedInput.match(
        /^(\d{4})-(\d{1,2})-(\d{1,2})$/
      );
      if (isoDateMatch) {
        const year = parseInt(isoDateMatch[1]);
        const month = parseInt(isoDateMatch[2]) - 1;
        const day = parseInt(isoDateMatch[3]);

        const date = new Date(year, month, day);

        if (
          date.getDate() === day &&
          date.getMonth() === month &&
          date.getFullYear() === year
        ) {
          return {
            success: true,
            date,
            originalInput: input,
          };
        }
      }

      // Tentar parsear como data JavaScript nativa
      const nativeDate = new Date(input);
      if (!isNaN(nativeDate.getTime())) {
        return {
          success: true,
          date: nativeDate,
          originalInput: input,
        };
      }

      return {
        success: false,
        error: `Não consegui entender a data "${input}". Use formatos como: "hoje", "ontem", "15/01/2025", "3 dias atrás"`,
        originalInput: input,
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro ao processar data "${input}": ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`,
        originalInput: input,
      };
    }
  }

  /**
   * Valida se uma data é válida e não está muito no futuro
   */
  validateDate(date: Date): { valid: boolean; error?: string } {
    const today = new Date();
    const maxFutureDate = new Date(today);
    maxFutureDate.setDate(maxFutureDate.getDate() + 365); // 1 ano no futuro

    if (isNaN(date.getTime())) {
      return { valid: false, error: "Data inválida" };
    }

    if (date > maxFutureDate) {
      return { valid: false, error: "Data muito no futuro (máximo 1 ano)" };
    }

    const minDate = new Date(1900, 0, 1);
    if (date < minDate) {
      return { valid: false, error: "Data muito antiga (mínimo 1900)" };
    }

    return { valid: true };
  }

  /**
   * Formata uma data para exibição em português
   */
  formatDate(date: Date): string {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  /**
   * Sugere formatos de data aceitos
   */
  getAcceptedFormats(): string[] {
    return [
      "hoje",
      "ontem",
      "amanhã",
      "15/01/2025",
      "15/01/25",
      "3 dias atrás",
      "1 semana atrás",
      "2025-01-15",
    ];
  }
}

export const dateParser = DateParser.getInstance();
