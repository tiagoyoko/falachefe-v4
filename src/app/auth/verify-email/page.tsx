"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "expired"
  >("loading");
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token de verificação não encontrado.");
      return;
    }

    const verifyEmail = async () => {
      try {
        // TODO: Implementar verificação de email com Supabase
        // const result = await supabase.auth.verifyOtp({
        //   token_hash: token,
        //   type: 'email'
        // });

        // Por enquanto, simular sucesso
        const result = { error: null as { message?: string } | null };

        if (result.error) {
          if (result.error.message?.includes("expired")) {
            setStatus("expired");
            setMessage("O link de verificação expirou. Solicite um novo link.");
          } else {
            setStatus("error");
            setMessage(result.error.message || "Erro ao verificar email.");
          }
        } else {
          setStatus("success");
          setMessage("Email verificado com sucesso! Redirecionando...");

          // Redirecionar para o dashboard após 2 segundos
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        }
      } catch (error) {
        setStatus("error");
        setMessage("Erro inesperado ao verificar email.");
        console.error("Erro ao verificar email:", error);
      }
    };

    verifyEmail();
  }, [token, router]);

  const handleResendEmail = async () => {
    try {
      // Aqui você pode implementar a lógica para reenviar o email
      // Por enquanto, vamos redirecionar para a página de login
      router.push(
        "/auth/signin?message=Verifique seu email para o link de verificação"
      );
    } catch (error) {
      console.error("Erro ao reenviar email:", error);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "loading":
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />;
      case "success":
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case "error":
      case "expired":
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "border-green-200 bg-green-50";
      case "error":
      case "expired":
        return "border-red-200 bg-red-50";
      default:
        return "border-blue-200 bg-blue-50";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">🚀 FalaChefe</h1>
          <p className="mt-2 text-sm text-gray-600">Verificação de Email</p>
        </div>

        <Card className={`${getStatusColor()}`}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">{getStatusIcon()}</div>
            <CardTitle className="text-xl">
              {status === "loading" && "Verificando..."}
              {status === "success" && "Email Verificado!"}
              {status === "error" && "Erro na Verificação"}
              {status === "expired" && "Link Expirado"}
            </CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {status === "success" && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Seu email foi verificado com sucesso. Você será redirecionado
                  automaticamente.
                </p>
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="w-full"
                >
                  Ir para o Dashboard
                </Button>
              </div>
            )}

            {(status === "error" || status === "expired") && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    {status === "expired"
                      ? "O link de verificação expirou. Solicite um novo link."
                      : "Não foi possível verificar seu email. Tente novamente."}
                  </p>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={handleResendEmail}
                    variant="outline"
                    className="w-full"
                  >
                    Solicitar Novo Link
                  </Button>

                  <Button
                    onClick={() => router.push("/auth/signin")}
                    className="w-full"
                  >
                    Voltar ao Login
                  </Button>
                </div>
              </div>
            )}

            {status === "loading" && (
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Aguarde enquanto verificamos seu email...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">🚀 FalaChefe</h1>
              <p className="mt-2 text-sm text-gray-600">Carregando...</p>
            </div>
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
                <CardTitle className="text-xl">Carregando...</CardTitle>
                <CardDescription>
                  Aguarde enquanto carregamos a página...
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
