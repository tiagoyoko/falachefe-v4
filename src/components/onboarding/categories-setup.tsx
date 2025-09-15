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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Plus,
  X,
  ShoppingCart,
  Home,
  Car,
  Coffee,
  Briefcase,
  Heart,
  Users,
  Phone,
  Zap,
  CreditCard,
  Truck,
} from "lucide-react";

interface CategoriesSetupProps {
  onNext: (data: CategoriesData) => void;
  onBack: () => void;
  businessSegment?: string;
}

export interface CategoriesData {
  selectedCategories: string[];
  customCategories: CustomCategory[];
}

export interface CustomCategory {
  id: string;
  name: string;
  type: "receita" | "despesa";
  color: string;
  icon: string;
}

const iconMap = {
  ShoppingCart,
  Home,
  Car,
  Coffee,
  Briefcase,
  Heart,
  Users,
  Phone,
  Zap,
  CreditCard,
  Truck,
  TrendingUp,
  TrendingDown,
};

// Categorias padrão para receitas
const defaultRevenueCategories = [
  {
    id: "vendas-produtos",
    name: "Vendas de Produtos",
    icon: "ShoppingCart",
    color: "#22c55e",
  },
  {
    id: "vendas-servicos",
    name: "Vendas de Serviços",
    icon: "Briefcase",
    color: "#3b82f6",
  },
  { id: "comissoes", name: "Comissões", icon: "TrendingUp", color: "#8b5cf6" },
  { id: "consultorias", name: "Consultorias", icon: "Users", color: "#f59e0b" },
  {
    id: "outras-receitas",
    name: "Outras Receitas",
    icon: "CreditCard",
    color: "#06b6d4",
  },
];

// Categorias padrão para despesas
const defaultExpenseCategories = [
  { id: "aluguel", name: "Aluguel", icon: "Home", color: "#ef4444" },
  { id: "fornecedores", name: "Fornecedores", icon: "Truck", color: "#f97316" },
  {
    id: "marketing",
    name: "Marketing e Publicidade",
    icon: "TrendingUp",
    color: "#ec4899",
  },
  { id: "funcionarios", name: "Funcionários", icon: "Users", color: "#84cc16" },
  { id: "transporte", name: "Transporte", icon: "Car", color: "#6366f1" },
  { id: "energia", name: "Energia Elétrica", icon: "Zap", color: "#eab308" },
  {
    id: "telefone",
    name: "Telefone/Internet",
    icon: "Phone",
    color: "#14b8a6",
  },
  { id: "alimentacao", name: "Alimentação", icon: "Coffee", color: "#a855f7" },
  { id: "manutencao", name: "Manutenção", icon: "Home", color: "#64748b" },
  {
    id: "impostos",
    name: "Impostos e Taxas",
    icon: "CreditCard",
    color: "#dc2626",
  },
];

const colors = [
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#06b6d4",
  "#ef4444",
  "#f97316",
  "#ec4899",
  "#84cc16",
  "#6366f1",
];

