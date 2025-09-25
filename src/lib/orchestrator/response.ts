export async function extractAgentMessage(
  response: unknown
): Promise<string | null> {
  try {
    if (response == null) return null;

    // Nosso formato local (supervisor): { message: string }
    if (
      typeof response === "object" &&
      response !== null &&
      "message" in response &&
      typeof (response as Record<string, unknown>).message === "string"
    ) {
      return (response as Record<string, unknown>).message as string;
    }

    // Agent Squad: { output: string | AsyncIterable }
    if (
      typeof response === "object" &&
      response !== null &&
      "output" in response
    ) {
      const output = (response as Record<string, unknown>).output as unknown;
      if (typeof output === "string") return output;
      if (
        output &&
        typeof output === "object" &&
        Symbol.asyncIterator in (output as object)
      ) {
        let acc = "";
        for await (const chunk of output as AsyncIterable<unknown>) {
          if (typeof chunk === "string") acc += chunk;
          else if (
            chunk &&
            typeof chunk === "object" &&
            "text" in (chunk as Record<string, unknown>)
          ) {
            const txt = (chunk as Record<string, unknown>).text;
            acc += typeof txt === "string" ? txt : "";
          }
        }
        return acc || null;
      }
    }

    // Caso seja uma string direta
    if (typeof response === "string") return response;

    return null;
  } catch {
    return null;
  }
}
