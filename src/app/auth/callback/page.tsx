"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Verificar se há parâmetros de erro na URL primeiro
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get("error");
        const errorDescription = urlParams.get("error_description");

        if (error) {
          console.error("Erro OAuth na URL:", error, errorDescription);
          setStatus("error");
          setMessage(`Erro de autenticação: ${errorDescription || error}`);
          return;
        }

        // Tentar processar o callback OAuth
        console.log("Processando callback OAuth...");
        const { data: callbackData, error: callbackError } =
          await supabase.auth.getSession();

        if (callbackError) {
          console.error("Erro no callback OAuth:", callbackError);
          setStatus("error");
          setMessage(
            "Erro ao processar autenticação: " + callbackError.message
          );
          return;
        }

        if (callbackData.session) {
          console.log("Sessão encontrada:", callbackData.session.user.email);
          setStatus("success");
          setMessage("Login realizado com sucesso! Redirecionando...");

          // Redirecionar para o dashboard após 2 segundos
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        } else {
          console.log("Nenhuma sessão encontrada");
          setStatus("error");
          setMessage("Sessão não encontrada. Tente fazer login novamente.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Erro inesperado ao processar autenticação.");
        console.error("Erro no callback de autenticação:", error);
      }
    };

    handleAuthCallback();
  }, [supabase.auth, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Processando Login
          </CardTitle>
          <CardDescription className="text-center">
            Aguarde enquanto processamos sua autenticação...
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === "loading" && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-gray-600">Processando...</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <p className="text-sm text-green-600">{message}</p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="h-8 w-8 text-red-600" />
              <p className="text-sm text-red-600">{message}</p>
              <button
                onClick={() => router.push("/auth/signin")}
                className="text-sm text-blue-600 hover:text-blue-500 underline"
              >
                Tentar novamente
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