export function CategoriesSetup({
  onNext,
  onBack,
  businessSegment,
}: CategoriesSetupProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>(
    []
  );
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState<"receita" | "despesa">(
    "receita"
  );
  const [showCustomForm, setShowCustomForm] = useState(false);

  const allCategories = [
    ...defaultRevenueCategories,
    ...defaultExpenseCategories,
  ];

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const addCustomCategory = () => {
    if (!newCategoryName.trim()) return;

    const newCategory: CustomCategory = {
      id: `custom-${Date.now()}`,
      name: newCategoryName.trim(),
      type: newCategoryType,
      color: colors[Math.floor(Math.random() * colors.length)],
      icon: newCategoryType === "receita" ? "TrendingUp" : "TrendingDown",
    };

    setCustomCategories((prev) => [...prev, newCategory]);
    setNewCategoryName("");
    setShowCustomForm(false);
  };

  const removeCustomCategory = (categoryId: string) => {
    setCustomCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
  };

  const handleNext = () => {
    onNext({
      selectedCategories,
      customCategories,
    });
  };

  const getSuggestedCategories = () => {
    // Sugestões baseadas no segmento do negócio
    const suggestions: Record<string, string[]> = {
      "Alimentação e Bebidas": [
        "vendas-produtos",
        "fornecedores",
        "aluguel",
        "energia",
        "funcionarios",
      ],
      "Varejo e Comércio": [
        "vendas-produtos",
        "fornecedores",
        "aluguel",
        "marketing",
        "transporte",
      ],
      "Serviços Gerais": [
        "vendas-servicos",
        "transporte",
        "telefone",
        "marketing",
        "funcionarios",
      ],
      "Beleza e Estética": [
        "vendas-servicos",
        "fornecedores",
        "aluguel",
        "marketing",
        "energia",
      ],
      Consultoria: [
        "consultorias",
        "telefone",
        "transporte",
        "marketing",
        "alimentacao",
      ],
    };

    return (
      suggestions[businessSegment || ""] || [
        "vendas-produtos",
        "vendas-servicos",
        "fornecedores",
        "aluguel",
        "marketing",
      ]
    );
  };

  const suggestedCategories = getSuggestedCategories();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Configure suas Categorias</h1>
        <p className="text-lg text-muted-foreground">
          Selecione as categorias que fazem sentido para seu negócio. Você pode
          adicionar mais categorias depois.
        </p>
      </div>

      {/* Sugestões baseadas no segmento */}
      {businessSegment && suggestedCategories.length > 0 && (
        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-lg text-blue-800 dark:text-blue-200">
              Sugestões para {businessSegment}
            </CardTitle>
            <CardDescription className="text-blue-700 dark:text-blue-300">
              Com base no seu segmento, recomendamos essas categorias:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {suggestedCategories.map((categoryId) => {
                const category = allCategories.find(
                  (cat) => cat.id === categoryId
                );
                if (!category) return null;
                const IconComponent =
                  iconMap[category.icon as keyof typeof iconMap];

                return (
                  <Badge
                    key={categoryId}
                    variant="secondary"
                    className="cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800"
                    onClick={() => toggleCategory(categoryId)}
                  >
                    <IconComponent className="h-3 w-3 mr-1" />
                    {category.name}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Receitas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Receitas
            </CardTitle>
            <CardDescription>
              Como o dinheiro entra no seu negócio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {defaultRevenueCategories.map((category) => {
              const IconComponent =
                iconMap[category.icon as keyof typeof iconMap];
              const isSelected = selectedCategories.includes(category.id);

              return (
                <div
                  key={category.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => toggleCategory(category.id)}
                >
                  <Checkbox checked={isSelected} />
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: category.color }}
                    >
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{category.name}</span>
                  </div>
                </div>
              );
            })}

            {/* Categorias customizadas de receita */}
            {customCategories
              .filter((cat) => cat.type === "receita")
              .map((category) => {
                const IconComponent =
                  iconMap[category.icon as keyof typeof iconMap];

                return (
                  <div
                    key={category.id}
                    className="flex items-center space-x-3 p-3 rounded-lg border bg-muted"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: category.color }}
                      >
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{category.name}</span>
                      <Badge variant="outline" className="text-xs">
                        Personalizada
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCustomCategory(category.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
          </CardContent>
        </Card>

        {/* Despesas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Despesas
            </CardTitle>
            <CardDescription>
              Como o dinheiro sai do seu negócio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {defaultExpenseCategories.map((category) => {
              const IconComponent =
                iconMap[category.icon as keyof typeof iconMap];
              const isSelected = selectedCategories.includes(category.id);

              return (
                <div
                  key={category.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => toggleCategory(category.id)}
                >
                  <Checkbox checked={isSelected} />
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: category.color }}
                    >
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{category.name}</span>
                  </div>
                </div>
              );
            })}

            {/* Categorias customizadas de despesa */}
            {customCategories
              .filter((cat) => cat.type === "despesa")
              .map((category) => {
                const IconComponent =
                  iconMap[category.icon as keyof typeof iconMap];

                return (
                  <div
                    key={category.id}
                    className="flex items-center space-x-3 p-3 rounded-lg border bg-muted"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: category.color }}
                      >
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{category.name}</span>
                      <Badge variant="outline" className="text-xs">
                        Personalizada
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCustomCategory(category.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
          </CardContent>
        </Card>
      </div>

      {/* Adicionar categoria personalizada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Adicionar Categoria Personalizada
          </CardTitle>
          <CardDescription>
            Não encontrou o que precisa? Crie suas próprias categorias.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showCustomForm ? (
            <Button
              variant="outline"
              onClick={() => setShowCustomForm(true)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={
                    newCategoryType === "receita" ? "default" : "outline"
                  }
                  onClick={() => setNewCategoryType("receita")}
                  size="sm"
                >
                  Receita
                </Button>
                <Button
                  variant={
                    newCategoryType === "despesa" ? "default" : "outline"
                  }
                  onClick={() => setNewCategoryType("despesa")}
                  size="sm"
                >
                  Despesa
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Nome da categoria"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addCustomCategory()}
                />
                <Button
                  onClick={addCustomCategory}
                  disabled={!newCategoryName.trim()}
                >
                  Adicionar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCustomForm(false);
                    setNewCategoryName("");
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="text-sm text-muted-foreground self-center">
          {selectedCategories.length + customCategories.length} categoria(s)
          selecionada(s)
        </div>
        <Button onClick={handleNext}>Continuar</Button>
      </div>
    </div>
  );
}
