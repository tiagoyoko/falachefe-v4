"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Loader2, Mail, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const router = useRouter();
  const searchParams = useSearchParams();
  const urlMessage = searchParams.get("message");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setErrors({ email: "Email é obrigatório" });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: "Email inválido" });
      return;
    }

    setIsLoading(true);
    setMessage("");
    setErrors({});

    try {
      const result = await authClient.signIn.email({
        email,
        password: "", // Magic link não precisa de senha
        callbackURL: "/dashboard",
      });

      if (result.error) {
        setMessage(result.error.message || "Erro ao enviar link mágico.");
      } else {
        setIsMagicLinkSent(true);
        setMessage("Link mágico enviado! Verifique seu email.");
      }
    } catch (error) {
      setMessage("Erro inesperado ao enviar link mágico.");
      console.error("Erro ao enviar magic link:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setErrors({
        email: !email ? "Email é obrigatório" : "",
        password: !password ? "Senha é obrigatória" : "",
      });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: "Email inválido" });
      return;
    }

    setIsLoading(true);
    setMessage("");
    setErrors({});

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        setMessage(result.error.message || "Erro ao fazer login.");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      setMessage("Erro inesperado ao fazer login.");
      console.error("Erro ao fazer login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch (error) {
      setMessage("Erro ao fazer login com Google.");
      console.error("Erro ao fazer login com Google:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrors({ email: "Digite seu email primeiro" });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: "Email inválido" });
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const result = await authClient.forgetPassword({
        email,
        redirectTo: "/auth/reset-password",
      });

      if (result.error) {
        setMessage(
          result.error.message || "Erro ao enviar email de recuperação."
        );
      } else {
        setMessage(
          "Email de recuperação enviado! Verifique sua caixa de entrada."
        );
      }
    } catch (error) {
      setMessage("Erro inesperado ao enviar email de recuperação.");
      console.error("Erro ao enviar email de recuperação:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">🚀 FalaChefe</h1>
          <p className="mt-2 text-sm text-gray-600">Entre na sua conta</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-center">Login</CardTitle>
            <CardDescription className="text-center">
              Escolha como deseja fazer login
            </CardDescription>
          </CardHeader>

          <CardContent>
            {urlMessage && (
              <div className="mb-4 p-3 rounded-md bg-green-100 text-green-700 border border-green-200 text-sm">
                {urlMessage}
              </div>
            )}

            {message && (
              <div
                className={`mb-4 p-3 rounded-md text-sm ${
                  message.includes("enviado") || message.includes("sucesso")
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-red-100 text-red-700 border border-red-200"
                }`}
              >
                {message}
              </div>
            )}

            {isMagicLinkSent ? (
              <div className="text-center space-y-4">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Link Mágico Enviado!
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Verifique seu email e clique no link para fazer login.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsMagicLinkSent(false);
                    setMessage("");
                  }}
                  className="w-full"
                >
                  Enviar Novo Link
                </Button>
              </div>
            ) : (
              <Tabs defaultValue="magic-link" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="magic-link">Link Mágico</TabsTrigger>
                  <TabsTrigger value="password">Senha</TabsTrigger>
                </TabsList>

                <TabsContent value="magic-link" className="space-y-4">
                  <form onSubmit={handleEmailSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-magic">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email-magic"
                          type="email"
                          placeholder="seu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Enviar Link Mágico
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="password" className="space-y-4">
                  <form onSubmit={handlePasswordSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-password">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email-password"
                          type="email"
                          placeholder="seu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Sua senha"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-red-600">
                          {errors.password}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <Button
                        type="button"
                        variant="link"
                        onClick={handleForgotPassword}
                        className="p-0 h-auto text-sm"
                        disabled={isLoading}
                      >
                        Esqueceu a senha?
                      </Button>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Entrando...
                        </>
                      ) : (
                        "Entrar"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">
                    Ou continue com
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full"
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{" "}
                <Link
                  href="/auth/signup"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Criar conta
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
