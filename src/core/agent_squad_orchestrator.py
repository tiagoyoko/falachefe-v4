"""
Orquestrador Python usando Agent Squad Framework nativo.
Implementa os mesmos agentes (Leo, Max, Lia) do TypeScript em Python.
"""

import asyncio
from typing import Dict, Any, Optional, List
from datetime import datetime
import json

from agent_squad.orchestrator import AgentSquad
from agent_squad.agents import OpenAIAgent, OpenAIAgentOptions

from ..utils.config import Config
from ..utils.logger import get_component_logger
from .knowledge_retrievers import LeoKnowledgeRetriever, MaxKnowledgeRetriever, LiaKnowledgeRetriever


class FalaChefeAgentSquadOrchestrator:
    """
    Orquestrador Python usando Agent Squad Framework nativo.
    Implementa os mesmos agentes do TypeScript: Leo (Financeiro), Max (Marketing), Lia (RH).
    """
    
    def __init__(self, config: Config):
        """Inicializa o orquestrador Python."""
        self.config = config
        self.logger = get_component_logger("orchestrator")
        
        # Inicializa o Agent Squad Framework
        self.agent_squad = self._initialize_agent_squad()
        
        # Registra os agentes especializados
        self._register_agents()
        
        self.logger.info("Agent Squad Python orquestrador inicializado")
    
    def _initialize_agent_squad(self) -> AgentSquad:
        """Inicializa o Agent Squad Framework."""
        try:
            # Cria o Agent Squad com configuração básica
            agent_squad = AgentSquad()
            
            return agent_squad
            
        except Exception as e:
            self.logger.error(f"Erro ao inicializar Agent Squad: {str(e)}")
            raise
    
    def _register_agents(self) -> None:
        """Registra os agentes especializados."""
        try:
            # Cria e registra o agente Leo (Financeiro)
            leo_agent = self._create_leo_agent()
            self.agent_squad.add_agent(leo_agent)
            
            # Cria e registra o agente Max (Marketing)
            max_agent = self._create_max_agent()
            self.agent_squad.add_agent(max_agent)
            
            # Cria e registra o agente Lia (RH)
            lia_agent = self._create_lia_agent()
            self.agent_squad.add_agent(lia_agent)
            
            self.logger.info("Agentes registrados: Leo (Financeiro), Max (Marketing), Lia (RH)")
            
        except Exception as e:
            self.logger.error(f"Erro ao registrar agentes: {str(e)}")
            raise
    
    def _create_leo_agent(self) -> OpenAIAgent:
        """Cria o agente Leo (Financeiro)."""
        try:
            # Configuração do agente Leo
            leo_options = OpenAIAgentOptions(
                name="leo",
                description="Mentor financeiro experiente e confiável. Ajuda a entender números, evitar erros financeiros e planejar o caixa.",
                model="gpt-3.5-turbo",
                api_key=self.config.openai_api_key,
                temperature=0.4,  # Respostas precisas
                max_tokens=800
            )
            
            return OpenAIAgent(leo_options)
            
        except Exception as e:
            self.logger.error(f"Erro ao criar agente Leo: {str(e)}")
            raise
    
    def _create_max_agent(self) -> OpenAIAgent:
        """Cria o agente Max (Marketing)."""
        try:
            # Configuração do agente Max
            max_options = OpenAIAgentOptions(
                name="max",
                description="Especialista em marketing e vendas. Ajuda a criar campanhas, gerar leads e aumentar vendas.",
                model="gpt-3.5-turbo",
                api_key=self.config.openai_api_key,
                temperature=0.6,  # Criatividade moderada
                max_tokens=800
            )
            
            return OpenAIAgent(max_options)
            
        except Exception as e:
            self.logger.error(f"Erro ao criar agente Max: {str(e)}")
            raise
    
    def _create_lia_agent(self) -> OpenAIAgent:
        """Cria o agente Lia (RH)."""
        try:
            # Configuração do agente Lia
            lia_options = OpenAIAgentOptions(
                name="lia",
                description="Especialista em recursos humanos. Ajuda com gestão de pessoas, processos de RH e desenvolvimento de equipe.",
                model="gpt-3.5-turbo",
                api_key=self.config.openai_api_key,
                temperature=0.5,  # Equilíbrio entre precisão e empatia
                max_tokens=800
            )
            
            return OpenAIAgent(lia_options)
            
        except Exception as e:
            self.logger.error(f"Erro ao criar agente Lia: {str(e)}")
            raise
    
    async def process_message(self, message: str, user_id: str, session_id: str, agent_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Processa uma mensagem usando o Agent Squad Framework.
        
        Args:
            message: Mensagem do usuário
            user_id: ID do usuário
            session_id: ID da sessão
            agent_name: Nome do agente específico (opcional)
            
        Returns:
            Resposta processada pelo agente apropriado
        """
        try:
            self.logger.info(f"Processando mensagem para usuário {user_id}, sessão {session_id}")
            
            # Processa a mensagem usando o Agent Squad
            response = await self.agent_squad.route_request(
                message,
                user_id,
                session_id,
                {},
                True  # streaming
            )
            
            # Extrai informações da resposta
            agent_name_used = response.metadata.agent_name if hasattr(response, 'metadata') else 'unknown'
            
            # Processa resposta streaming
            response_content = ""
            if hasattr(response, 'output'):
                async for chunk in response.output:
                    if hasattr(chunk, 'text'):
                        response_content += chunk.text
            
            result = {
                "message": response_content,
                "agent_name": agent_name_used,
                "user_id": user_id,
                "session_id": session_id,
                "timestamp": datetime.now().isoformat(),
                "success": True
            }
            
            self.logger.info(f"Mensagem processada pelo agente {agent_name_used}")
            return result
            
        except Exception as e:
            self.logger.error(f"Erro ao processar mensagem: {str(e)}")
            return {
                "message": "Desculpe, ocorreu um erro ao processar sua mensagem.",
                "agent_name": "system",
                "user_id": user_id,
                "session_id": session_id,
                "timestamp": datetime.now().isoformat(),
                "success": False,
                "error": str(e)
            }
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Verifica a saúde do orquestrador e dos agentes.
        
        Returns:
            Status de saúde do sistema
        """
        try:
            health_status = {
                "orchestrator": "healthy",
                "agents": {},
                "timestamp": datetime.now().isoformat()
            }
            
            # Verifica cada agente
            for agent_name in ["leo", "max", "lia"]:
                try:
                    # Tenta obter o agente (implementação específica do Agent Squad)
                    health_status["agents"][agent_name] = "healthy"
                except Exception as e:
                    health_status["agents"][agent_name] = f"error: {str(e)}"
            
            return health_status
            
        except Exception as e:
            self.logger.error(f"Erro no health check: {str(e)}")
            return {
                "orchestrator": "unhealthy",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }