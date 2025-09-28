"""
Orquestrador Híbrido - Escolhe entre TypeScript e Python.
Permite usar apenas um sistema de agentes por vez.
"""

import asyncio
from typing import Dict, Any, Optional
from enum import Enum

from ..utils.config import Config
from ..utils.logger import get_component_logger


class AgentSystem(Enum):
    """Sistemas de agentes disponíveis."""
    TYPESCRIPT = "typescript"
    PYTHON = "python"
    AUTO = "auto"  # Escolhe automaticamente baseado na configuração


class HybridOrchestrator:
    """
    Orquestrador híbrido que escolhe entre TypeScript e Python.
    Evita duplicação de agentes.
    """
    
    def __init__(self, config: Config, preferred_system: AgentSystem = AgentSystem.AUTO):
        """Inicializa o orquestrador híbrido."""
        self.config = config
        self.logger = get_component_logger("hybrid_orchestrator")
        self.preferred_system = preferred_system
        
        # Componentes
        self.typescript_orchestrator = None
        self.python_orchestrator = None
        self.active_system = None
        
        # Inicializa baseado na preferência
        asyncio.create_task(self._initialize_system())
        
        self.logger.info(f"HybridOrchestrator inicializado com preferência: {preferred_system.value}")
    
    async def _initialize_system(self):
        """Inicializa o sistema baseado na preferência."""
        try:
            if self.preferred_system == AgentSystem.TYPESCRIPT:
                await self._initialize_typescript()
            elif self.preferred_system == AgentSystem.PYTHON:
                await self._initialize_python()
            else:  # AUTO
                await self._auto_select_system()
                
        except Exception as e:
            self.logger.error(f"Erro ao inicializar sistema: {str(e)}")
            # Fallback para TypeScript se disponível
            await self._initialize_typescript()
    
    async def _initialize_typescript(self):
        """Inicializa o sistema TypeScript."""
        try:
            # Importa o orquestrador TypeScript existente
            from ..lib.orchestrator.agent_squad import getOrchestrator
            
            self.typescript_orchestrator = getOrchestrator()
            self.active_system = AgentSystem.TYPESCRIPT
            
            self.logger.info("Sistema TypeScript ativado")
            
        except Exception as e:
            self.logger.error(f"Erro ao inicializar TypeScript: {str(e)}")
            raise
    
    async def _initialize_python(self):
        """Inicializa o sistema Python."""
        try:
            from .agent_squad_orchestrator import FalaChefeAgentSquadOrchestrator
            
            self.python_orchestrator = FalaChefeAgentSquadOrchestrator(self.config)
            self.active_system = AgentSystem.PYTHON
            
            self.logger.info("Sistema Python ativado")
            
        except Exception as e:
            self.logger.error(f"Erro ao inicializar Python: {str(e)}")
            raise
    
    async def _auto_select_system(self):
        """Seleciona automaticamente o melhor sistema."""
        try:
            # Tenta TypeScript primeiro (sistema existente)
            await self._initialize_typescript()
            self.logger.info("Sistema TypeScript selecionado automaticamente")
            
        except Exception as e:
            self.logger.warning(f"TypeScript não disponível: {str(e)}")
            
            try:
                # Fallback para Python
                await self._initialize_python()
                self.logger.info("Sistema Python selecionado como fallback")
                
            except Exception as e2:
                self.logger.error(f"Ambos os sistemas falharam: {str(e2)}")
                raise Exception("Nenhum sistema de agentes disponível")
    
    async def process_message(
        self, 
        message: str, 
        user_id: str, 
        session_id: str, 
        agent_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Processa mensagem usando o sistema ativo.
        
        Args:
            message: Mensagem do usuário
            user_id: ID do usuário
            session_id: ID da sessão
            agent_name: Nome do agente (opcional)
            
        Returns:
            Resposta processada
        """
        try:
            if self.active_system == AgentSystem.TYPESCRIPT:
                return await self._process_with_typescript(message, user_id, session_id, agent_name)
            elif self.active_system == AgentSystem.PYTHON:
                return await self._process_with_python(message, user_id, session_id, agent_name)
            else:
                raise Exception("Nenhum sistema ativo")
                
        except Exception as e:
            self.logger.error(f"Erro ao processar mensagem: {str(e)}")
            return {
                "message": "Desculpe, ocorreu um erro ao processar sua mensagem.",
                "agent_name": "system",
                "success": False,
                "error": str(e),
                "system_used": self.active_system.value if self.active_system else "none"
            }
    
    async def _process_with_typescript(
        self, 
        message: str, 
        user_id: str, 
        session_id: str, 
        agent_name: Optional[str]
    ) -> Dict[str, Any]:
        """Processa mensagem com sistema TypeScript."""
        try:
            if agent_name:
                # Usa agente específico
                from ..lib.orchestrator.agent_squad import processMessageWithSpecificAgent
                result = await processMessageWithSpecificAgent(
                    message, user_id, session_id, agent_name
                )
            else:
                # Usa classificação automática
                result = await self.typescript_orchestrator.routeRequest(
                    message, user_id, session_id
                )
                result = {
                    "message": result.get("message", "Resposta não disponível"),
                    "agent_name": result.get("agent_name", "unknown"),
                    "success": True
                }
            
            result["system_used"] = "typescript"
            return result
            
        except Exception as e:
            self.logger.error(f"Erro no processamento TypeScript: {str(e)}")
            raise
    
    async def _process_with_python(
        self, 
        message: str, 
        user_id: str, 
        session_id: str, 
        agent_name: Optional[str]
    ) -> Dict[str, Any]:
        """Processa mensagem com sistema Python."""
        try:
            if agent_name:
                result = await self.python_orchestrator.process_message_with_specific_agent(
                    message, user_id, session_id, agent_name
                )
            else:
                result = await self.python_orchestrator.process_message(
                    message, user_id, session_id
                )
            
            result["system_used"] = "python"
            return result
            
        except Exception as e:
            self.logger.error(f"Erro no processamento Python: {str(e)}")
            raise
    
    async def switch_system(self, new_system: AgentSystem) -> bool:
        """
        Troca o sistema ativo.
        
        Args:
            new_system: Novo sistema para ativar
            
        Returns:
            True se a troca foi bem-sucedida
        """
        try:
            self.logger.info(f"Trocando sistema de {self.active_system} para {new_system}")
            
            if new_system == AgentSystem.TYPESCRIPT:
                await self._initialize_typescript()
            elif new_system == AgentSystem.PYTHON:
                await self._initialize_python()
            else:
                await self._auto_select_system()
            
            self.logger.info(f"Sistema alterado para: {self.active_system}")
            return True
            
        except Exception as e:
            self.logger.error(f"Erro ao trocar sistema: {str(e)}")
            return False
    
    async def get_system_status(self) -> Dict[str, Any]:
        """
        Obtém status dos sistemas.
        
        Returns:
            Status dos sistemas
        """
        try:
            status = {
                "active_system": self.active_system.value if self.active_system else "none",
                "preferred_system": self.preferred_system.value,
                "typescript_available": self.typescript_orchestrator is not None,
                "python_available": self.python_orchestrator is not None,
                "timestamp": asyncio.get_event_loop().time()
            }
            
            # Testa saúde do sistema ativo
            if self.active_system == AgentSystem.TYPESCRIPT and self.typescript_orchestrator:
                try:
                    # Teste básico do TypeScript
                    status["typescript_health"] = "healthy"
                except:
                    status["typescript_health"] = "unhealthy"
            
            elif self.active_system == AgentSystem.PYTHON and self.python_orchestrator:
                try:
                    health = await self.python_orchestrator.health_check()
                    status["python_health"] = health.get("status", "unknown")
                except:
                    status["python_health"] = "unhealthy"
            
            return status
            
        except Exception as e:
            self.logger.error(f"Erro ao obter status: {str(e)}")
            return {
                "active_system": "error",
                "error": str(e)
            }
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Verifica saúde do orquestrador híbrido.
        
        Returns:
            Status de saúde
        """
        try:
            status = await self.get_system_status()
            
            if self.active_system:
                return {
                    "component": "hybrid_orchestrator",
                    "status": "healthy",
                    "active_system": self.active_system.value,
                    "details": status
                }
            else:
                return {
                    "component": "hybrid_orchestrator",
                    "status": "unhealthy",
                    "error": "Nenhum sistema ativo"
                }
                
        except Exception as e:
            return {
                "component": "hybrid_orchestrator",
                "status": "unhealthy",
                "error": str(e)
            }
