"""
Analisador de conversas do FalaChefe Python.
Fornece insights e métricas sobre conversas processadas.
"""

import asyncio
import json
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import re
from collections import Counter

from ..utils.config import Config
from ..utils.logger import get_component_logger


class ConversationAnalyzer:
    """
    Analisador de conversas para extrair insights e métricas.
    Complementa o Agent Squad Framework com análise de dados.
    """
    
    def __init__(self, config: Config):
        """Inicializa o analisador de conversas."""
        self.config = config
        self.logger = get_component_logger("conversation_analyzer")
        
        # Cache de análises
        self.analysis_cache = {}
        
        # Padrões para análise
        self.sentiment_patterns = {
            "positive": ["obrigado", "perfeito", "excelente", "ótimo", "maravilhoso", "fantástico"],
            "negative": ["ruim", "péssimo", "terrível", "horrível", "não gostei", "problema"],
            "neutral": ["ok", "entendi", "certo", "beleza", "tudo bem"]
        }
        
        self.logger.info("ConversationAnalyzer inicializado")
    
    async def analyze_conversation(self, conversation_data: Dict[str, Any], response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analisa uma conversa individual.
        
        Args:
            conversation_data: Dados da conversa original
            response: Resposta do agente
            
        Returns:
            Análise da conversa
        """
        try:
            self.logger.info("Iniciando análise de conversa")
            
            message = conversation_data.get("message", "")
            agent_name = response.get("agent_name", "unknown")
            
            analysis = {
                "conversation_id": conversation_data.get("id", "unknown"),
                "timestamp": datetime.now().isoformat(),
                "agent_used": agent_name,
                "message_analysis": await self._analyze_message(message),
                "response_analysis": await self._analyze_response(response),
                "conversation_metrics": await self._calculate_metrics(conversation_data, response),
                "insights": await self._generate_insights(conversation_data, response),
                "recommendations": await self._generate_recommendations(conversation_data, response)
            }
            
            # Cache da análise
            self.analysis_cache[conversation_data.get("id", "unknown")] = analysis
            
            self.logger.info("Análise de conversa concluída")
            return analysis
            
        except Exception as e:
            self.logger.error(f"Erro na análise de conversa: {str(e)}")
            return {"error": str(e)}
    
    async def _analyze_message(self, message: str) -> Dict[str, Any]:
        """Analisa a mensagem do usuário."""
        try:
            # Análise de sentimento
            sentiment = self._analyze_sentiment(message)
            
            # Análise de intenção
            intent = self._analyze_intent(message)
            
            # Análise de complexidade
            complexity = self._analyze_complexity(message)
            
            # Extração de entidades
            entities = self._extract_entities(message)
            
            return {
                "sentiment": sentiment,
                "intent": intent,
                "complexity": complexity,
                "entities": entities,
                "word_count": len(message.split()),
                "character_count": len(message)
            }
            
        except Exception as e:
            self.logger.error(f"Erro na análise da mensagem: {str(e)}")
            return {"error": str(e)}
    
    def _analyze_sentiment(self, message: str) -> Dict[str, Any]:
        """Analisa o sentimento da mensagem."""
        message_lower = message.lower()
        
        positive_score = sum(1 for word in self.sentiment_patterns["positive"] if word in message_lower)
        negative_score = sum(1 for word in self.sentiment_patterns["negative"] if word in message_lower)
        neutral_score = sum(1 for word in self.sentiment_patterns["neutral"] if word in message_lower)
        
        total_score = positive_score + negative_score + neutral_score
        
        if total_score == 0:
            return {"label": "neutral", "score": 0.5, "confidence": 0.3}
        
        if positive_score > negative_score:
            return {"label": "positive", "score": positive_score / total_score, "confidence": 0.7}
        elif negative_score > positive_score:
            return {"label": "negative", "score": negative_score / total_score, "confidence": 0.7}
        else:
            return {"label": "neutral", "score": 0.5, "confidence": 0.5}
    
    def _analyze_intent(self, message: str) -> Dict[str, Any]:
        """Analisa a intenção da mensagem."""
        message_lower = message.lower()
        
        intents = {
            "question": ["como", "quando", "onde", "por que", "o que", "qual", "?"],
            "request": ["preciso", "quero", "gostaria", "pode", "poderia"],
            "complaint": ["reclamação", "problema", "erro", "não funciona", "bug"],
            "compliment": ["parabéns", "muito bom", "excelente", "ótimo trabalho"],
            "greeting": ["oi", "olá", "bom dia", "boa tarde", "boa noite"],
            "goodbye": ["tchau", "até logo", "obrigado", "valeu"]
        }
        
        intent_scores = {}
        for intent, keywords in intents.items():
            score = sum(1 for keyword in keywords if keyword in message_lower)
            intent_scores[intent] = score
        
        if not any(intent_scores.values()):
            return {"label": "unknown", "confidence": 0.1}
        
        best_intent = max(intent_scores, key=intent_scores.get)
        confidence = intent_scores[best_intent] / len(message.split())
        
        return {"label": best_intent, "confidence": min(confidence, 1.0)}
    
    def _analyze_complexity(self, message: str) -> Dict[str, Any]:
        """Analisa a complexidade da mensagem."""
        words = message.split()
        sentences = re.split(r'[.!?]+', message)
        
        avg_words_per_sentence = len(words) / len(sentences) if sentences else 0
        
        # Palavras complexas (mais de 8 caracteres)
        complex_words = [word for word in words if len(word) > 8]
        complexity_ratio = len(complex_words) / len(words) if words else 0
        
        # Nível de complexidade
        if complexity_ratio > 0.3 or avg_words_per_sentence > 15:
            level = "high"
        elif complexity_ratio > 0.1 or avg_words_per_sentence > 8:
            level = "medium"
        else:
            level = "low"
        
        return {
            "level": level,
            "avg_words_per_sentence": avg_words_per_sentence,
            "complexity_ratio": complexity_ratio,
            "complex_words_count": len(complex_words)
        }
    
    def _extract_entities(self, message: str) -> List[Dict[str, Any]]:
        """Extrai entidades da mensagem."""
        entities = []
        
        # Números
        numbers = re.findall(r'\d+', message)
        for number in numbers:
            entities.append({"type": "number", "value": number, "confidence": 0.8})
        
        # Emails
        emails = re.findall(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', message)
        for email in emails:
            entities.append({"type": "email", "value": email, "confidence": 0.9})
        
        # Telefones
        phones = re.findall(r'\(\d{2}\)\s?\d{4,5}-?\d{4}', message)
        for phone in phones:
            entities.append({"type": "phone", "value": phone, "confidence": 0.8})
        
        # Valores monetários
        money = re.findall(r'R\$\s?\d+[.,]?\d*', message)
        for value in money:
            entities.append({"type": "money", "value": value, "confidence": 0.9})
        
        return entities
    
    async def _analyze_response(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """Analisa a resposta do agente."""
        try:
            message = response.get("message", "")
            agent_name = response.get("agent_name", "unknown")
            
            return {
                "agent_name": agent_name,
                "response_length": len(message),
                "response_quality": self._assess_response_quality(message),
                "success": response.get("success", False),
                "timestamp": response.get("timestamp", datetime.now().isoformat())
            }
            
        except Exception as e:
            self.logger.error(f"Erro na análise da resposta: {str(e)}")
            return {"error": str(e)}
    
    def _assess_response_quality(self, message: str) -> Dict[str, Any]:
        """Avalia a qualidade da resposta."""
        if not message:
            return {"score": 0, "issues": ["empty_response"]}
        
        issues = []
        score = 1.0
        
        # Verifica se a resposta é muito curta
        if len(message.split()) < 3:
            issues.append("too_short")
            score -= 0.3
        
        # Verifica se contém informações úteis
        useful_indicators = ["aqui", "exemplo", "dica", "sugestão", "recomendo"]
        if not any(indicator in message.lower() for indicator in useful_indicators):
            if len(message.split()) > 10:  # Só aplica para respostas longas
                issues.append("may_lack_useful_info")
                score -= 0.1
        
        # Verifica se está em português
        if not any(char in message for char in "áéíóúâêîôûãõç"):
            issues.append("may_not_be_portuguese")
            score -= 0.1
        
        return {
            "score": max(score, 0.0),
            "issues": issues
        }
    
    async def _calculate_metrics(self, conversation_data: Dict[str, Any], response: Dict[str, Any]) -> Dict[str, Any]:
        """Calcula métricas da conversa."""
        try:
            # Tempo de resposta (simulado)
            response_time = 2.5  # Em produção, calcular baseado em timestamps
            
            # Taxa de sucesso
            success_rate = 1.0 if response.get("success", False) else 0.0
            
            # Satisfação do usuário (simulada baseada no sentimento)
            message_analysis = await self._analyze_message(conversation_data.get("message", ""))
            sentiment_score = message_analysis.get("sentiment", {}).get("score", 0.5)
            user_satisfaction = sentiment_score * 5  # Escala de 1-5
            
            return {
                "response_time_seconds": response_time,
                "success_rate": success_rate,
                "user_satisfaction": user_satisfaction,
                "message_complexity": message_analysis.get("complexity", {}).get("level", "unknown"),
                "intent_confidence": message_analysis.get("intent", {}).get("confidence", 0.0)
            }
            
        except Exception as e:
            self.logger.error(f"Erro no cálculo de métricas: {str(e)}")
            return {"error": str(e)}
    
    async def _generate_insights(self, conversation_data: Dict[str, Any], response: Dict[str, Any]) -> List[str]:
        """Gera insights da conversa."""
        insights = []
        
        message = conversation_data.get("message", "")
        agent_name = response.get("agent_name", "unknown")
        
        # Insight sobre o agente usado
        if agent_name != "unknown":
            insights.append(f"Agente {agent_name} foi selecionado para esta conversa")
        
        # Insight sobre complexidade
        message_analysis = await self._analyze_message(message)
        complexity = message_analysis.get("complexity", {}).get("level", "unknown")
        if complexity == "high":
            insights.append("Mensagem de alta complexidade detectada - pode precisar de follow-up")
        
        # Insight sobre sentimento
        sentiment = message_analysis.get("sentiment", {}).get("label", "neutral")
        if sentiment == "negative":
            insights.append("Sentimento negativo detectado - monitorar satisfação do usuário")
        elif sentiment == "positive":
            insights.append("Sentimento positivo detectado - usuário satisfeito")
        
        # Insight sobre intenção
        intent = message_analysis.get("intent", {}).get("label", "unknown")
        if intent == "question":
            insights.append("Pergunta direta detectada - resposta precisa ser informativa")
        elif intent == "complaint":
            insights.append("Reclamação detectada - priorizar resolução")
        
        return insights
    
    async def _generate_recommendations(self, conversation_data: Dict[str, Any], response: Dict[str, Any]) -> List[str]:
        """Gera recomendações baseadas na conversa."""
        recommendations = []
        
        message_analysis = await self._analyze_message(conversation_data.get("message", ""))
        response_analysis = await self._analyze_response(response)
        
        # Recomendação baseada na qualidade da resposta
        response_quality = response_analysis.get("response_quality", {})
        if response_quality.get("score", 1.0) < 0.7:
            recommendations.append("Melhorar qualidade das respostas - resposta atual pode não ser satisfatória")
        
        # Recomendação baseada no sentimento
        sentiment = message_analysis.get("sentiment", {}).get("label", "neutral")
        if sentiment == "negative":
            recommendations.append("Implementar follow-up para usuários com sentimento negativo")
        
        # Recomendação baseada na complexidade
        complexity = message_analysis.get("complexity", {}).get("level", "unknown")
        if complexity == "high":
            recommendations.append("Considerar respostas mais detalhadas para mensagens complexas")
        
        return recommendations
    
    async def get_conversation_analytics(self, time_period: str = "7d") -> Dict[str, Any]:
        """
        Obtém analytics agregados das conversas.
        
        Args:
            time_period: Período de análise (1d, 7d, 30d)
            
        Returns:
            Analytics agregados
        """
        try:
            self.logger.info(f"Gerando analytics para período: {time_period}")
            
            # Simula analytics baseado no cache
            total_conversations = len(self.analysis_cache)
            
            if total_conversations == 0:
                return {
                    "period": time_period,
                    "total_conversations": 0,
                    "message": "Nenhuma conversa analisada no período"
                }
            
            # Agrega métricas
            analytics = {
                "period": time_period,
                "total_conversations": total_conversations,
                "agent_distribution": self._get_agent_distribution(),
                "sentiment_distribution": self._get_sentiment_distribution(),
                "intent_distribution": self._get_intent_distribution(),
                "average_metrics": self._get_average_metrics(),
                "top_insights": self._get_top_insights(),
                "recommendations": self._get_aggregate_recommendations()
            }
            
            return analytics
            
        except Exception as e:
            self.logger.error(f"Erro ao gerar analytics: {str(e)}")
            return {"error": str(e)}
    
    def _get_agent_distribution(self) -> Dict[str, int]:
        """Calcula distribuição por agente."""
        distribution = {"leo": 0, "max": 0, "lia": 0, "unknown": 0}
        
        for analysis in self.analysis_cache.values():
            agent = analysis.get("agent_used", "unknown")
            if agent in distribution:
                distribution[agent] += 1
        
        return distribution
    
    def _get_sentiment_distribution(self) -> Dict[str, int]:
        """Calcula distribuição por sentimento."""
        distribution = {"positive": 0, "negative": 0, "neutral": 0}
        
        for analysis in self.analysis_cache.values():
            sentiment = analysis.get("message_analysis", {}).get("sentiment", {}).get("label", "neutral")
            if sentiment in distribution:
                distribution[sentiment] += 1
        
        return distribution
    
    def _get_intent_distribution(self) -> Dict[str, int]:
        """Calcula distribuição por intenção."""
        distribution = {}
        
        for analysis in self.analysis_cache.values():
            intent = analysis.get("message_analysis", {}).get("intent", {}).get("label", "unknown")
            distribution[intent] = distribution.get(intent, 0) + 1
        
        return distribution
    
    def _get_average_metrics(self) -> Dict[str, float]:
        """Calcula métricas médias."""
        if not self.analysis_cache:
            return {}
        
        total_conversations = len(self.analysis_cache)
        
        avg_response_time = sum(
            analysis.get("conversation_metrics", {}).get("response_time_seconds", 0)
            for analysis in self.analysis_cache.values()
        ) / total_conversations
        
        avg_satisfaction = sum(
            analysis.get("conversation_metrics", {}).get("user_satisfaction", 0)
            for analysis in self.analysis_cache.values()
        ) / total_conversations
        
        avg_success_rate = sum(
            analysis.get("conversation_metrics", {}).get("success_rate", 0)
            for analysis in self.analysis_cache.values()
        ) / total_conversations
        
        return {
            "avg_response_time_seconds": round(avg_response_time, 2),
            "avg_user_satisfaction": round(avg_satisfaction, 2),
            "avg_success_rate": round(avg_success_rate, 2)
        }
    
    def _get_top_insights(self) -> List[str]:
        """Obtém insights mais frequentes."""
        all_insights = []
        
        for analysis in self.analysis_cache.values():
            all_insights.extend(analysis.get("insights", []))
        
        # Conta frequência dos insights
        insight_counts = Counter(all_insights)
        
        # Retorna os 5 mais frequentes
        return [insight for insight, count in insight_counts.most_common(5)]
    
    def _get_aggregate_recommendations(self) -> List[str]:
        """Obtém recomendações agregadas."""
        all_recommendations = []
        
        for analysis in self.analysis_cache.values():
            all_recommendations.extend(analysis.get("recommendations", []))
        
        # Remove duplicatas e retorna únicas
        return list(set(all_recommendations))
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Verifica a saúde do analisador.
        
        Returns:
            Status de saúde do componente
        """
        try:
            return {
                "component": "conversation_analyzer",
                "status": "healthy",
                "cache_size": len(self.analysis_cache),
                "patterns_loaded": len(self.sentiment_patterns),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                "component": "conversation_analyzer",
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
