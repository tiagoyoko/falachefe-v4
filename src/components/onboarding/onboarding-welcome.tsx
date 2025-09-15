"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bot,
  CheckCircle2,
  MessageSquare,
  Wallet,
  TrendingUp,
} from "lucide-react";

interface OnboardingWelcomeProps {
  onNext: (selectedFeatures: string[]) => void;
  userName?: string;
}

export function OnboardingWelcome({
  onNext,
  userName,
}: OnboardingWelcomeProps) {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const features = [
    {
      id: "financial",
      title: "Gestão Financeira",
      description: "Controle suas receitas, despesas e fluxo de caixa",
      icon: Wallet,
      color: "text-green-600",
    },
    {
      id: "sales",
      title: "Vendas e Clientes",
      description: "Acompanhe vendas e gerencie relacionamento com clientes",
      icon: TrendingUp,
      color: "text-blue-600",
    },
    {
      id: "marketing",
      title: "Marketing",
      description: "Estratégias e campanhas para fazer seu negócio crescer",
      icon: MessageSquare,
      color: "text-purple-600",
    },
  ];

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureId)
        ? prev.filter((id) => id !== featureId)
        : [...prev, featureId]
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <Bot className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">
          Bem-vindo ao Fala Chefe{userName ? `, ${userName}` : ""}!
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Vamos configurar sua conta em poucos minutos. Primeiro, me conte quais
          áreas do seu negócio você gostaria de otimizar:
        </p>
      </div>

      {/* Feature Selection */}
      <div className="grid md:grid-cols-3 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          const isSelected = selectedFeatures.includes(feature.id);

          return (
            <Card
              key={feature.id}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"
              }`}
              onClick={() => toggleFeature(feature.id)}
            >
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="relative">
                    <Icon className={`h-8 w-8 ${feature.color}`} />
                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 text-primary absolute -top-1 -right-1 bg-white rounded-full" />
                    )}
                  </div>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Benefits */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-xl">
            Por que o Fala Chefe é diferente?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold">Conversa Natural</h4>
                <p className="text-sm text-muted-foreground">
                  Use o WhatsApp que você já conhece. Fale ou digite
                  naturalmente.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold">Assistente Proativo</h4>
                <p className="text-sm text-muted-foreground">
                  Receba lembretes e insights sem precisar pedir.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold">Execução Automática</h4>
                <p className="text-sm text-muted-foreground">
                  Diga &quot;registre uma venda de R$ 500&quot; e está feito.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold">Foco no Crescimento</h4>
                <p className="text-sm text-muted-foreground">
                  Menos tempo em planilhas, mais tempo fazendo negócios.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Continue Button */}
      <div className="flex justify-center">
        <Button
          onClick={() => onNext(selectedFeatures)}
          size="lg"
          className="min-w-[200px]"
          disabled={selectedFeatures.length === 0}
        >
          {selectedFeatures.length === 0
            ? "Selecione pelo menos uma área"
            : `Continuar (${selectedFeatures.length} área${
                selectedFeatures.length > 1 ? "s" : ""
              } selecionada${selectedFeatures.length > 1 ? "s" : ""})`}
        </Button>
      </div>
    </div>
  );
}
