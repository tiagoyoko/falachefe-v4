import { Agent, AgentName, AgentResponse } from "./types";
import { leo } from "./leo";
import { max } from "./max";
import { lia } from "./lia";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

const routerModel = openai(process.env.OPENAI_MODEL || "gpt-4o-mini");

const AGENTS: Record<AgentName, Agent> = {
  leo,
  max,
  lia,
  geral: {
    name: "geral",
    persona: {
      displayName: "Geral",
      description: "Apoio geral ao empreendedor.",
      tone: "Amigável, prático e objetivo.",
    },
    async handle({ userId, message, agent }) {
      // fallback simples: encaminhar para Max, que tende a respostas úteis gerais
      return max.handle({ userId, message, agent });
    },
  },
};

function heuristicRoute(text: string): AgentName | null {
  const t = (text || "").toLowerCase();
  if (/(fluxo de caixa|despesa|receita|categoria|saldo|relat[óo]rio)/.test(t))
    return "leo";
  if (
    /(marketing|instagram|whatsapp|campanha|venda|clientes|promo[cç][aã]o|datas sazonais)/.test(
      t
    )
  )
    return "max";
  if (
    /(contrata[cç][aã]o|recrutamento|clima|lideran[çc]a|conflito|feedback|rh)/.test(
      t
    )
  )
    return "lia";
  return null;
}

export async function supervise({
  userId,
  message,
}: {
  userId: string;
  message: string;
}): Promise<AgentResponse> {
  const byHeuristic = heuristicRoute(message);
  let target: AgentName = byHeuristic || "geral";

  if (!byHeuristic) {
    // Classificação leve via LLM
    const system = `Classifique a mensagem do usuário em: leo (financeiro), max (marketing/vendas), lia (rh) ou geral. Responda somente com uma dessas palavras.`;
    const res = await generateText({
      model: routerModel,
      system,
      prompt: message,
      temperature: 0,
    });
    const out = (res.text || "").trim().toLowerCase();
    if (out === "leo" || out === "max" || out === "lia" || out === "geral") {
      target = out as AgentName;
    }
  }

  // Passar o agente selecionado para manter contexto
  return AGENTS[target].handle({ userId, message, agent: target });
}
