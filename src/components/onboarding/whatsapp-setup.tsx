"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  MessageCircle,
  CheckCircle2,
  Smartphone,
} from "lucide-react";

interface WhatsAppSetupProps {
  onNext: (phoneNumber: string) => void;
  onBack: () => void;
  phoneNumber?: string;
}

export function WhatsAppSetup({
  onNext,
  onBack,
  phoneNumber,
}: WhatsAppSetupProps) {
  const [phone, setPhone] = useState(phoneNumber || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validatePhone = (phone: string) => {
    const phoneRegex = /^(\+55\s?)?(\(?\d{2}\)?)?\s?\d{4,5}-?\d{4}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const formatPhone = (value: string) => {
    // Remove todos os caracteres não numéricos
    let numbers = value.replace(/\D/g, "");

    // Limita a 11 dígitos
    if (numbers.length > 11) {
      numbers = numbers.slice(0, 11);
    }

    // Aplica formatação
    if (numbers.length === 0) return "";
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 6)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(
        6
      )}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(
      7
    )}`;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setPhone(formatted);

    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: "" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!phone.trim()) {
      newErrors.phone = "Número de telefone é obrigatório";
    } else if (!validatePhone(phone)) {
      newErrors.phone = "Formato de telefone inválido";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onNext(phone);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20">
            <MessageCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">Configure seu WhatsApp</h1>
        <p className="text-lg text-muted-foreground">
          Conecte seu WhatsApp para receber notificações e interagir com o
          agente de IA
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Número do WhatsApp
          </CardTitle>
          <CardDescription>
            Este número será usado para enviar notificações e permitir que você
            interaja com o agente de IA via WhatsApp.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Número do WhatsApp *</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="(11) 99999-9999"
                className={errors.phone ? "border-red-500" : ""}
                maxLength={15}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            {/* Benefícios */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">
                O que você poderá fazer:
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Registrar transações por voz</p>
                    <p className="text-sm text-muted-foreground">
                      &quot;Registre uma venda de R$ 500&quot; e o agente
                      processará automaticamente
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Consultar saldo e relatórios</p>
                    <p className="text-sm text-muted-foreground">
                      &quot;Qual é meu saldo atual?&quot; ou &quot;Mostre as
                      despesas do mês&quot;
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Receber insights proativos</p>
                    <p className="text-sm text-muted-foreground">
                      Alertas sobre fluxo de caixa e sugestões de melhoria
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Categorização automática</p>
                    <p className="text-sm text-muted-foreground">
                      O agente sugere categorias baseadas na descrição da
                      transação
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button type="button" variant="outline" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <Button type="submit">Continuar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
