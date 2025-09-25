"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  MessageSquare,
  Wallet,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Clock,
  Target,
} from "lucide-react";

interface OnboardingCompletionProps {
  onComplete: () => void;
  userData: {
    userName: string;
    companyName: string;
    whatsappNumber?: string | null;
    selectedFeatures: string[];
    categoriesCount: number;
  };
}

export function OnboardingCompletion({
  onComplete,
  userData,
}: OnboardingCompletionProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const completionSteps = [
    "Configurando sua conta...",
    "Criando categorias personalizadas...",
    "Preparando agentes de IA...",
    "Finalizando configuração...",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= completionSteps.length - 1) {
          clearInterval(stepTimer);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);

    return () => {
      clearInterval(timer);
      clearInterval(stepTimer);
    };
  }, [completionSteps.length]);

  const featureMap = {
    financial: {
      name: "Gestão Financeira",
      icon: Wallet,
      color: "text-green-600",
    },
    sales: {
      name: "Vendas e Clientes",
      icon: TrendingUp,
      color: "text-blue-600",
    },
    marketing: {
      name: "Marketing",
      icon: MessageSquare,
      color: "text-purple-600",
    },
  };

  const nextSteps = [
    {
      title: "Converse com o Fala Chefe",
      description:
        "Experimente comandos como: 'Registre uma venda de R$ 500 para cliente João'",
      icon: MessageSquare,
      action: "Ir para o Chat",
    },
    {
      title: "Configure seu WhatsApp",
      description:
        "Conecte seu número para receber lembretes e usar comandos por áudio",
      icon: MessageSquare,
      action: "Configurar Depois",
    },
    {
      title: "Explore o Dashboard",
      description: "Veja seus primeiros insights financeiros e relatórios",
      icon: Wallet,
      action: "Ver Dashboard",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header de sucesso */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">
          Parabéns, {userData.userName}! 🎉
        </h1>
        <p className="text-lg text-muted-foreground">
          Sua conta está pronta! O <strong>{userData.companyName}</strong> agora
          tem seu time de agentes de IA.
        </p>
      </div>

      {/* Progress da configuração */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                Configurando seu ambiente...
              </span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {completionSteps[currentStep]}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Resumo da configuração */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Configuração Concluída
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Áreas ativadas:
              </span>
              <Badge variant="secondary">
                {userData.selectedFeatures.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {userData.selectedFeatures.map((feature) => {
                const featureInfo =
                  featureMap[feature as keyof typeof featureMap];
                if (!featureInfo) return null;
                const Icon = featureInfo.icon;

                return (
                  <div key={feature} className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${featureInfo.color}`} />
                    <span className="text-sm">{featureInfo.name}</span>
                    <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto" />
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm text-muted-foreground">
                Categorias criadas:
              </span>
              <Badge variant="secondary">{userData.categoriesCount}</Badge>
            </div>

            {userData.whatsappNumber && (
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">
                  WhatsApp configurado:
                </span>
                <Badge variant="outline" className="text-green-600">
                  {userData.whatsappNumber}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />O que você pode fazer
              agora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mt-0.5">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Registrar transações</p>
                  <p className="text-xs text-muted-foreground">
                    Diga: &quot;Recebi R$ 200 pela venda&quot;
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mt-0.5">
                  <span className="text-xs font-bold text-purple-600">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Ver relatórios</p>
                  <p className="text-xs text-muted-foreground">
                    Pergunte: &quot;Como está meu mês?&quot;
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mt-0.5">
                  <span className="text-xs font-bold text-green-600">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Receber lembretes</p>
                  <p className="text-xs text-muted-foreground">
                    Configure para lembrar de contas
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Próximos passos */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Passos</CardTitle>
          <CardDescription>
            Escolha como quer começar a usar o Fala Chefe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {nextSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    {step.action}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dica especial */}
      <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950 border-orange-200 dark:border-orange-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-orange-800 dark:text-orange-200">
                💡 Dica do Chefe
              </h4>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                Nos primeiros dias, experimente conversar naturalmente comigo.
                Diga coisas como &quot;registre uma despesa&quot;, &quot;como
                está meu fluxo de caixa&quot; ou &quot;me lembre de pagar o
                aluguel dia 10&quot;. Quanto mais você usar, mais personalizado
                eu fico para seu negócio!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão principal */}
      <div className="flex justify-center">
        <Button
          onClick={onComplete}
          size="lg"
          className="min-w-[300px]"
          disabled={progress < 100}
        >
          {progress < 100 ? "Finalizando..." : "Começar a usar o Fala Chefe"}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
