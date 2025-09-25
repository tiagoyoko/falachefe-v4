"use client";

import { useState } from "react";
import {
  useAgentManagement,
  AgentData,
  CreateAgentData,
} from "@/hooks/use-agent-management";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function AdminAgentsPage() {
  const {
    agents,
    loading,
    error,
    createAgent,
    updateAgent,
    deleteAgent,
    toggleAgentStatus,
  } = useAgentManagement();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AgentData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar agentes por termo de busca
  const filteredAgents = agents.filter(
    (agent) =>
      agent.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Formulário de criação
  const [createForm, setCreateForm] = useState<CreateAgentData>({
    name: "",
    displayName: "",
    description: "",
    tone: "",
    capabilities: [],
  });

  // Formulário de edição
  const [editForm, setEditForm] = useState<Partial<AgentData>>({});

  const handleCreateAgent = async () => {
    if (
      !createForm.name ||
      !createForm.displayName ||
      !createForm.description ||
      !createForm.tone
    ) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const success = await createAgent(createForm);
    if (success) {
      toast.success("Agente criado com sucesso!");
      setIsCreateDialogOpen(false);
      setCreateForm({
        name: "",
        displayName: "",
        description: "",
        tone: "",
        capabilities: [],
      });
    }
  };

  const handleEditAgent = (agent: AgentData) => {
    setEditingAgent(agent);
    setEditForm({
      displayName: agent.displayName,
      description: agent.description,
      tone: agent.tone,
      capabilities: agent.capabilities,
      isActive: agent.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateAgent = async () => {
    if (!editingAgent) return;

    const success = await updateAgent(editingAgent.id, editForm);
    if (success) {
      toast.success("Agente atualizado com sucesso!");
      setIsEditDialogOpen(false);
      setEditingAgent(null);
    }
  };

  const handleDeleteAgent = async (agent: AgentData) => {
    const success = await deleteAgent(agent.id);
    if (success) {
      toast.success("Agente deletado com sucesso!");
    }
  };

  const handleToggleStatus = async (agent: AgentData) => {
    const success = await toggleAgentStatus(agent.id);
    if (success) {
      toast.success(agent.isActive ? "Agente desativado" : "Agente ativado");
    }
  };

  if (loading && agents.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando agentes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Administração de Agentes</h1>
          <p className="text-muted-foreground">
            Gerencie a personalidade e configurações dos agentes de IA
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Agente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Agente</DialogTitle>
              <DialogDescription>
                Configure a personalidade e capacidades do novo agente
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                <TabsTrigger value="personality">Personalidade</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome (ID)</Label>
                    <Input
                      id="name"
                      value={createForm.name}
                      onChange={(e) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="ex: marketing"
                    />
                  </div>
                  <div>
                    <Label htmlFor="displayName">Nome de Exibição</Label>
                    <Input
                      id="displayName"
                      value={createForm.displayName}
                      onChange={(e) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          displayName: e.target.value,
                        }))
                      }
                      placeholder="ex: Marketing - Agente de Vendas"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={createForm.description}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Descreva o propósito e especialidade do agente"
                    rows={3}
                  />
                </div>
              </TabsContent>
              <TabsContent value="personality" className="space-y-4">
                <div>
                  <Label htmlFor="tone">Tom de Voz</Label>
                  <Textarea
                    id="tone"
                    value={createForm.tone}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        tone: e.target.value,
                      }))
                    }
                    placeholder="Descreva como o agente deve se comunicar (ex: Amigável, profissional, técnico)"
                    rows={3}
                  />
                </div>
              </TabsContent>
            </Tabs>
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleCreateAgent}>Criar Agente</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Barra de busca */}
      <div className="mb-6">
        <Input
          placeholder="Buscar agentes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Lista de agentes */}
      <div className="grid gap-4">
        {filteredAgents.map((agent) => (
          <Card key={agent.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {agent.displayName}
                    {agent.isSystem && (
                      <Badge variant="secondary">Sistema</Badge>
                    )}
                    <Badge variant={agent.isActive ? "default" : "secondary"}>
                      {agent.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    ID: {agent.name} • Criado em{" "}
                    {new Date(agent.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(agent)}
                  >
                    {agent.isActive ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditAgent(agent)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {!agent.isSystem && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Confirmar Exclusão
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja deletar o agente &quot;
                            {agent.displayName}&quot;? Esta ação não pode ser
                            desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteAgent(agent)}
                          >
                            Deletar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {agent.description}
                </p>
                <div>
                  <Label className="text-xs font-medium">Tom de Voz:</Label>
                  <p className="text-sm">{agent.tone}</p>
                </div>
                {agent.capabilities && agent.capabilities.length > 0 && (
                  <div>
                    <Label className="text-xs font-medium">Capacidades:</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {agent.capabilities.map((capability) => (
                        <Badge
                          key={capability.id}
                          variant="outline"
                          className="text-xs"
                        >
                          {capability.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm
              ? "Nenhum agente encontrado"
              : "Nenhum agente cadastrado"}
          </p>
        </div>
      )}

      {/* Dialog de edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Agente</DialogTitle>
            <DialogDescription>
              Atualize as informações do agente
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
              <TabsTrigger value="personality">Personalidade</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-4">
              <div>
                <Label htmlFor="edit-displayName">Nome de Exibição</Label>
                <Input
                  id="edit-displayName"
                  value={editForm.displayName || ""}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      displayName: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description || ""}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isActive"
                  checked={editForm.isActive || false}
                  onCheckedChange={(checked) =>
                    setEditForm((prev) => ({ ...prev, isActive: checked }))
                  }
                />
                <Label htmlFor="edit-isActive">Agente Ativo</Label>
              </div>
            </TabsContent>
            <TabsContent value="personality" className="space-y-4">
              <div>
                <Label htmlFor="edit-tone">Tom de Voz</Label>
                <Textarea
                  id="edit-tone"
                  value={editForm.tone || ""}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, tone: e.target.value }))
                  }
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>
          <div className="flex justify-end space-x-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdateAgent}>Salvar Alterações</Button>
          </div>
        </DialogContent>
      </Dialog>

      {error && (
        <div className="fixed bottom-4 right-4">
          <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md">
            {error}
          </div>
        </div>
      )}
    </div>
  );
}
