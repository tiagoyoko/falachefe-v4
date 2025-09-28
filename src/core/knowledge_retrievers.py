"""
Retrievers de conhecimento para os agentes especializados.
Implementa bases de conhecimento específicas para Leo, Max e Lia.
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import asyncio
import json

from agent_squad.retrievers import Retriever

from ..utils.config import Config
from ..utils.logger import get_component_logger


class BaseKnowledgeRetriever(Retriever, ABC):
    """Classe base para retrievers de conhecimento."""
    
    def __init__(self, config: Config, agent_id: str):
        """Inicializa o retriever base."""
        super().__init__({})
        self.config = config
        self.agent_id = agent_id
        self.logger = get_component_logger(f"retriever_{agent_id}")
        
        # Base de conhecimento específica do agente
        self.knowledge_base = {}
        
        # Carrega a base de conhecimento
        asyncio.create_task(self._load_knowledge_base())
    
    @abstractmethod
    async def _load_knowledge_base(self) -> None:
        """Carrega a base de conhecimento específica do agente."""
        pass
    
    async def retrieve(self, text: str) -> List[Dict[str, Any]]:
        """
        Busca conhecimento relevante para o texto.
        
        Args:
            text: Texto de busca
            
        Returns:
            Lista de resultados com conteúdo e score
        """
        try:
            results = []
            text_lower = text.lower()
            
            # Busca na base de conhecimento
            for key, knowledge_item in self.knowledge_base.items():
                score = self._calculate_relevance_score(text_lower, knowledge_item)
                if score > 0.3:  # Threshold de relevância
                    results.append({
                        "content": knowledge_item.get("content", ""),
                        "score": score,
                        "source": knowledge_item.get("source", "knowledge_base"),
                        "agent": self.agent_id
                    })
            
            # Ordena por score (maior primeiro)
            results.sort(key=lambda x: x["score"], reverse=True)
            
            # Retorna apenas os top 5 resultados
            return results[:5]
            
        except Exception as e:
            self.logger.error(f"Erro na busca de conhecimento: {str(e)}")
            return []
    
    def _calculate_relevance_score(self, query: str, knowledge_item: Dict[str, Any]) -> float:
        """
        Calcula o score de relevância entre a query e o item de conhecimento.
        
        Args:
            query: Query de busca em lowercase
            knowledge_item: Item da base de conhecimento
            
        Returns:
            Score de relevância (0.0 a 1.0)
        """
        try:
            content = knowledge_item.get("content", "").lower()
            keywords = knowledge_item.get("keywords", [])
            
            score = 0.0
            
            # Busca exata no conteúdo
            if query in content:
                score += 0.5
            
            # Busca por palavras-chave
            query_words = query.split()
            for word in query_words:
                if word in content:
                    score += 0.1
                if word in [kw.lower() for kw in keywords]:
                    score += 0.2
            
            # Busca por tags
            tags = knowledge_item.get("tags", [])
            for tag in tags:
                if tag.lower() in query:
                    score += 0.3
            
            return min(score, 1.0)
            
        except Exception as e:
            self.logger.error(f"Erro no cálculo de relevância: {str(e)}")
            return 0.0


class LeoKnowledgeRetriever(BaseKnowledgeRetriever):
    """Retriever de conhecimento para o agente Leo (Financeiro)."""
    
    def __init__(self, config: Config):
        """Inicializa o retriever do Leo."""
        super().__init__(config, "leo")
    
    async def _load_knowledge_base(self) -> None:
        """Carrega a base de conhecimento financeiro."""
        try:
            self.knowledge_base = {
                "fluxo_caixa": {
                    "content": "Fluxo de caixa é o controle de entradas e saídas de dinheiro da empresa. É fundamental para manter a saúde financeira e evitar problemas de liquidez.",
                    "keywords": ["fluxo", "caixa", "entradas", "saídas", "liquidez", "dinheiro"],
                    "tags": ["financeiro", "caixa", "controle"],
                    "source": "conhecimento_financeiro"
                },
                "dre": {
                    "content": "DRE (Demonstração do Resultado do Exercício) mostra a receita, custos e despesas da empresa, resultando no lucro ou prejuízo do período.",
                    "keywords": ["dre", "receita", "custos", "despesas", "lucro", "prejuízo"],
                    "tags": ["financeiro", "dre", "demonstração"],
                    "source": "conhecimento_financeiro"
                },
                "simples_nacional": {
                    "content": "Simples Nacional é um regime tributário simplificado para micro e pequenas empresas, com alíquotas reduzidas e pagamento unificado de impostos.",
                    "keywords": ["simples", "nacional", "tributário", "impostos", "alíquotas"],
                    "tags": ["tributário", "simples", "impostos"],
                    "source": "conhecimento_tributário"
                },
                "pix": {
                    "content": "PIX é o sistema de pagamentos instantâneos do Brasil, que permite transferências 24/7 de forma gratuita e instantânea.",
                    "keywords": ["pix", "pagamento", "instantâneo", "transferência"],
                    "tags": ["pagamentos", "pix", "instantâneo"],
                    "source": "conhecimento_pagamentos"
                },
                "lgpd": {
                    "content": "LGPD (Lei Geral de Proteção de Dados) estabelece regras para coleta, armazenamento e uso de dados pessoais, com multas de até 2% do faturamento.",
                    "keywords": ["lgpd", "dados", "pessoais", "proteção", "privacidade"],
                    "tags": ["compliance", "lgpd", "dados"],
                    "source": "conhecimento_compliance"
                }
            }
            
            self.logger.info(f"Base de conhecimento do Leo carregada: {len(self.knowledge_base)} itens")
            
        except Exception as e:
            self.logger.error(f"Erro ao carregar base de conhecimento do Leo: {str(e)}")


class MaxKnowledgeRetriever(BaseKnowledgeRetriever):
    """Retriever de conhecimento para o agente Max (Marketing)."""
    
    def __init__(self, config: Config):
        """Inicializa o retriever do Max."""
        super().__init__(config, "max")
    
    async def _load_knowledge_base(self) -> None:
        """Carrega a base de conhecimento de marketing."""
        try:
            self.knowledge_base = {
                "funil_vendas": {
                    "content": "Funil de vendas é o processo que leva um lead desde o primeiro contato até a conversão em cliente, passando por etapas de conscientização, interesse, consideração e decisão.",
                    "keywords": ["funil", "vendas", "lead", "conversão", "cliente", "processo"],
                    "tags": ["vendas", "funil", "conversão"],
                    "source": "conhecimento_vendas"
                },
                "marketing_digital": {
                    "content": "Marketing digital utiliza canais online para promover produtos e serviços, incluindo SEO, SEM, redes sociais, email marketing e conteúdo.",
                    "keywords": ["marketing", "digital", "online", "seo", "sem", "redes", "sociais"],
                    "tags": ["marketing", "digital", "online"],
                    "source": "conhecimento_marketing"
                },
                "whatsapp_business": {
                    "content": "WhatsApp Business é uma ferramenta poderosa para atendimento ao cliente, vendas e marketing, com recursos como catálogo, mensagens automáticas e etiquetas.",
                    "keywords": ["whatsapp", "business", "atendimento", "vendas", "catálogo"],
                    "tags": ["whatsapp", "business", "atendimento"],
                    "source": "conhecimento_whatsapp"
                },
                "conteudo_marketing": {
                    "content": "Marketing de conteúdo cria e distribui conteúdo valioso para atrair e engajar audiência, incluindo blog posts, vídeos, infográficos e e-books.",
                    "keywords": ["conteúdo", "marketing", "blog", "vídeo", "infográfico", "e-book"],
                    "tags": ["conteúdo", "marketing", "engajamento"],
                    "source": "conhecimento_conteudo"
                },
                "analytics": {
                    "content": "Analytics mede e analisa o desempenho de campanhas de marketing, incluindo métricas como CTR, conversão, ROI e engajamento.",
                    "keywords": ["analytics", "métricas", "ctr", "conversão", "roi", "engajamento"],
                    "tags": ["analytics", "métricas", "performance"],
                    "source": "conhecimento_analytics"
                }
            }
            
            self.logger.info(f"Base de conhecimento do Max carregada: {len(self.knowledge_base)} itens")
            
        except Exception as e:
            self.logger.error(f"Erro ao carregar base de conhecimento do Max: {str(e)}")


class LiaKnowledgeRetriever(BaseKnowledgeRetriever):
    """Retriever de conhecimento para o agente Lia (RH)."""
    
    def __init__(self, config: Config):
        """Inicializa o retriever da Lia."""
        super().__init__(config, "lia")
    
    async def _load_knowledge_base(self) -> None:
        """Carrega a base de conhecimento de RH."""
        try:
            self.knowledge_base = {
                "gestao_pessoas": {
                    "content": "Gestão de pessoas envolve recrutamento, seleção, treinamento, desenvolvimento e retenção de talentos, sendo fundamental para o sucesso da empresa.",
                    "keywords": ["gestão", "pessoas", "recrutamento", "seleção", "treinamento", "talentos"],
                    "tags": ["rh", "gestão", "pessoas"],
                    "source": "conhecimento_rh"
                },
                "clt": {
                    "content": "CLT (Consolidação das Leis do Trabalho) estabelece as normas de trabalho no Brasil, incluindo direitos, deveres e obrigações de empregadores e empregados.",
                    "keywords": ["clt", "trabalho", "direitos", "deveres", "empregador", "empregado"],
                    "tags": ["trabalhista", "clt", "direitos"],
                    "source": "conhecimento_trabalhista"
                },
                "home_office": {
                    "content": "Trabalho remoto ou home office requer políticas claras, ferramentas adequadas e gestão de equipe adaptada para manter produtividade e engajamento.",
                    "keywords": ["home", "office", "remoto", "trabalho", "produtividade", "engajamento"],
                    "tags": ["trabalho", "remoto", "home_office"],
                    "source": "conhecimento_remoto"
                },
                "avaliacao_desempenho": {
                    "content": "Avaliação de desempenho mede o rendimento dos colaboradores, identificando pontos fortes e áreas de melhoria para desenvolvimento profissional.",
                    "keywords": ["avaliação", "desempenho", "rendimento", "colaboradores", "desenvolvimento"],
                    "tags": ["avaliação", "desempenho", "desenvolvimento"],
                    "source": "conhecimento_avaliacao"
                },
                "cultura_organizacional": {
                    "content": "Cultura organizacional são os valores, crenças e comportamentos que definem como a empresa funciona e como as pessoas se relacionam.",
                    "keywords": ["cultura", "organizacional", "valores", "crenças", "comportamentos"],
                    "tags": ["cultura", "organizacional", "valores"],
                    "source": "conhecimento_cultura"
                }
            }
            
            self.logger.info(f"Base de conhecimento da Lia carregada: {len(self.knowledge_base)} itens")
            
        except Exception as e:
            self.logger.error(f"Erro ao carregar base de conhecimento da Lia: {str(e)}")
