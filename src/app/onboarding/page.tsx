import { Metadata } from "next";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

export const metadata: Metadata = {
  title: "Configuração da Conta - Fala Chefe!",
  description:
    "Configure sua conta e comece a usar o Fala Chefe para gerenciar seu negócio",
};

export default function OnboardingPage() {
  return <OnboardingFlow />;
}
