#!/usr/bin/env python3
"""
Testes para o FalaChefe Python.
Suite de testes para validar funcionalidades do Agent Squad Framework Python.
"""

import pytest
import asyncio
import json
from unittest.mock import Mock, patch
from datetime import datetime

# Importa o módulo principal
from main import FalaChefePython


class TestFalaChefePython:
    """Testes para a classe principal FalaChefePython."""
    
    @pytest.fixture
    def mock_config(self):
        """Mock da configuração."""
        config = Mock()
        config.openai_api_key = "test_key"
        config.openai_model = "gpt-4"
        config.supabase_url = "https://test.supabase.co"
        config.supabase_anon_key = "test_anon_key"
        config.whatsapp_api_url = "https://test.whatsapp.api"
        config.whatsapp_api_token = "test_token"
        config.log_level = "INFO"
        config.log_file = "test.log"
        return config
    
    @pytest.fixture
    def falachefe(self, mock_config):
        """Instância do FalaChefePython para testes."""
        with patch('main.FalaChefeAgentSquadOrchestrator'), \
             patch('main.DataProcessor'), \
             patch('main.FalaChefeAPIClient'), \
             patch('main.ConversationAnalyzer'), \
             patch('main.BusinessAutomation'):
            return FalaChefePython()
    
    @pytest.mark.asyncio
    async def test_process_conversation_success(self, falachefe):
        """Testa processamento de conversa com sucesso."""
        # Dados de teste
        conversation_data = {
            "id": "test_conv_001",
            "message": "Preciso de ajuda com finanças",
            "user_id": "user_123",
            "session_id": "session_456"
        }
        
        # Mock da resposta do orquestrador
        mock_response = {
            "message": "Olá! Sou o Leo, seu agente financeiro. Como posso ajudar?",
            "agent_name": "leo",
            "success": True
        }
        
        # Mock do analisador
        mock_analysis = {
            "sentiment": "neutral",
            "intent": "question",
            "insights": ["Pergunta financeira detectada"]
        }
        
        # Configura mocks
        falachefe.agent_squad_orchestrator.process_message.return_value = mock_response
        falachefe.conversation_analyzer.analyze_conversation.return_value = mock_analysis
        falachefe.data_processor.update_conversation_data.return_value = None
        
        # Executa teste
        result = await falachefe.process_conversation(conversation_data)
        
        # Verifica resultado
        assert result["processed_by"] == "agent_squad_python"
        assert "response" in result
        assert "analysis" in result
        assert result["response"] == mock_response
        assert result["analysis"] == mock_analysis
    
    @pytest.mark.asyncio
    async def test_process_conversation_with_specific_agent(self, falachefe):
        """Testa processamento de conversa com agente específico."""
        conversation_data = {
            "id": "test_conv_002",
            "message": "Quero criar uma campanha de marketing",
            "user_id": "user_123",
            "session_id": "session_456",
            "agent_name": "max"
        }
        
        mock_response = {
            "message": "Olá! Sou o Max, seu agente de marketing. Vamos criar uma campanha incrível!",
            "agent_name": "max",
            "success": True
        }
        
        mock_analysis = {
            "sentiment": "positive",
            "intent": "request",
            "insights": ["Solicitação de marketing detectada"]
        }
        
        falachefe.agent_squad_orchestrator.process_message_with_specific_agent.return_value = mock_response
        falachefe.conversation_analyzer.analyze_conversation.return_value = mock_analysis
        falachefe.data_processor.update_conversation_data.return_value = None
        
        result = await falachefe.process_conversation(conversation_data)
        
        assert result["processed_by"] == "agent_squad_python"
        assert result["response"]["agent_name"] == "max"
    
    @pytest.mark.asyncio
    async def test_process_conversation_error(self, falachefe):
        """Testa tratamento de erro no processamento de conversa."""
        conversation_data = {
            "id": "test_conv_003",
            "message": "Teste de erro",
            "user_id": "user_123",
            "session_id": "session_456"
        }
        
        # Simula erro no orquestrador
        falachefe.agent_squad_orchestrator.process_message.side_effect = Exception("Erro de teste")
        
        result = await falachefe.process_conversation(conversation_data)
        
        assert result["processed_by"] == "python_fallback"
        assert "error" in result
    
    @pytest.mark.asyncio
    async def test_analyze_financial_data(self, falachefe):
        """Testa análise de dados financeiros."""
        data_source = "test_data"
        
        mock_financial_data = {
            "revenue": {"current_month": 50000, "growth_rate": 0.1},
            "expenses": {"total": 30000},
            "cash_flow": {"net": 20000}
        }
        
        mock_analysis = {
            "revenue_analysis": {"growth_trend": "positive"},
            "recommendations": ["Manter estratégia atual"]
        }
        
        mock_leo_insights = {
            "insights": ["Dados financeiros saudáveis"],
            "recommendations": ["Continuar monitoramento"]
        }
        
        mock_report = {
            "report_id": "fin_20250101_120000",
            "executive_summary": "Análise positiva",
            "recommendations": ["Manter estratégia atual"]
        }
        
        falachefe.data_processor.load_financial_data.return_value = mock_financial_data
        falachefe.data_processor.analyze_financial_data.return_value = mock_analysis
        falachefe.agent_squad_orchestrator.get_leo_insights.return_value = mock_leo_insights
        falachefe.data_processor.generate_financial_report.return_value = mock_report
        
        result = await falachefe.analyze_financial_data(data_source)
        
        assert "report_id" in result
        assert "executive_summary" in result
        assert "recommendations" in result
    
    @pytest.mark.asyncio
    async def test_health_check(self, falachefe):
        """Testa health check do sistema."""
        mock_health_status = {
            "orchestrator": "healthy",
            "agents": {"leo": "healthy", "max": "healthy", "lia": "healthy"},
            "timestamp": datetime.now().isoformat()
        }
        
        falachefe.agent_squad_orchestrator.health_check.return_value = mock_health_status
        falachefe.data_processor.health_check.return_value = {"status": "healthy"}
        falachefe.api_client.health_check.return_value = {"status": "healthy"}
        falachefe.conversation_analyzer.health_check.return_value = {"status": "healthy"}
        falachefe.business_automation.health_check.return_value = {"status": "healthy"}
        
        result = await falachefe.health_check()
        
        assert "timestamp" in result
        assert "status" in result
        assert "components" in result


