"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";

interface OnboardingStatus {
  onboardingCompleted: boolean;
  currentStep: string;
}

export function useOnboarding() {
  const { data: session, isPending: sessionLoading } = useSession();
  const [onboardingStatus, setOnboardingStatus] =
    useState<OnboardingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkOnboardingStatus() {
      if (!session?.user?.id || sessionLoading) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/onboarding");

        if (!response.ok) {
          throw new Error("Erro ao verificar status do onboarding");
        }

        const data = await response.json();
        setOnboardingStatus(data);
      } catch (error) {
        console.error("Erro ao verificar onboarding:", error);
        setError(error instanceof Error ? error.message : "Erro desconhecido");
        // Em caso de erro, assumir que o onboarding não foi concluído
        setOnboardingStatus({
          onboardingCompleted: false,
          currentStep: "welcome",
        });
      } finally {
        setIsLoading(false);
      }
    }

    checkOnboardingStatus();
  }, [session, sessionLoading]);

  const markOnboardingComplete = () => {
    setOnboardingStatus({
      onboardingCompleted: true,
      currentStep: "completed",
    });
  };

  return {
    onboardingStatus,
    isLoading: isLoading || sessionLoading,
    error,
    needsOnboarding:
      session?.user?.id &&
      onboardingStatus &&
      !onboardingStatus.onboardingCompleted,
    markOnboardingComplete,
  };
}
