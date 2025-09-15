"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { OnboardingWelcome } from "./onboarding-welcome";
import { CompanyInfoForm, type CompanyFormData } from "./company-info-form";
import { CategoriesSetup, type CategoriesData } from "./categories-setup";
import { OnboardingCompletion } from "./onboarding-completion";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Building2, Settings, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type OnboardingStep = "welcome" | "company" | "categories" | "completion";

interface OnboardingData {
  selectedFeatures: string[];
  companyInfo: CompanyFormData | null;
  categoriesData: CategoriesData | null;
}

export function OnboardingFlow() {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    selectedFeatures: [],
    companyInfo: null,
    categoriesData: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const steps = [
    { id: "welcome", title: "Boas-vindas", icon: CheckCircle2 },
    { id: "company", title: "Empresa", icon: Building2 },
    { id: "categories", title: "Categorias", icon: Settings },
    { id: "completion", title: "Conclusão", icon: CheckCircle2 },
  ];

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  const handleWelcomeNext = (selectedFeatures: string[]) => {
    setOnboardingData((prev) => ({
      ...prev,
      selectedFeatures,
    }));
    setCurrentStep("company");
  };

  const handleCompanyNext = (companyInfo: CompanyFormData) => {
    setOnboardingData((prev) => ({
      ...prev,
      companyInfo,
    }));
    setCurrentStep("categories");
  };

  const handleCategoriesNext = (categoriesData: CategoriesData) => {
    setOnboardingData((prev) => ({
      ...prev,
      categoriesData,
    }));
    setCurrentStep("completion");
  };

  const handleComplete = async () => {
    setIsLoading(true);

    try {
      // Mostrar toast de progresso
      toast.loading("Salvando suas configurações...", { id: "onboarding" });

      // Salvar dados do onboarding
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedFeatures: onboardingData.selectedFeatures,
          companyInfo: onboardingData.companyInfo,
          categoriesData: onboardingData.categoriesData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erro ao salvar dados do onboarding"
        );
      }

      // Sucesso
      toast.success("Configuração concluída com sucesso! 🎉", {
        id: "onboarding",
      });

      // Aguardar um momento para mostrar o sucesso
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Erro no onboarding:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro inesperado. Tente novamente.",
        { id: "onboarding" }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case "company":
        setCurrentStep("welcome");
        break;
      case "categories":
        setCurrentStep("company");
        break;
      case "completion":
        setCurrentStep("categories");
        break;
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              Você precisa estar logado para acessar o onboarding.
            </p>
            <Button onClick={() => router.push("/")} className="mt-4">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header com progresso */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {currentStep !== "welcome" && currentStep !== "completion" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                disabled={isLoading}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">Configuração da Conta</h2>
                <span className="text-sm text-muted-foreground">
                  {currentStepIndex + 1} de {steps.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={progressPercentage} className="flex-1 h-2" />
                <span className="text-xs text-muted-foreground min-w-[3rem]">
                  {Math.round(progressPercentage)}%
                </span>
              </div>

              {/* Step indicators */}
              <div className="flex items-center gap-2 mt-3">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = step.id === currentStep;
                  const isCompleted = index < currentStepIndex;

                  return (
                    <div
                      key={step.id}
                      className={`flex items-center gap-2 text-xs ${
                        isActive
                          ? "text-primary font-medium"
                          : isCompleted
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      <Icon
                        className={`h-3 w-3 ${
                          isCompleted ? "text-green-600" : ""
                        }`}
                      />
                      <span className="hidden sm:inline">{step.title}</span>
                      {index < steps.length - 1 && (
                        <div className="w-8 h-px bg-border mx-1" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="container mx-auto py-8">
        {currentStep === "welcome" && (
          <OnboardingWelcome
            onNext={handleWelcomeNext}
            userName={session.user.name || undefined}
          />
        )}

        {currentStep === "company" && (
          <CompanyInfoForm
            onNext={handleCompanyNext}
            onBack={handleBack}
            initialData={onboardingData.companyInfo || undefined}
          />
        )}

        {currentStep === "categories" && (
          <CategoriesSetup
            onNext={handleCategoriesNext}
            onBack={handleBack}
            businessSegment={onboardingData.companyInfo?.segment}
          />
        )}

        {currentStep === "completion" && (
          <OnboardingCompletion
            onComplete={handleComplete}
            userData={{
              userName: session.user.name || "Usuário",
              companyName: onboardingData.companyInfo?.name || "Sua Empresa",
              selectedFeatures: onboardingData.selectedFeatures,
              categoriesCount:
                (onboardingData.categoriesData?.selectedCategories.length ||
                  0) +
                (onboardingData.categoriesData?.customCategories.length || 0),
            }}
          />
        )}
      </div>
    </div>
  );
}
