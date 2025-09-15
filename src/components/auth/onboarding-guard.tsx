"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useOnboarding } from "@/hooks/use-onboarding";

interface OnboardingGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  allowUnauthenticated?: boolean;
}

export function OnboardingGuard({
  children,
  redirectTo = "/onboarding",
  allowUnauthenticated = false,
}: OnboardingGuardProps) {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  const { needsOnboarding, isLoading: onboardingLoading } = useOnboarding();

  useEffect(() => {
    // Se ainda está carregando, não fazer nada
    if (sessionLoading || onboardingLoading) {
      return;
    }

    // Se não está autenticado e não permite não autenticado, redirecionar para home
    if (!session && !allowUnauthenticated) {
      router.push("/");
      return;
    }

    // Se está autenticado mas precisa fazer onboarding, redirecionar
    if (session && needsOnboarding) {
      router.push(redirectTo);
      return;
    }
  }, [
    session,
    sessionLoading,
    needsOnboarding,
    onboardingLoading,
    router,
    redirectTo,
    allowUnauthenticated,
  ]);

  // Mostrar loading enquanto verifica
  if (sessionLoading || onboardingLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado e não permite, não mostrar nada (redirecionamento acontecerá)
  if (!session && !allowUnauthenticated) {
    return null;
  }

  // Se precisa fazer onboarding, não mostrar nada (redirecionamento acontecerá)
  if (session && needsOnboarding) {
    return null;
  }

  // Se tudo está ok, mostrar o conteúdo
  return <>{children}</>;
}
