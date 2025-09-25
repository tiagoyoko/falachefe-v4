"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Search,
  FileText,
  Trash2,
  RefreshCw,
  Plus,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  fileType: string;
  fileSize: number;
  status: "processing" | "active" | "error";
  isGlobal: boolean;
  agentId?: string;
  createdAt: string;
  updatedAt: string;
}

interface UploadFormData {
  title: string;
  file: File | null;
  agentIds: string[];
  isGlobal: boolean;
  metadata: string;
}

export default function KnowledgeBasePage() {
  const {} = useAuth();
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState<UploadFormData>({
    title: "",
    file: null,
    agentIds: [],
    isGlobal: false,
    metadata: "",
  });

  // Carregar documentos
  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedAgent) params.append("agentId", selectedAgent);

      const response = await fetch(`/api/knowledge-base/documents?${params}`);
      const data = await response.json();

      if (data.success) {
        setDocuments(data.data.documents);
      } else {
        toast.error("Erro ao carregar documentos");
      }
    } catch (error) {
      console.error("Erro ao carregar documentos:", error);
      toast.error("Erro ao carregar documentos");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedAgent]);

  // Carregar documentos na inicialização
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Verificar se é admin (placeholder - implementar verificação real)
  const isAdmin = true; // TODO: Implementar verificação de role de admin

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Acesso negado. Apenas administradores podem gerenciar a base de
              conhecimento.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fazer upload de documento
  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.title) {
      toast.error("Título e arquivo são obrigatórios");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadForm.file);
      formData.append("title", uploadForm.title);
      formData.append("agentIds", JSON.stringify(uploadForm.agentIds));
      formData.append("isGlobal", uploadForm.isGlobal.toString());
      formData.append("metadata", uploadForm.metadata);

      const response = await fetch("/api/knowledge-base/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Documento enviado para processamento");
        setUploadDialogOpen(false);
        setUploadForm({
          title: "",
          file: null,
          agentIds: [],
          isGlobal: false,
          metadata: "",
        });
        loadDocuments();
      } else {
        toast.error(data.error || "Erro ao fazer upload");
      }
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Erro ao fazer upload");
    } finally {
      setUploading(false);
    }
  };

  // Deletar documento
  const handleDelete = async (documentId: string) => {
    try {
      const response = await fetch(
        `/api/knowledge-base/documents/${documentId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Documento deletado com sucesso");
        loadDocuments();
      } else {
        toast.error(data.error || "Erro ao deletar documento");
      }
    } catch (error) {
      console.error("Erro ao deletar documento:", error);
      toast.error("Erro ao deletar documento");
    }
  };

  // Reindexar documento
  const handleReindex = async (documentId: string) => {
    try {
      const response = await fetch(
        `/api/knowledge-base/documents/${documentId}/reindex`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Documento enviado para reindexação");
        loadDocuments();
      } else {
        toast.error(data.error || "Erro ao reindexar documento");
      }
    } catch (error) {
      console.error("Erro ao reindexar documento:", error);
      toast.error("Erro ao reindexar documento");
    }
  };

  // Filtrar documentos
  const filteredDocuments = documents.filter((doc) => {
    if (
      searchQuery &&
      !doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (selectedAgent && doc.agentId !== selectedAgent) {
      return false;
    }
    return true;
  });

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Base de Conhecimento</h1>
        <p className="text-muted-foreground">
          Gerencie documentos e conhecimento para os agentes de IA
        </p>
      </div>

      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="search">Busca</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-6">
          {/* Filtros e ações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros e Ações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Buscar documentos</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Digite para buscar..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-48">
                  <Label htmlFor="agent">Filtrar por agente</Label>
                  <select
                    id="agent"
                    value={selectedAgent}
                    onChange={(e) => setSelectedAgent(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Todos os agentes</option>
                    <option value="leo">Leo (Financeiro)</option>
                    <option value="max">Max (Marketing)</option>
                    <option value="lia">Lia (RH)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={loadDocuments} disabled={loading}>
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                  />
                  Atualizar
                </Button>

                <Dialog
                  open={uploadDialogOpen}
                  onOpenChange={setUploadDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Documento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Adicionar Documento</DialogTitle>
                      <DialogDescription>
                        Faça upload de um documento para a base de conhecimento
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Título *</Label>
                        <Input
                          id="title"
                          value={uploadForm.title}
                          onChange={(e) =>
                            setUploadForm({
                              ...uploadForm,
                              title: e.target.value,
                            })
                          }
                          placeholder="Digite o título do documento"
                        />
                      </div>

                      <div>
                        <Label htmlFor="file">Arquivo *</Label>
                        <Input
                          id="file"
                          type="file"
                          accept=".pdf,.docx,.txt,.md,.html"
                          onChange={(e) =>
                            setUploadForm({
                              ...uploadForm,
                              file: e.target.files?.[0] || null,
                            })
                          }
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          Formatos aceitos: PDF, DOCX, TXT, MD, HTML (máx. 10MB)
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="metadata">
                          Metadados (JSON opcional)
                        </Label>
                        <Textarea
                          id="metadata"
                          value={uploadForm.metadata}
                          onChange={(e) =>
                            setUploadForm({
                              ...uploadForm,
                              metadata: e.target.value,
                            })
                          }
                          placeholder='{"author": "João Silva", "category": "financeiro"}'
                          rows={3}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isGlobal"
                          checked={uploadForm.isGlobal}
                          onChange={(e) =>
                            setUploadForm({
                              ...uploadForm,
                              isGlobal: e.target.checked,
                            })
                          }
                        />
                        <Label htmlFor="isGlobal">
                          Disponível para todos os agentes
                        </Label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setUploadDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleUpload}
                        disabled={
                          uploading || !uploadForm.file || !uploadForm.title
                        }
                      >
                        {uploading ? "Enviando..." : "Enviar"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Lista de documentos */}
          <div className="grid gap-4">
            {loading ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Carregando documentos...
                  </p>
                </CardContent>
              </Card>
            ) : filteredDocuments.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Nenhum documento encontrado
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredDocuments.map((doc) => (
                <Card key={doc.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{doc.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {doc.fileType.toUpperCase()} •{" "}
                          {Math.round(doc.fileSize / 1024)}KB
                          {doc.agentId && (
                            <Badge variant="secondary">
                              {doc.agentId === "leo"
                                ? "Leo"
                                : doc.agentId === "max"
                                  ? "Max"
                                  : doc.agentId === "lia"
                                    ? "Lia"
                                    : doc.agentId}
                            </Badge>
                          )}
                          {doc.isGlobal && (
                            <Badge variant="outline">Global</Badge>
                          )}
                        </CardDescription>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            doc.status === "active"
                              ? "default"
                              : doc.status === "processing"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {doc.status === "active"
                            ? "Ativo"
                            : doc.status === "processing"
                              ? "Processando"
                              : "Erro"}
                        </Badge>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReindex(doc.id)}
                          disabled={doc.status === "processing"}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Confirmar exclusão
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja deletar o documento
                                &quot;
                                {doc.title}&quot;? Esta ação não pode ser
                                desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(doc.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Deletar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Criado em:{" "}
                      {new Date(doc.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Busca na Base de Conhecimento</CardTitle>
              <CardDescription>
                Teste a busca semântica nos documentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Funcionalidade de busca será implementada em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics da Base de Conhecimento</CardTitle>
              <CardDescription>Métricas e estatísticas de uso</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Analytics serão implementados em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
