#!/usr/bin/env python3
"""
FalaChefe v4 - Python Integration Script
Integração Python com Agent Squad Framework existente.

Este script Python trabalha EM CONJUNTO com o Agent Squad Framework TypeScript,
fornecendo funcionalidades de processamento de dados, análise e automação
que complementam os agentes especializados (Leo, Max, Lia).
"""

import asyncio
import logging
import sys
from pathlib import Path
from typing import Dict, Any, Optional
import argparse
from datetime import datetime
import json

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from src.core.data_processor import DataProcessor
from src.core.api_client import FalaChefeAPIClient
from src.core.hybrid_orchestrator import HybridOrchestrator, AgentSystem
from src.analytics.conversation_analyzer import ConversationAnalyzer
from src.automation.business_automation import BusinessAutomation
from src.utils.config import Config
from src.utils.logger import setup_logger


class FalaChefePython:
    """
    Classe principal do FalaChefe Python.
    Integra com o Agent Squad Framework TypeScript existente.
    """
    
    def __init__(self, config_path: Optional[str] = None):
        """Inicializa o FalaChefe Python."""
        self.config = Config(config_path)
        self.logger = setup_logger(self.config.log_level, self.config.log_file)
        
        # Inicializa componentes de integração
        self.data_processor = DataProcessor(self.config)
        self.api_client = FalaChefeAPIClient(self.config)
        
        # Orquestrador híbrido - escolhe entre TypeScript e Python
        self.orchestrator = HybridOrchestrator(self.config, AgentSystem.AUTO)
        
        self.conversation_analyzer = ConversationAnalyzer(self.config)
        self.business_automation = BusinessAutomation(self.config)
        
        self.logger.info("FalaChefe Python com orquestrador híbrido inicializado")
    
    async def process_conversation(self, conversation_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processa uma conversa do WhatsApp usando o orquestrador híbrido.
        Escolhe automaticamente entre TypeScript e Python.
        
        Args:
            conversation_data: Dados da conversa do WhatsApp
            
        Returns:
            Dict com resposta processada pelos agentes
        """
        try:
            self.logger.info(f"Processando conversa: {conversation_data.get('id', 'unknown')}")
            
            # Extrai dados da conversa
            message = conversation_data.get('message', '')
            user_id = conversation_data.get('user_id', 'unknown')
            session_id = conversation_data.get('session_id', 'default')
            agent_name = conversation_data.get('agent_name')  # Opcional
            
            # Processa com orquestrador híbrido (escolhe automaticamente)
            response = await self.orchestrator.process_message(
                message, user_id, session_id, agent_name
            )
            
            # Analisa a conversa para insights
            analysis = await self.conversation_analyzer.analyze_conversation(conversation_data, response)
            
            # Atualiza dados de processamento
            await self.data_processor.update_conversation_data(conversation_data, response, analysis)
            
            self.logger.info(f"Conversa processada com sucesso via {response.get('system_used', 'unknown')}")
            return {
                "response": response,
                "analysis": analysis,
                "processed_by": response.get('system_used', 'hybrid_orchestrator')
            }
            
        except Exception as e:
            self.logger.error(f"Erro ao processar conversa: {str(e)}")
            return {"error": str(e), "processed_by": "error_fallback"}
    
    async def analyze_financial_data(self, data_source: str) -> Dict[str, Any]:
        """
        Analisa dados financeiros complementando o agente Leo do Agent Squad.
        
        Args:
            data_source: Fonte dos dados financeiros
            
        Returns:
            Análise financeira detalhada
        """
        try:
            self.logger.info(f"Iniciando análise financeira: {data_source}")
            
            # Carrega dados financeiros
            financial_data = await self.data_processor.load_financial_data(data_source)
            
            # Processa dados com Python (análise avançada)
            analysis = await self.data_processor.analyze_financial_data(financial_data)
            
            # Integra com o agente Leo do Agent Squad
            leo_insights = await self.agent_squad_integration.get_leo_insights(analysis)
            
            # Gera relatório combinado
            report = await self.data_processor.generate_financial_report(analysis, leo_insights)
            
            self.logger.info("Análise financeira concluída com sucesso")
            return report
            
        except Exception as e:
            self.logger.error(f"Erro na análise financeira: {str(e)}")
            return {"error": str(e)}
    
    async def process_marketing_campaign(self, campaign_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processa campanha de marketing usando o agente Max.
        
        Args:
            campaign_data: Dados da campanha de marketing
            
        Returns:
            Resultado do processamento da campanha
        """
        try:
            self.logger.info(f"Processando campanha de marketing: {campaign_data.get('name', 'unknown')}")
            
            # Analisa a campanha
            analysis = await self.agents['max'].analyze_campaign(campaign_data)
            
            # Otimiza a campanha
            optimization = await self.agents['max'].optimize_campaign(analysis)
            
            # Gera relatório de performance
            report = await self.agents['max'].generate_campaign_report(optimization)
            
            self.logger.info("Campanha de marketing processada com sucesso")
            return report
            
        except Exception as e:
            self.logger.error(f"Erro no processamento da campanha: {str(e)}")
            return {"error": str(e)}
    
    async def process_hr_operations(self, hr_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processa operações de RH usando o agente Lia.
        
        Args:
            hr_data: Dados de operações de RH
            
        Returns:
            Resultado do processamento de RH
        """
        try:
            self.logger.info(f"Processando operações de RH: {hr_data.get('type', 'unknown')}")
            
            # Processa com o agente Lia
            result = await self.agents['lia'].process_hr_operation(hr_data)
            
            # Atualiza base de conhecimento de RH
            await self.agents['lia'].update_hr_knowledge_base(result)
            
            self.logger.info("Operações de RH processadas com sucesso")
            return result
            
        except Exception as e:
            self.logger.error(f"Erro no processamento de RH: {str(e)}")
            return {"error": str(e)}
    
    async def run_batch_processing(self, batch_type: str) -> Dict[str, Any]:
        """
        Executa processamento em lote de dados.
        
        Args:
            batch_type: Tipo de processamento em lote
            
        Returns:
            Resultado do processamento em lote
        """
        try:
            self.logger.info(f"Iniciando processamento em lote: {batch_type}")
            
            if batch_type == "financial":
                result = await self.analyze_financial_data("batch")
            elif batch_type == "marketing":
                result = await self.process_marketing_campaign({"type": "batch"})
            elif batch_type == "hr":
                result = await self.process_hr_operations({"type": "batch"})
            else:
                raise ValueError(f"Tipo de processamento em lote inválido: {batch_type}")
            
            self.logger.info(f"Processamento em lote {batch_type} concluído")
            return result
            
        except Exception as e:
            self.logger.error(f"Erro no processamento em lote: {str(e)}")
            return {"error": str(e)}
    
    async def switch_agent_system(self, system: str) -> Dict[str, Any]:
        """
        Troca o sistema de agentes ativo.
        
        Args:
            system: "typescript", "python" ou "auto"
            
        Returns:
            Resultado da troca
        """
        try:
            if system == "typescript":
                success = await self.orchestrator.switch_system(AgentSystem.TYPESCRIPT)
            elif system == "python":
                success = await self.orchestrator.switch_system(AgentSystem.PYTHON)
            elif system == "auto":
                success = await self.orchestrator.switch_system(AgentSystem.AUTO)
            else:
                return {"success": False, "error": "Sistema inválido. Use: typescript, python ou auto"}
            
            if success:
                status = await self.orchestrator.get_system_status()
                return {
                    "success": True,
                    "active_system": status.get("active_system"),
                    "message": f"Sistema alterado para: {status.get('active_system')}"
                }
            else:
                return {"success": False, "error": "Falha ao trocar sistema"}
                
        except Exception as e:
            self.logger.error(f"Erro ao trocar sistema: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def get_system_status(self) -> Dict[str, Any]:
        """
        Obtém status dos sistemas de agentes.
        
        Returns:
            Status dos sistemas
        """
        try:
            return await self.orchestrator.get_system_status()
        except Exception as e:
            self.logger.error(f"Erro ao obter status: {str(e)}")
            return {"error": str(e)}
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Verifica a saúde dos componentes do sistema.
        
        Returns:
            Status de saúde dos componentes
        """
        try:
            health_status = {
                "timestamp": datetime.now().isoformat(),
                "status": "healthy",
                "components": {}
            }
            
            # Verifica orquestrador híbrido
            health_status["components"]["orchestrator"] = await self.orchestrator.health_check()
            
            # Verifica API client
            health_status["components"]["api_client"] = await self.api_client.health_check()
            
            # Verifica data processor
            health_status["components"]["data_processor"] = await self.data_processor.health_check()
            
            # Verifica conversation analyzer
            health_status["components"]["conversation_analyzer"] = await self.conversation_analyzer.health_check()
            
            # Verifica business automation
            health_status["components"]["business_automation"] = await self.business_automation.health_check()
            
            # Determina status geral
            all_healthy = all(
                comp.get("status") == "healthy" 
                for comp in health_status["components"].values()
            )
            
            if not all_healthy:
                health_status["status"] = "degraded"
            
            return health_status
            
        except Exception as e:
            self.logger.error(f"Erro no health check: {str(e)}")
            return {
                "timestamp": datetime.now().isoformat(),
                "status": "unhealthy",
                "error": str(e)
            }


async def main():
    """Função principal do script."""
    parser = argparse.ArgumentParser(description="FalaChefe v4 - Python Integration")
    parser.add_argument("--mode", choices=["conversation", "financial", "marketing", "hr", "batch", "health", "switch-system", "system-status"], 
                       default="health", help="Modo de operação")
    parser.add_argument("--data", type=str, help="Dados de entrada (JSON string ou arquivo)")
    parser.add_argument("--config", type=str, help="Caminho para arquivo de configuração")
    parser.add_argument("--batch-type", choices=["financial", "marketing", "hr"], 
                       help="Tipo de processamento em lote")
    parser.add_argument("--system", choices=["typescript", "python", "auto"], 
                       help="Sistema de agentes para usar (apenas com --mode switch-system)")
    
    args = parser.parse_args()
    
    try:
        # Inicializa o FalaChefe
        falachefe = FalaChefePython(args.config)
        
        # Executa baseado no modo
        if args.mode == "health":
            result = await falachefe.health_check()
            print(f"Health Check: {result}")
            
        elif args.mode == "conversation":
            if not args.data:
                print("Erro: --data é obrigatório para modo conversation")
                sys.exit(1)
            # Aqui você implementaria o carregamento dos dados da conversa
            result = await falachefe.process_conversation({"id": "test", "message": args.data})
            print(f"Conversa processada: {result}")
            
        elif args.mode == "financial":
            data_source = args.data or "default"
            result = await falachefe.analyze_financial_data(data_source)
            print(f"Análise financeira: {result}")
            
        elif args.mode == "marketing":
            campaign_data = {"name": "test", "type": args.data or "default"}
            result = await falachefe.process_marketing_campaign(campaign_data)
            print(f"Campanha de marketing: {result}")
            
        elif args.mode == "hr":
            hr_data = {"type": args.data or "default"}
            result = await falachefe.process_hr_operations(hr_data)
            print(f"Operações de RH: {result}")
            
        elif args.mode == "batch":
            if not args.batch_type:
                print("Erro: --batch-type é obrigatório para modo batch")
                sys.exit(1)
            result = await falachefe.run_batch_processing(args.batch_type)
            print(f"Processamento em lote: {result}")
            
        elif args.mode == "switch-system":
            if not args.system:
                print("Erro: --system é obrigatório para modo switch-system")
                sys.exit(1)
            result = await falachefe.switch_agent_system(args.system)
            print(f"Troca de sistema: {result}")
            
        elif args.mode == "system-status":
            result = await falachefe.get_system_status()
            print(f"Status do sistema: {result}")
        
    except Exception as e:
        print(f"Erro fatal: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
