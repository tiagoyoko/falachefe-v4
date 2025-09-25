import { getSession } from "@/lib/auth-client";
import React from "react";
import { AgentSettingsForm } from "@/components/agent-settings-form";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface AgentConfigRecord {
  agent: string;
  settings: Record<string, unknown>;
}

async function fetchAgentConfigs(
  baseUrl: string
): Promise<AgentConfigRecord[]> {
  const cookieStore = cookies();
  const res = await fetch(`${baseUrl}/api/agent-config`, {
    cache: "no-store",
    headers: {
      cookie: cookieStore.toString(),
    },
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json?.data || [];
}

export default async function AgentSettingsPage() {
  const session = await getSession();
  const user = (session as { data?: { user?: { id?: string } } })?.data?.user;
  const userId = user?.id;

  if (!userId) {
    redirect("/login");
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const configs = await fetchAgentConfigs(baseUrl);

  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Configuração dos Agentes</h1>
        <p className="text-sm text-muted-foreground">
          Personalize o comportamento e escopo de cada agente especialista.
        </p>
      </div>
      <AgentSettingsForm initialConfigs={configs} />
    </div>
  );
}
