#!/usr/bin/env python3
"""
Teste Real com Mock do Agent Squad Framework
Simula o comportamento do Agent Squad para testar a integração.
"""

import asyncio
import json
import sys
from datetime import datetime
from pathlib import Path
from unittest.mock import Mock, patch

# Adiciona o projeto ao path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))


class MockAgentSquad:
    """Mock do Agent Squad Framework."""
    
    def __init__(self, **kwargs):
        self.agents = {}
        self.default_agent = None
        self.config = kwargs.get('config', {})
    
    def add_agent(self, agent):
        """Adiciona um agente."""
        self.agents[agent.name] = agent
    
    def set_default_agent(self, agent):
        """Define agente padrão."""
        self.default_agent = agent
    
    def get_agent(self, name):
        """Obtém um agente."""
        return self.agents.get(name)
    
    async def route_request(self, message, user_id, session_id):
        """Roteia requisição."""
        # Simula classificação de intenção
        if any(word in message.lower() for word in ['financeiro', 'dinheiro', 'caixa', 'receita']):
            agent_name = 'leo'
        elif any(word in message.lower() for word in ['marketing', 'vendas', 'campanha', 'cliente']):
            agent_name = 'max'
        elif any(word in message.lower() for word in ['rh', 'funcionário', 'pessoas', 'equipe']):
            agent_name = 'lia'
        else:
            agent_name = 'max'  # Padrão
        
        agent = self.agents.get(agent_name, self.default_agent)
        if agent:
            return await agent.process_message(message, user_id, session_id)
        else:
            return MockResponse("Desculpe, agente não disponível", agent_name)


class MockOpenAIClassifier:
    """Mock do classificador OpenAI."""
    
    def __init__(self, **kwargs):
        self.api_key = kwargs.get('api_key', 'test_key')


class MockOpenAIAgent:
    """Mock do agente OpenAI."""
    
    def __init__(self, **kwargs):
        self.name = kwargs.get('name', 'unknown')
        self.description = kwargs.get('description', '')
        self.temperature = kwargs.get('temperature', 0.7)
        self.retriever = kwargs.get('retriever')
    
    async def process_message(self, message, user_id, session_id):
        """Processa mensagem."""
        # Simula resposta baseada no agente
        if self.name == 'leo':
            response = f"Olá! Sou o Leo, seu agente financeiro. Vou ajudar com: {message[:50]}..."
        elif self.name == 'max':
            response = f"Oi! Sou o Max, especialista em marketing. Vamos trabalhar em: {message[:50]}..."
        elif self.name == 'lia':
            response = f"Olá! Sou a Lia, especialista em RH. Como posso ajudar com: {message[:50]}..."
        else:
            response = f"Resposta padrão para: {message[:50]}..."
        
        return MockResponse(response, self.name)


class MockResponse:
    """Mock de resposta."""
    
    def __init__(self, content, agent_name):
        self.content = content
        self.agent_name = agent_name


class MockRetriever:
    """Mock do retriever."""
    
    def __init__(self, **kwargs):
        self.agent_id = kwargs.get('agent_id', 'unknown')
    
    async def retrieve(self, text):
        """Simula busca de conhecimento."""
        return [
            {"content": f"Conhecimento relevante para: {text[:30]}...", "score": 0.8},
            {"content": "Informação adicional relacionada", "score": 0.6}
        ]


