import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bot, MessageSquare, TrendingUp, Wallet } from "lucide-react";
import { SignInButton } from "@/components/auth/sign-in-button";

export default function Home() {
  return (
    <main className="flex-1 container mx-auto px-4 py-16">
      <div className="max-w-5xl mx-auto text-center space-y-10">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
              <Bot className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
              Fala Chefe!
            </h1>
          </div>
          <h2 className="text-2xl font-semibold text-muted-foreground">
            Seu time de agentes de IA no WhatsApp
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Automação prática para pequenos negócios em Marketing, Vendas e
            Finanças. Conversas naturais, respostas proativas e execução direta
            no canal que você já usa todos os dias.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <SignInButton />
          <Button asChild variant="outline">
            <Link href="/chat">Experimentar o agente</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 text-left">
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Marketing
            </h3>
            <p className="text-sm text-muted-foreground">
              Conteúdos, mensagens e ideias prontas para publicar via WhatsApp.
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Vendas
            </h3>
            <p className="text-sm text-muted-foreground">
              Respostas rápidas, follow-ups e organização de oportunidades.
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Financeiro
            </h3>
            <p className="text-sm text-muted-foreground">
              Registro de receitas e despesas com categorização inteligente.
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Ao prosseguir, você concorda em usar a plataforma apenas com dados que
          você tem direito de processar. Estamos comprometidos com LGPD.
        </p>
      </div>
    </main>
  );
}
