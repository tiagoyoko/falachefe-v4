"use client";

import { signIn, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function SignInButton() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <Button disabled>Loading...</Button>;
  }

  if (session) {
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
          await signIn.social({
            provider: "google",
            callbackURL: "/dashboard", // O dashboard já vai redirecionar para onboarding se necessário
          });
        }}
      >
        Google
      </Button>
    </div>
  );
}