class TestAgentSquadOrchestrator:
    """Testes para o orquestrador Agent Squad."""
    
    @pytest.fixture
    def mock_config(self):
        """Mock da configuração."""
        config = Mock()
        config.openai_api_key = "test_key"
        config.openai_model = "gpt-4"
        config.debug = False
        return config
    
    @pytest.mark.asyncio
    async def test_process_message_success(self, mock_config):
        """Testa processamento de mensagem com sucesso."""
        with patch('src.core.agent_squad_orchestrator.AgentSquad'), \
             patch('src.core.agent_squad_orchestrator.OpenAIClassifier'), \
             patch('src.core.agent_squad_orchestrator.MemoryStorage'):
            
            from src.core.agent_squad_orchestrator import FalaChefeAgentSquadOrchestrator
            
            orchestrator = FalaChefeAgentSquadOrchestrator(mock_config)
            
            # Mock da resposta do Agent Squad
            mock_response = Mock()
            mock_response.agent_name = "leo"
            mock_response.content = "Resposta do Leo"
            
            orchestrator.agent_squad.route_request.return_value = mock_response
            
            result = await orchestrator.process_message(
                "Preciso de ajuda financeira",
                "user_123",
                "session_456"
            )
            
            assert result["success"] is True
            assert result["agent_name"] == "leo"
            assert "message" in result
    
    @pytest.mark.asyncio
    async def test_process_message_error(self, mock_config):
        """Testa tratamento de erro no processamento de mensagem."""
        with patch('src.core.agent_squad_orchestrator.AgentSquad'), \
             patch('src.core.agent_squad_orchestrator.OpenAIClassifier'), \
             patch('src.core.agent_squad_orchestrator.MemoryStorage'):
            
            from src.core.agent_squad_orchestrator import FalaChefeAgentSquadOrchestrator
            
            orchestrator = FalaChefeAgentSquadOrchestrator(mock_config)
            
            # Simula erro
            orchestrator.agent_squad.route_request.side_effect = Exception("Erro de teste")
            
            result = await orchestrator.process_message(
                "Mensagem de teste",
                "user_123",
                "session_456"
            )
            
            assert result["success"] is False
            assert "error" in result


