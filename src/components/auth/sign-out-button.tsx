"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function SignOutButton() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();

      if (error) {
        toast.error("Erro ao fazer logout: " + error.message);
      } else {
        toast.success("Logout realizado com sucesso!");
        router.push("/auth/signin");
      }
    } catch {
      toast.error("Erro inesperado ao fazer logout");
    }
  };

  return (
    <Button variant="outline" onClick={handleSignOut}>
      Sair
    </Button>
  );
}
