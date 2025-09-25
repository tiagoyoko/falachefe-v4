"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileSpreadsheet,
  MessageSquare,
  Lock,
} from "lucide-react";

interface CashflowSummary {
  periodo: {
    inicio: string;
    fim: string;
  };
  resumo: {
    receitas: number;
    despesas: number;
    saldo: number;
    totalTransacoes: number;
  };
  transacoes: Array<{
    id: string;
    description: string;
    amount: string;
    type: "receita" | "despesa";
    transactionDate: string;
    category?: {
      name: string;
      color: string;
    };
  }>;
  planilhas: Array<{
    id: string;
    name: string;
    googleSheetUrl: string;
  }>;
}

export default function CashflowPage() {
  const {} = useAuth();
  const [summary, setSummary] = useState<CashflowSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [agentCommand, setAgentCommand] = useState("");
  const [agentResponse, setAgentResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Usar o ID do usuário autenticado (placeholder)
  const userId = "placeholder-user-id"; // TODO: Implementar obtenção real do user ID

  const fetchCashflowSummary = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/cashflow?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setSummary(data.data);
      }
    } catch {
      console.error("Erro ao buscar resumo");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchCashflowSummary();
    }
  }, [userId, fetchCashflowSummary]);

  const processAgentCommand = async () => {
    if (!agentCommand.trim()) return;

    try {
      setIsProcessing(true);
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          command: agentCommand,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAgentResponse(data.data.message);

        // Executar ações sugeridas automaticamente
        if (
          data.data.suggestedActions &&
          data.data.suggestedActions.length > 0
        ) {
          for (const action of data.data.suggestedActions) {
            await executeAction(action);
          }
        }

        // Atualizar resumo após comando
        fetchCashflowSummary();
      } else {
        setAgentResponse(`❌ Erro: ${data.error}`);
      }
    } catch {
      setAgentResponse("❌ Erro ao processar comando");
    } finally {
      setIsProcessing(false);
    }
  };

  // Função para executar ações sugeridas pelo agente
  const executeAction = async (action: {
    action: string;
    params: Record<string, unknown>;
  }) => {
    try {
      switch (action.action) {
        case "create_spreadsheet":
          await fetch("/api/cashflow", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              name: action.params.name,
              googleSheetId: `sheet_${Date.now()}`,
              googleSheetUrl: `https://docs.google.com/spreadsheets/d/sheet_${Date.now()}`,
            }),
          });
          break;

        case "create_transaction":
        case "confirm_transaction":
          const response = await fetch("/api/transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              ...action.params,
              confirmTransaction: action.action === "confirm_transaction",
            }),
          });

          const result = await response.json();
          if (result.success) {
            console.log("✅ Transação registrada com sucesso:", result.data);
          } else {
            console.error("❌ Erro ao registrar transação:", result.error);
          }
          break;

        case "get_cashflow_summary":
          await fetchCashflowSummary();
          break;

        default:
          console.log("Ação não implementada:", action.action);
      }
    } catch (error) {
      console.error("Erro ao executar ação:", error);
    }
  };

  const createSpreadsheet = async () => {
    try {
      const response = await fetch("/api/cashflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          name: "Fluxo de Caixa - Minha Empresa",
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Planilha criada com sucesso!");
        fetchCashflowSummary();
      } else {
        alert(`Erro: ${data.error}`);
      }
    } catch {
      alert("Erro ao criar planilha");
    }
  };

  if (false) {
    // TODO: Implementar verificação de pending
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (false) {
    // TODO: Implementar verificação de sessão
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-8">
            <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Acesso Restrito</h1>
            <p className="text-muted-foreground mb-6">
              Você precisa fazer login para acessar o fluxo de caixa
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Carregando fluxo de caixa...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fluxo de Caixa</h1>
          <p className="text-foreground/80">
            Gerencie suas finanças com o agente inteligente
          </p>
        </div>
        <Button onClick={createSpreadsheet} className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Nova Planilha
        </Button>
      </div>

      {/* Resumo Financeiro */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                Receitas
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R${" "}
                {summary.resumo.receitas.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                Despesas
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                R${" "}
                {summary.resumo.despesas.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                Saldo
              </CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  summary.resumo.saldo >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                R${" "}
                {summary.resumo.saldo.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                Transações
              </CardTitle>
              <FileSpreadsheet className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.resumo.totalTransacoes}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Agente de IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <MessageSquare className="h-5 w-5" />
            Agente de Fluxo de Caixa
          </CardTitle>
          <CardDescription className="text-foreground/80">
            Digite comandos em português natural para gerenciar suas finanças
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={agentCommand}
              onChange={(e) => setAgentCommand(e.target.value)}
              placeholder="Ex: Registre receita de R$ 500 da venda para cliente X"
              className="flex-1 px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
              onKeyPress={(e) => e.key === "Enter" && processAgentCommand()}
            />
            <Button
              onClick={processAgentCommand}
              disabled={isProcessing || !agentCommand.trim()}
            >
              {isProcessing ? "Processando..." : "Enviar"}
            </Button>
          </div>

          {agentResponse && (
            <div className="p-4 bg-muted rounded-md">
              <div className="whitespace-pre-wrap text-foreground">
                {agentResponse}
              </div>
            </div>
          )}

          <div className="text-sm text-foreground/80">
            <p>
              <strong>Comandos disponíveis:</strong>
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>&quot;Criar fluxo de caixa&quot;</li>
              <li>&quot;Registre receita de R$ 500 da venda&quot;</li>
              <li>&quot;Registre despesa de R$ 300 para fornecedor&quot;</li>
              <li>&quot;Quanto tenho de receita este mês?&quot;</li>
              <li>&quot;Listar minhas categorias&quot;</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Transações Recentes */}
      {summary && summary.transacoes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">
              Transações Recentes
            </CardTitle>
            <CardDescription className="text-foreground/80">
              Últimas {summary.transacoes.length} transações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.transacoes.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        transaction.type === "receita"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    />
                    <div>
                      <p className="font-medium text-foreground">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-foreground/70">
                        {new Date(
                          transaction.transactionDate
                        ).toLocaleDateString("pt-BR")}
                        {transaction.category && (
                          <Badge
                            variant="secondary"
                            className="ml-2"
                            style={{
                              backgroundColor: transaction.category.color,
                            }}
                          >
                            {transaction.category.name}
                          </Badge>
                        )}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`font-bold ${
                      transaction.type === "receita"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "receita" ? "+" : "-"}R${" "}
                    {parseFloat(transaction.amount).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Planilhas */}
      {summary && summary.planilhas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">
              Planilhas Google Sheets
            </CardTitle>
            <CardDescription className="text-foreground/80">
              Suas planilhas de fluxo de caixa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {summary.planilhas.map((spreadsheet) => (
                <div
                  key={spreadsheet.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-foreground">
                      {spreadsheet.name}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(spreadsheet.googleSheetUrl, "_blank")
                    }
                  >
                    Abrir
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
