"use client";

import Link from "next/link";
import { UserProfile } from "@/components/auth/user-profile";
import { ModeToggle } from "./ui/mode-toggle";
import { Bot, MessageSquare, Wallet } from "lucide-react";
import { useSession } from "@/lib/auth-client";

export function SiteHeader() {
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session);
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          <Link
            href="/"
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <Bot className="h-5 w-5" />
            </div>
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Fala Chefe!
            </span>
          </Link>
        </h1>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-4">
            {isLoggedIn && (
              <>
                <Link
                  href="/chat"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  Conversar
                </Link>
                <Link
                  href="/cashflow"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Wallet className="h-4 w-4" />
                  Financeiro
                </Link>
              </>
            )}
            {/* Marketing permanece oculto até existir a página */}
          </nav>
          <UserProfile />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
