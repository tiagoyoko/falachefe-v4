'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface ClassificationMetrics {
  totalClassifications: number;
  accuracyRate: number;
  averageConfidence: number;
  averageResponseTime: number;
  topAgents: Array<{
    agentId: string;
    agentName: string;
    count: number;
    accuracy: number;
  }>;
  recentTrends: Array<{
    date: string;
    accuracy: number;
    volume: number;
  }>;
  errorRate: number;
  cacheHitRate: number;
}

interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
  memoryUsage: number;
  oldestEntry: Date | null;
  newestEntry: Date | null;
}

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']; // Removed unused constant

export default function ClassificationDashboard() {
  const [metrics, setMetrics] = useState<ClassificationMetrics | null>(null);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
    fetchCacheStats();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchMetrics();
      fetchCacheStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/metrics/classification');
      if (!response.ok) throw new Error('Failed to fetch metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCacheStats = async () => {
    try {
      const response = await fetch('/api/admin/cache-stats');
      if (!response.ok) throw new Error('Failed to fetch cache stats');
      const data = await response.json();
      setCacheStats(data);
    } catch (err) {
      console.error('Error fetching cache stats:', err);
    }
  };

  const clearCache = async () => {
    try {
      const response = await fetch('/api/admin/clear-cache', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to clear cache');
      await fetchCacheStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear cache');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando métricas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro: {error}</p>
          <Button onClick={fetchMetrics}>Tentar novamente</Button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Nenhuma métrica disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Classificação</h1>
          <p className="text-gray-600">Métricas e performance do sistema de classificação</p>
        </div>
        <Button onClick={clearCache} variant="outline">
          Limpar Cache
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="agents">Agentes</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Classificações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalClassifications.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Classificações realizadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Precisão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(metrics.accuracyRate * 100).toFixed(1)}%</div>
                <Progress value={metrics.accuracyRate * 100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confiança Média</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(metrics.averageConfidence * 100).toFixed(1)}%</div>
                <Progress value={metrics.averageConfidence * 100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo de Resposta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.averageResponseTime.toFixed(0)}ms</div>
                <p className="text-xs text-muted-foreground">
                  Tempo médio de classificação
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Taxa de Erro</CardTitle>
                <CardDescription>Percentual de classificações com erro</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {(metrics.errorRate * 100).toFixed(2)}%
                </div>
                <Progress value={metrics.errorRate * 100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Taxa de Cache Hit</CardTitle>
                <CardDescription>Percentual de classificações servidas do cache</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {(metrics.cacheHitRate * 100).toFixed(2)}%
                </div>
                <Progress value={metrics.cacheHitRate * 100} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance por Agente</CardTitle>
              <CardDescription>Métricas de classificação por agente especializado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.topAgents.map((agent, index) => (
                  <div key={agent.agentId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline">{index + 1}</Badge>
                      <div>
                        <h3 className="font-medium">{agent.agentName}</h3>
                        <p className="text-sm text-gray-600">{agent.count} classificações</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{(agent.accuracy * 100).toFixed(1)}%</div>
                      <div className="text-sm text-gray-600">precisão</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendências de Precisão</CardTitle>
              <CardDescription>Evolução da precisão ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics.recentTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Precisão (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Volume de Classificações</CardTitle>
              <CardDescription>Número de classificações por dia</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.recentTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="volume" fill="#82ca9d" name="Volume" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          {cacheStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tamanho do Cache</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{cacheStats.size}</div>
                  <p className="text-sm text-gray-600">entradas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Taxa de Hit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(cacheStats.hitRate * 100).toFixed(1)}%</div>
                  <p className="text-sm text-gray-600">
                    {cacheStats.hits} hits / {cacheStats.hits + cacheStats.misses} total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Uso de Memória</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(cacheStats.memoryUsage / 1024).toFixed(1)} KB
                  </div>
                  <p className="text-sm text-gray-600">memória utilizada</p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