class TestDataProcessor:
    """Testes para o processador de dados."""
    
    @pytest.fixture
    def mock_config(self):
        """Mock da configuração."""
        config = Mock()
        config.debug = False
        return config
    
    @pytest.mark.asyncio
    async def test_load_financial_data(self, mock_config):
        """Testa carregamento de dados financeiros."""
        from src.core.data_processor import DataProcessor
        
        processor = DataProcessor(mock_config)
        
        result = await processor.load_financial_data("test_source")
        
        assert "revenue" in result
        assert "expenses" in result
        assert "cash_flow" in result
        assert "metrics" in result
    
    @pytest.mark.asyncio
    async def test_analyze_financial_data(self, mock_config):
        """Testa análise de dados financeiros."""
        from src.core.data_processor import DataProcessor
        
        processor = DataProcessor(mock_config)
        
        financial_data = {
            "revenue": {"current_month": 50000, "growth_rate": 0.1},
            "expenses": {"total": 30000},
            "cash_flow": {"net": 20000}
        }
        
        result = await processor.analyze_financial_data(financial_data)
        
        assert "timestamp" in result
        assert "revenue_analysis" in result
        assert "expense_analysis" in result
        assert "cash_flow_analysis" in result
        assert "recommendations" in result


class TestConversationAnalyzer:
    """Testes para o analisador de conversas."""
    
    @pytest.fixture
    def mock_config(self):
        """Mock da configuração."""
        config = Mock()
        return config
    
    @pytest.mark.asyncio
    async def test_analyze_conversation(self, mock_config):
        """Testa análise de conversa."""
        from src.analytics.conversation_analyzer import ConversationAnalyzer
        
        analyzer = ConversationAnalyzer(mock_config)
        
        conversation_data = {
            "id": "test_001",
            "message": "Obrigado pela ajuda!",
            "user_id": "user_123"
        }
        
        response = {
            "message": "De nada! Estou aqui para ajudar.",
            "agent_name": "leo",
            "success": True
        }
        
        result = await analyzer.analyze_conversation(conversation_data, response)
        
        assert "conversation_id" in result
        assert "agent_used" in result
        assert "message_analysis" in result
        assert "response_analysis" in result
        assert "conversation_metrics" in result
        assert "insights" in result
        assert "recommendations" in result
    
    def test_analyze_sentiment(self, mock_config):
        """Testa análise de sentimento."""
        from src.analytics.conversation_analyzer import ConversationAnalyzer
        
        analyzer = ConversationAnalyzer(mock_config)
        
        # Teste sentimento positivo
        result = analyzer._analyze_sentiment("Obrigado, excelente trabalho!")
        assert result["label"] == "positive"
        assert result["score"] > 0.5
        
        # Teste sentimento negativo
        result = analyzer._analyze_sentiment("Péssimo atendimento, muito ruim")
        assert result["label"] == "negative"
        assert result["score"] > 0.5
        
        # Teste sentimento neutro
        result = analyzer._analyze_sentiment("Ok, entendi")
        assert result["label"] == "neutral"
    
    def test_analyze_intent(self, mock_config):
        """Testa análise de intenção."""
        from src.analytics.conversation_analyzer import ConversationAnalyzer
        
        analyzer = ConversationAnalyzer(mock_config)
        
        # Teste pergunta
        result = analyzer._analyze_intent("Como posso melhorar minhas vendas?")
        assert result["label"] == "question"
        
        # Teste solicitação
        result = analyzer._analyze_intent("Preciso de ajuda com marketing")
        assert result["label"] == "request"
        
        # Teste cumprimento
        result = analyzer._analyze_intent("Olá, bom dia!")
        assert result["label"] == "greeting"


if __name__ == "__main__":
    # Executa os testes
    pytest.main([__file__, "-v"])
