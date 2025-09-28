"""
Classe base para todos os agentes do FalaChefe.
Define interface comum e funcionalidades compartilhadas.
"""

import asyncio
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from datetime import datetime
import json

from ..utils.config import Config
from ..utils.logger import create_agent_logger


class BaseAgent(ABC):
    """
    Classe base para todos os agentes especializados.
    Define interface comum e funcionalidades compartilhadas.
    """
    
    def __init__(self, config: Config, name: str, specialization: str):
        """
        Inicializa o agente base.
        
        Args:
            config: Configuração do sistema
            name: Nome do agente
            specialization: Especialização do agente
        """
        self.config = config
        self.name = name
        self.specialization = specialization
        self.logger = create_agent_logger(name)
        
        # Estado do agente
        self.is_active = True
        self.last_activity = datetime.now()
        self.processed_messages = 0
        self.error_count = 0
        
        # Memória do agente
        self.memory = {}
        self.knowledge_base = {}
        
        self.logger.info(f"Agente {name} ({specialization}) inicializado")
    
    @abstractmethod
    async def process_message(self, message_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processa uma mensagem do WhatsApp.
        
        Args:
            message_data: Dados da mensagem do WhatsApp
            
        Returns:
            Resposta processada pelo agente
        """
        pass
    
    @abstractmethod
    async def analyze_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analisa dados específicos da especialização do agente.
        
        Args:
            data: Dados para análise
            
        Returns:
            Análise dos dados
        """
        pass
    
    @abstractmethod
    async def generate_report(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Gera relatório baseado na análise.
        
        Args:
            analysis_data: Dados da análise
            
        Returns:
            Relatório gerado
        """
        pass
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Verifica a saúde do agente.
        
        Returns:
            Status de saúde do agente
        """
        try:
            health_status = {
                "agent": self.name,
                "specialization": self.specialization,
                "status": "healthy" if self.is_active else "inactive",
                "last_activity": self.last_activity.isoformat(),
                "processed_messages": self.processed_messages,
                "error_count": self.error_count,
                "memory_usage": len(self.memory),
                "knowledge_base_size": len(self.knowledge_base)
            }
            
            # Verifica se há muitos erros
            if self.error_count > 10:
                health_status["status"] = "degraded"
                health_status["warning"] = "High error count"
            
            # Verifica se o agente está inativo há muito tempo
            time_since_activity = (datetime.now() - self.last_activity).total_seconds()
            if time_since_activity > 3600:  # 1 hora
                health_status["status"] = "degraded"
                health_status["warning"] = "Inactive for too long"
            
            return health_status
            
        except Exception as e:
            self.logger.error(f"Erro no health check: {str(e)}")
            return {
                "agent": self.name,
                "status": "unhealthy",
                "error": str(e)
            }
    
    async def update_memory(self, key: str, value: Any) -> None:
        """
        Atualiza a memória do agente.
        
        Args:
            key: Chave da memória
            value: Valor a ser armazenado
        """
        try:
            self.memory[key] = {
                "value": value,
                "timestamp": datetime.now().isoformat(),
                "agent": self.name
            }
            
            # Limita o tamanho da memória
            if len(self.memory) > 1000:
                # Remove entradas mais antigas
                oldest_key = min(self.memory.keys(), 
                               key=lambda k: self.memory[k]["timestamp"])
                del self.memory[oldest_key]
            
            self.logger.debug(f"Memória atualizada: {key}")
            
        except Exception as e:
            self.logger.error(f"Erro ao atualizar memória: {str(e)}")
    
    async def get_memory(self, key: str) -> Optional[Any]:
        """
        Recupera valor da memória do agente.
        
        Args:
            key: Chave da memória
            
        Returns:
            Valor armazenado ou None se não encontrado
        """
        try:
            memory_entry = self.memory.get(key)
            if memory_entry:
                return memory_entry["value"]
            return None
            
        except Exception as e:
            self.logger.error(f"Erro ao recuperar memória: {str(e)}")
            return None
    
    async def update_knowledge_base(self, knowledge: Dict[str, Any]) -> None:
        """
        Atualiza a base de conhecimento do agente.
        
        Args:
            knowledge: Conhecimento a ser adicionado
        """
        try:
            self.knowledge_base.update(knowledge)
            self.logger.debug(f"Base de conhecimento atualizada: {len(knowledge)} itens")
            
        except Exception as e:
            self.logger.error(f"Erro ao atualizar base de conhecimento: {str(e)}")
    
    async def search_knowledge_base(self, query: str) -> List[Dict[str, Any]]:
        """
        Busca na base de conhecimento do agente.
        
        Args:
            query: Consulta de busca
            
        Returns:
            Lista de resultados encontrados
        """
        try:
            results = []
            query_lower = query.lower()
            
            for key, value in self.knowledge_base.items():
                if query_lower in key.lower() or query_lower in str(value).lower():
                    results.append({
                        "key": key,
                        "value": value,
                        "agent": self.name
                    })
            
            self.logger.debug(f"Busca realizada: '{query}' - {len(results)} resultados")
            return results
            
        except Exception as e:
            self.logger.error(f"Erro na busca na base de conhecimento: {str(e)}")
            return []
    
    async def log_activity(self, activity: str, details: Optional[Dict[str, Any]] = None) -> None:
        """
        Registra atividade do agente.
        
        Args:
            activity: Tipo de atividade
            details: Detalhes adicionais
        """
        try:
            self.last_activity = datetime.now()
            self.processed_messages += 1
            
            log_data = {
                "agent": self.name,
                "activity": activity,
                "timestamp": self.last_activity.isoformat(),
                "details": details or {}
            }
            
            self.logger.info(f"Atividade: {activity}", extra=log_data)
            
        except Exception as e:
            self.logger.error(f"Erro ao registrar atividade: {str(e)}")
    
    async def handle_error(self, error: Exception, context: Optional[str] = None) -> None:
        """
        Trata erros do agente.
        
        Args:
            error: Exceção ocorrida
            context: Contexto do erro
        """
        try:
            self.error_count += 1
            
            error_data = {
                "agent": self.name,
                "error": str(error),
                "error_type": type(error).__name__,
                "context": context,
                "timestamp": datetime.now().isoformat(),
                "error_count": self.error_count
            }
            
            self.logger.error(f"Erro no agente {self.name}: {str(error)}", extra=error_data)
            
            # Se há muitos erros, desativa o agente temporariamente
            if self.error_count > 50:
                self.is_active = False
                self.logger.critical(f"Agente {self.name} desativado devido a muitos erros")
            
        except Exception as e:
            self.logger.critical(f"Erro crítico no tratamento de erro: {str(e)}")
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Converte o agente para dicionário.
        
        Returns:
            Dicionário com dados do agente
        """
        return {
            "name": self.name,
            "specialization": self.specialization,
            "is_active": self.is_active,
            "last_activity": self.last_activity.isoformat(),
            "processed_messages": self.processed_messages,
            "error_count": self.error_count,
            "memory_size": len(self.memory),
            "knowledge_base_size": len(self.knowledge_base)
        }
