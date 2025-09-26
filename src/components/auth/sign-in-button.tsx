"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function SignInButton() {
  const { user, loading, signInWithGoogle } = useAuth();

  if (loading) {
    return <Button disabled>Loading...</Button>;
  }

  if (user) {
    return null;
  }

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      console.error("Erro ao fazer login com Google:", error);
    }
  };

  return (
    <div className="flex gap-2">
      <Button asChild>
        <Link href="/auth/signin">Entrar</Link>
      </Button>
      <Button variant="outline" onClick={handleGoogleSignIn}>
        Google
      </Button>
    </div>
  );
}
