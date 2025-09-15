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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, ArrowLeft } from "lucide-react";

interface CompanyInfoFormProps {
  onNext: (data: CompanyFormData) => void;
  onBack: () => void;
  initialData?: Partial<CompanyFormData>;
}

export interface CompanyFormData {
  name: string;
  segment: string;
  businessSize: string;
  monthlyRevenue: string;
  employeeCount: string;
  description: string;
  city: string;
  state: string;
  phone: string;
  cnpj?: string;
  website?: string;
}

const segments = [
  "Alimentação e Bebidas",
  "Varejo e Comércio",
  "Serviços Gerais",
  "Beleza e Estética",
  "Saúde e Bem-estar",
  "Educação e Treinamento",
  "Tecnologia",
  "Consultoria",
  "Construção e Reformas",
  "Transporte e Logística",
  "Turismo e Hospitalidade",
  "Moda e Vestuário",
  "Artesanato e Arte",
  "Agronegócio",
  "Outro",
];

const businessSizes = [
  { value: "mei", label: "MEI (até R$ 81 mil/ano)" },
  { value: "micro", label: "Microempresa (até R$ 360 mil/ano)" },
  { value: "pequeno", label: "Pequeno Porte (até R$ 4,8 milhões/ano)" },
  { value: "medio", label: "Médio Porte" },
];

const revenueRanges = [
  "Até R$ 5.000",
  "R$ 5.001 - R$ 15.000",
  "R$ 15.001 - R$ 30.000",
  "R$ 30.001 - R$ 50.000",
  "R$ 50.001 - R$ 100.000",
  "Acima de R$ 100.000",
];

const employeeCounts = [
  "Só eu",
  "2-5 pessoas",
  "6-10 pessoas",
  "11-20 pessoas",
  "Mais de 20 pessoas",
];

export function CompanyInfoForm({
  onNext,
  onBack,
  initialData = {},
}: CompanyInfoFormProps) {
  const [formData, setFormData] = useState<CompanyFormData>({
    name: initialData.name || "",
    segment: initialData.segment || "",
    businessSize: initialData.businessSize || "",
    monthlyRevenue: initialData.monthlyRevenue || "",
    employeeCount: initialData.employeeCount || "",
    description: initialData.description || "",
    city: initialData.city || "",
    state: initialData.state || "",
    phone: initialData.phone || "",
    cnpj: initialData.cnpj || "",
    website: initialData.website || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome da empresa é obrigatório";
    }

    if (!formData.segment) {
      newErrors.segment = "Segmento é obrigatório";
    }

    if (!formData.businessSize) {
      newErrors.businessSize = "Porte da empresa é obrigatório";
    }

    if (!formData.city.trim()) {
      newErrors.city = "Cidade é obrigatória";
    }

    if (!formData.state.trim()) {
      newErrors.state = "Estado é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNext(formData);
    }
  };

  const updateFormData = (field: keyof CompanyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">Conte-me sobre seu negócio</h1>
        <p className="text-lg text-muted-foreground">
          Essas informações me ajudam a personalizar as recomendações e insights
          para sua empresa.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Empresa</CardTitle>
          <CardDescription>
            Preencha os dados básicos da sua empresa. Campos marcados com * são
            obrigatórios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome da empresa */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Empresa *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                placeholder="Ex: Padaria do João"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Segmento */}
            <div className="space-y-2">
              <Label htmlFor="segment">Segmento de Atuação *</Label>
              <Select
                value={formData.segment}
                onValueChange={(value) => updateFormData("segment", value)}
              >
                <SelectTrigger
                  className={errors.segment ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Selecione seu segmento" />
                </SelectTrigger>
                <SelectContent>
                  {segments.map((segment) => (
                    <SelectItem key={segment} value={segment}>
                      {segment}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.segment && (
                <p className="text-sm text-red-500">{errors.segment}</p>
              )}
            </div>

            {/* Porte da empresa */}
            <div className="space-y-2">
              <Label htmlFor="businessSize">Porte da Empresa *</Label>
              <Select
                value={formData.businessSize}
                onValueChange={(value) => updateFormData("businessSize", value)}
              >
                <SelectTrigger
                  className={errors.businessSize ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Selecione o porte" />
                </SelectTrigger>
                <SelectContent>
                  {businessSizes.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.businessSize && (
                <p className="text-sm text-red-500">{errors.businessSize}</p>
              )}
            </div>

            {/* Faturamento mensal */}
            <div className="space-y-2">
              <Label htmlFor="monthlyRevenue">
                Faturamento Mensal (Aproximado)
              </Label>
              <Select
                value={formData.monthlyRevenue}
                onValueChange={(value) =>
                  updateFormData("monthlyRevenue", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a faixa" />
                </SelectTrigger>
                <SelectContent>
                  {revenueRanges.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Número de funcionários */}
            <div className="space-y-2">
              <Label htmlFor="employeeCount">
                Quantas pessoas trabalham na empresa?
              </Label>
              <Select
                value={formData.employeeCount}
                onValueChange={(value) =>
                  updateFormData("employeeCount", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {employeeCounts.map((count) => (
                    <SelectItem key={count} value={count}>
                      {count}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Localização */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => updateFormData("city", e.target.value)}
                  placeholder="Ex: São Paulo"
                  className={errors.city ? "border-red-500" : ""}
                />
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => updateFormData("state", e.target.value)}
                  placeholder="Ex: SP"
                  className={errors.state ? "border-red-500" : ""}
                />
                {errors.state && (
                  <p className="text-sm text-red-500">{errors.state}</p>
                )}
              </div>
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone/WhatsApp</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => updateFormData("phone", e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Conte um pouco sobre seu negócio
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                placeholder="O que você faz? Quais são seus principais produtos/serviços? Qual é seu diferencial?"
                rows={3}
              />
            </div>

            {/* CNPJ (opcional) */}
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ (opcional)</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => updateFormData("cnpj", e.target.value)}
                placeholder="00.000.000/0001-00"
              />
            </div>

            {/* Website (opcional) */}
            <div className="space-y-2">
              <Label htmlFor="website">Website (opcional)</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => updateFormData("website", e.target.value)}
                placeholder="https://www.exemplo.com.br"
              />
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
