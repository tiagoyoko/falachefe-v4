#!/usr/bin/env python3
"""
Teste Real da Integração Python do FalaChefe v4
Testa o sistema híbrido com dados reais.
"""

import asyncio
import json
import sys
from datetime import datetime
from pathlib import Path

# Adiciona o projeto ao path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from main import FalaChefePython


class RealTestRunner:
    """Executa testes reais da integração."""
    
    def __init__(self):
        self.falachefe = None
        self.test_results = []
    
    async def setup(self):
        """Configura o ambiente de teste."""
        print("🔧 Configurando ambiente de teste...")
        
        try:
            # Inicializa o FalaChefe Python
            self.falachefe = FalaChefePython()
            print("✅ FalaChefe Python inicializado")
            
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
    
    async def test_system_switching(self):
        """Testa troca de sistemas."""
        print("\n🔄 Testando Troca de Sistemas...")
        
        try:
            # Verifica status inicial
            initial_status = await self.falachefe.get_system_status()
            print(f"Sistema inicial: {initial_status.get('active_system', 'unknown')}")
            
            # Testa troca para Python
            print("Tentando trocar para Python...")
            switch_result = await self.falachefe.switch_agent_system("python")
            
            if switch_result.get('success'):
                print(f"✅ {switch_result.get('message', 'Sistema alterado')}")
                
                # Verifica novo status
                new_status = await self.falachefe.get_system_status()
                print(f"Novo sistema: {new_status.get('active_system', 'unknown')}")
                
                # Volta para TypeScript
                print("Voltando para TypeScript...")
                switch_back = await self.falachefe.switch_agent_system("typescript")
                
                if switch_back.get('success'):
                    print(f"✅ {switch_back.get('message', 'Sistema alterado')}")
                else:
                    print(f"⚠️ {switch_back.get('error', 'Erro na troca')}")
                
            else:
                print(f"⚠️ {switch_result.get('error', 'Erro na troca')}")
            
            self.test_results.append({
                "test": "system_switching",
                "status": "passed" if switch_result.get('success') else "failed",
                "details": switch_result
            })
            
            return switch_result.get('success', False)
            
        except Exception as e:
            print(f"❌ Erro na troca de sistemas: {str(e)}")
            self.test_results.append({
                "test": "system_switching",
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
    
    async def test_marketing_analysis(self):
        """Testa análise de marketing."""
        print("\n📈 Testando Análise de Marketing...")
        
        try:
            campaign_data = {
                "name": "Campanha Teste Q1",
                "platform": "whatsapp",
                "budget": 5000,
                "spent": 3200,
                "conversions": 45
            }
            
            result = await self.falachefe.process_marketing_campaign(campaign_data)
            
            if result.get('error'):
                print(f"❌ Erro na análise de marketing: {result['error']}")
                return False
            
            print("✅ Análise de marketing executada com sucesso")
            
            if 'insights' in result:
                print(f"💡 Insights: {len(result['insights'])} itens")
            
            if 'recommendations' in result:
                print(f"📋 Recomendações: {len(result['recommendations'])} itens")
            
            self.test_results.append({
                "test": "marketing_analysis",
                "status": "passed",
                "details": result
            })
            
            return True
            
        except Exception as e:
            print(f"❌ Erro na análise de marketing: {str(e)}")
            self.test_results.append({
                "test": "marketing_analysis",
                "status": "failed",
                "error": str(e)
            })
            return False
    
    async def test_hr_processing(self):
        """Testa processamento de RH."""
        print("\n👥 Testando Processamento de RH...")
        
        try:
            hr_data = {
                "type": "payroll",
                "employees": 25,
                "month": "2025-01"
            }
            
            result = await self.falachefe.process_hr_operations(hr_data)
            
            if result.get('error'):
                print(f"❌ Erro no processamento de RH: {result['error']}")
                return False
            
            print("✅ Processamento de RH executado com sucesso")
            
            if 'recommendations' in result:
                print(f"📋 Recomendações: {len(result['recommendations'])} itens")
            
            self.test_results.append({
                "test": "hr_processing",
                "status": "passed",
                "details": result
            })
            
            return True
            
        except Exception as e:
            print(f"❌ Erro no processamento de RH: {str(e)}")
            self.test_results.append({
                "test": "hr_processing",
                "status": "failed",
                "error": str(e)
            })
            return False
    
    async def test_batch_processing(self):
        """Testa processamento em lote."""
        print("\n📦 Testando Processamento em Lote...")
        
        try:
            # Testa processamento financeiro em lote
            result = await self.falachefe.run_batch_processing("financial")
            
            if result.get('error'):
                print(f"❌ Erro no processamento em lote: {result['error']}")
                return False
            
            print("✅ Processamento em lote executado com sucesso")
            
            self.test_results.append({
                "test": "batch_processing",
                "status": "passed",
                "details": result
            })
            
            return True
            
        except Exception as e:
            print(f"❌ Erro no processamento em lote: {str(e)}")
            self.test_results.append({
                "test": "batch_processing",
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
        await self.test_system_switching()
        await self.test_conversation_processing()
        await self.test_financial_analysis()
        await self.test_marketing_analysis()
        await self.test_hr_processing()
        await self.test_batch_processing()
        
        # Resumo
        self.print_summary()


async def main():
    """Função principal."""
    runner = RealTestRunner()
    await runner.run_all_tests()


if __name__ == "__main__":
    asyncio.run(main())