class RealTestRunner:
    """Executa testes reais da integração."""
    
    def __init__(self):
        self.falachefe = None
        self.test_results = []
    
    async def setup(self):
        """Configura o ambiente de teste."""
        print("🔧 Configurando ambiente de teste...")
        
        try:
            # Mock do Agent Squad Framework
            with patch('src.core.agent_squad_orchestrator.AgentSquad', MockAgentSquad), \
                 patch('src.core.agent_squad_orchestrator.OpenAIClassifier', MockOpenAIClassifier), \
                 patch('src.core.agent_squad_orchestrator.OpenAIAgent', MockOpenAIAgent), \
                 patch('src.core.agent_squad_orchestrator.MemoryStorage', Mock), \
                 patch('src.core.knowledge_retrievers.BaseKnowledgeRetriever', MockRetriever):
                
                # Inicializa o FalaChefe Python
                self.falachefe = FalaChefePython()
                print("✅ FalaChefe Python inicializado com mocks")
                
                # Verifica status do sistema
                status = await self.falachefe.get_system_status()
                print(f"📊 Sistema ativo: {status.get('active_system', 'unknown')}")
                
                return True
                
        except Exception as e:
            print(f"❌ Erro na configuração: {str(e)}")
            return False
    
    async def test_health_check(self):
        """Testa health check do sistema."""
        print("\n🏥 Testando Health Check...")
        
        try:
            health = await self.falachefe.health_check()
            
            print(f"Status geral: {health.get('status', 'unknown')}")
            print("Componentes:")
            
            for component, status in health.get('components', {}).items():
                status_icon = "✅" if status.get('status') == 'healthy' else "❌"
                print(f"  {status_icon} {component}: {status.get('status', 'unknown')}")
            
            self.test_results.append({
                "test": "health_check",
                "status": "passed" if health.get('status') == 'healthy' else "failed",
                "details": health
            })
            
            return health.get('status') == 'healthy'
            
        except Exception as e:
            print(f"❌ Erro no health check: {str(e)}")
            self.test_results.append({
                "test": "health_check",
                "status": "failed",
                "error": str(e)
            })
            return False
    
    async def test_conversation_processing(self):
        """Testa processamento de conversas."""
        print("\n💬 Testando Processamento de Conversas...")
        
        test_conversations = [
            {
                "id": "test_conv_001",
                "message": "Preciso de ajuda com finanças da minha empresa",
                "user_id": "user_test_001",
                "session_id": "session_test_001",
                "expected_agent": "leo"
            },
            {
                "id": "test_conv_002", 
                "message": "Como criar uma campanha de marketing no WhatsApp?",
                "user_id": "user_test_002",
                "session_id": "session_test_002",
                "expected_agent": "max"
            },
            {
                "id": "test_conv_003",
                "message": "Preciso de ajuda com gestão de funcionários",
                "user_id": "user_test_003",
                "session_id": "session_test_003",
                "expected_agent": "lia"
            }
        ]
        
        passed_tests = 0
        
        for i, conv in enumerate(test_conversations, 1):
            print(f"\n  Teste {i}: {conv['message'][:50]}...")
            
            try:
                result = await self.falachefe.process_conversation(conv)
                
                if result.get('error'):
                    print(f"    ❌ Erro: {result['error']}")
                    continue
                
                response = result.get('response', {})
                agent_used = response.get('agent_name', 'unknown')
                system_used = result.get('processed_by', 'unknown')
                
                print(f"    Agente usado: {agent_used}")
                print(f"    Sistema usado: {system_used}")
                print(f"    Resposta: {response.get('message', 'N/A')[:100]}...")
                
                # Verifica se o agente correto foi usado
                if agent_used == conv['expected_agent']:
                    print(f"    ✅ Agente correto ({agent_used})")
                    passed_tests += 1
                else:
                    print(f"    ⚠️ Agente esperado: {conv['expected_agent']}, usado: {agent_used}")
                
                # Verifica análise
                analysis = result.get('analysis', {})
                if analysis:
                    print(f"    📊 Análise: {len(analysis.get('insights', []))} insights gerados")
                
            except Exception as e:
                print(f"    ❌ Erro no teste {i}: {str(e)}")
        
        success_rate = passed_tests / len(test_conversations)
        print(f"\n  📈 Taxa de sucesso: {success_rate:.1%} ({passed_tests}/{len(test_conversations)})")
        
        self.test_results.append({
            "test": "conversation_processing",
            "status": "passed" if success_rate > 0.5 else "failed",
            "success_rate": success_rate,
            "passed_tests": passed_tests,
            "total_tests": len(test_conversations)
        })
        
        return success_rate > 0.5
    
    async def test_financial_analysis(self):
        """Testa análise financeira."""
        print("\n💰 Testando Análise Financeira...")
        
        try:
            # Testa análise financeira
            result = await self.falachefe.analyze_financial_data("test_data")
            
            if result.get('error'):
                print(f"❌ Erro na análise financeira: {result['error']}")
                return False
            
            print("✅ Análise financeira executada com sucesso")
            
            # Verifica estrutura do resultado
            if 'executive_summary' in result:
                print(f"📊 Resumo executivo: {result['executive_summary']}")
            
            if 'recommendations' in result:
                print(f"💡 Recomendações: {len(result['recommendations'])} itens")
            
            self.test_results.append({
                "test": "financial_analysis",
                "status": "passed",
                "details": result
            })
            
            return True
            
        except Exception as e:
            print(f"❌ Erro na análise financeira: {str(e)}")
            self.test_results.append({
                "test": "financial_analysis",
                "status": "failed",
                "error": str(e)
            })
            return False
    
    def print_summary(self):
        """Imprime resumo dos testes."""
        print("\n" + "="*60)
        print("📊 RESUMO DOS TESTES")
        print("="*60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['status'] == 'passed')
        failed_tests = total_tests - passed_tests
        
        print(f"Total de testes: {total_tests}")
        print(f"✅ Aprovados: {passed_tests}")
        print(f"❌ Falharam: {failed_tests}")
        print(f"📈 Taxa de sucesso: {(passed_tests/total_tests)*100:.1f}%")
        
        print("\nDetalhes por teste:")
        for result in self.test_results:
            status_icon = "✅" if result['status'] == 'passed' else "❌"
            print(f"  {status_icon} {result['test']}: {result['status']}")
            
            if 'error' in result:
                print(f"      Erro: {result['error']}")
        
        print("\n" + "="*60)
        
        if passed_tests == total_tests:
            print("🎉 TODOS OS TESTES PASSARAM! Sistema funcionando perfeitamente.")
        elif passed_tests > total_tests * 0.7:
            print("✅ Maioria dos testes passou. Sistema funcionando bem.")
        else:
            print("⚠️ Alguns testes falharam. Verifique a configuração.")
    
    async def run_all_tests(self):
        """Executa todos os testes."""
        print("🚀 INICIANDO TESTES REAIS DO FALACHEFE PYTHON")
        print("="*60)
        
        # Setup
        if not await self.setup():
            print("❌ Falha na configuração. Abortando testes.")
            return
        
        # Executa testes
        await self.test_health_check()
        await self.test_conversation_processing()
        await self.test_financial_analysis()
        
        # Resumo
        self.print_summary()


async def main():
    """Função principal."""
    runner = RealTestRunner()
    await runner.run_all_tests()


if __name__ == "__main__":
    asyncio.run(main())
