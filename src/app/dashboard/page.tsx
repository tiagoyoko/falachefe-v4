"use client";

import { useSession } from "@/lib/auth-client";
import { UserProfile } from "@/components/auth/user-profile";
import { Button } from "@/components/ui/button";
import { Lock, ArrowRight } from "lucide-react";
import { useDiagnostics } from "@/hooks/use-diagnostics";
import { useOnboarding } from "@/hooks/use-onboarding";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const { isAiReady, loading: diagnosticsLoading } = useDiagnostics();
  const { needsOnboarding, isLoading: onboardingLoading } = useOnboarding();
  const router = useRouter();

  // Redirecionar para onboarding se necessário
  useEffect(() => {
    if (!isPending && !onboardingLoading && needsOnboarding) {
      router.push("/onboarding");
    }
  }, [isPending, onboardingLoading, needsOnboarding, router]);

  if (isPending || onboardingLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  // Se precisa fazer onboarding, mostrar uma tela de redirecionamento
  if (needsOnboarding) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Redirecionando para configuração...
          </p>
          <Button onClick={() => router.push("/onboarding")}>
            Ir para Configuração
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-8">
            <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Protected Page</h1>
            <p className="text-muted-foreground mb-6">
              You need to sign in to access the dashboard
            </p>
          </div>
          <UserProfile />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border border-border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">AI Chat</h2>
          <p className="text-muted-foreground mb-4">
            Start a conversation with AI using the Vercel AI SDK
          </p>
          {diagnosticsLoading || !isAiReady ? (
            <Button disabled={true}>Go to Chat</Button>
          ) : (
            <Button asChild>
              <Link href="/chat">Go to Chat</Link>
            </Button>
          )}
        </div>

        <div className="p-6 border border-border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Profile</h2>
          <p className="text-muted-foreground mb-4">
            Manage your account settings and preferences
          </p>
          <div className="space-y-2">
            <p>
              <strong>Name:</strong> {session.user.name}
            </p>
            <p>
              <strong>Email:</strong> {session.user.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
