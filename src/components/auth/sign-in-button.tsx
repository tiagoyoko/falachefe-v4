"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function SignInButton() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Button disabled>Loading...</Button>;
  }

  if (user) {
    return null;
  }

  return (
    <div className="flex gap-2">
      <Button asChild>
        <Link href="/auth/signin">Entrar</Link>
      </Button>
      <Button
        variant="outline"
        onClick={async () => {
          // TODO: Implementar signIn
          console.log("Google sign-in clicked");
        }}
      >
        Google
      </Button>
    </div>
  );
}
