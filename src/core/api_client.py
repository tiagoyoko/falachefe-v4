"""
Cliente API para integração com serviços externos do FalaChefe.
Gerencia comunicação com WhatsApp, Supabase e outras APIs.
"""

import asyncio
import aiohttp
import json
from typing import Dict, Any, Optional
from datetime import datetime

from ..utils.config import Config
from ..utils.logger import get_component_logger


class FalaChefeAPIClient:
    """
    Cliente API para integração com serviços externos.
    Gerencia comunicação com WhatsApp, Supabase e outras APIs.
    """
    
    def __init__(self, config: Config):
        """Inicializa o cliente API."""
        self.config = config
        self.logger = get_component_logger("api_client")
        
        # Configurações de API
        self.api_config = self.config.get_api_config()
        
        # Sessão HTTP assíncrona
        self.session = None
        
        self.logger.info("FalaChefe API Client inicializado")
    
    async def __aenter__(self):
        """Context manager entry."""
        await self._create_session()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        await self._close_session()
    
    async def _create_session(self):
        """Cria sessão HTTP assíncrona."""
        if not self.session:
            timeout = aiohttp.ClientTimeout(total=30)
            self.session = aiohttp.ClientSession(timeout=timeout)
    
    async def _close_session(self):
        """Fecha sessão HTTP."""
        if self.session:
            await self.session.close()
            self.session = None
    
    async def send_whatsapp_message(self, phone_number: str, message: str, message_type: str = "text") -> Dict[str, Any]:
        """
        Envia mensagem via WhatsApp API.
        
        Args:
            phone_number: Número do telefone
            message: Conteúdo da mensagem
            message_type: Tipo da mensagem (text, image, document)
            
        Returns:
            Resposta da API do WhatsApp
        """
        try:
            await self._create_session()
            
            whatsapp_config = self.api_config["whatsapp"]
            url = f"{whatsapp_config['url']}/send-message"
            
            headers = {
                "Authorization": f"Bearer {whatsapp_config['token']}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "phone": phone_number,
                "message": message,
                "type": message_type,
                "timestamp": datetime.now().isoformat()
            }
            
            self.logger.info(f"Enviando mensagem WhatsApp para {phone_number}")
            
            async with self.session.post(url, headers=headers, json=payload) as response:
                if response.status == 200:
                    result = await response.json()
                    self.logger.info("Mensagem WhatsApp enviada com sucesso")
                    return {
                        "success": True,
                        "message_id": result.get("id"),
                        "status": "sent"
                    }
                else:
                    error_text = await response.text()
                    self.logger.error(f"Erro ao enviar mensagem WhatsApp: {response.status} - {error_text}")
                    return {
                        "success": False,
                        "error": f"HTTP {response.status}: {error_text}"
                    }
                    
        except Exception as e:
            self.logger.error(f"Erro ao enviar mensagem WhatsApp: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_whatsapp_webhook(self, webhook_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processa webhook do WhatsApp.
        
        Args:
            webhook_data: Dados do webhook
            
        Returns:
            Dados processados do webhook
        """
        try:
            self.logger.info("Processando webhook do WhatsApp")
            
            # Valida assinatura do webhook se configurada
            if self.api_config["whatsapp"].get("webhook_secret"):
                if not self._validate_webhook_signature(webhook_data):
                    return {"error": "Invalid webhook signature"}
            
            # Extrai dados da mensagem
            message_data = {
                "id": webhook_data.get("id"),
                "from": webhook_data.get("from"),
                "message": webhook_data.get("message", {}).get("text", ""),
                "timestamp": webhook_data.get("timestamp"),
                "type": webhook_data.get("message", {}).get("type", "text")
            }
            
            self.logger.info(f"Webhook processado: {message_data['id']}")
            return {
                "success": True,
                "message_data": message_data
            }
            
        except Exception as e:
            self.logger.error(f"Erro ao processar webhook: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _validate_webhook_signature(self, webhook_data: Dict[str, Any]) -> bool:
        """
        Valida assinatura do webhook (implementação básica).
        
        Args:
            webhook_data: Dados do webhook
            
        Returns:
            True se assinatura é válida
        """
        # Implementação básica - em produção use HMAC
        return True
    
    async def save_to_supabase(self, table: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Salva dados no Supabase.
        
        Args:
            table: Nome da tabela
            data: Dados para salvar
            
        Returns:
            Resposta do Supabase
        """
        try:
            await self._create_session()
            
            supabase_config = self.api_config["supabase"]
            url = f"{supabase_config['url']}/rest/v1/{table}"
            
            headers = {
                "apikey": supabase_config["anon_key"],
                "Authorization": f"Bearer {supabase_config['anon_key']}",
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
            }
            
            self.logger.info(f"Salvando dados no Supabase: {table}")
            
            async with self.session.post(url, headers=headers, json=data) as response:
                if response.status in [200, 201]:
                    result = await response.json()
                    self.logger.info("Dados salvos no Supabase com sucesso")
                    return {
                        "success": True,
                        "data": result
                    }
                else:
                    error_text = await response.text()
                    self.logger.error(f"Erro ao salvar no Supabase: {response.status} - {error_text}")
                    return {
                        "success": False,
                        "error": f"HTTP {response.status}: {error_text}"
                    }
                    
        except Exception as e:
            self.logger.error(f"Erro ao salvar no Supabase: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_from_supabase(self, table: str, filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Busca dados do Supabase.
        
        Args:
            table: Nome da tabela
            filters: Filtros de busca
            
        Returns:
            Dados do Supabase
        """
        try:
            await self._create_session()
            
            supabase_config = self.api_config["supabase"]
            url = f"{supabase_config['url']}/rest/v1/{table}"
            
            headers = {
                "apikey": supabase_config["anon_key"],
                "Authorization": f"Bearer {supabase_config['anon_key']}",
                "Content-Type": "application/json"
            }
            
            params = {}
            if filters:
                for key, value in filters.items():
                    params[f"{key}"] = f"eq.{value}"
            
            self.logger.info(f"Buscando dados do Supabase: {table}")
            
            async with self.session.get(url, headers=headers, params=params) as response:
                if response.status == 200:
                    result = await response.json()
                    self.logger.info("Dados obtidos do Supabase com sucesso")
                    return {
                        "success": True,
                        "data": result
                    }
                else:
                    error_text = await response.text()
                    self.logger.error(f"Erro ao buscar do Supabase: {response.status} - {error_text}")
                    return {
                        "success": False,
                        "error": f"HTTP {response.status}: {error_text}"
                    }
                    
        except Exception as e:
            self.logger.error(f"Erro ao buscar do Supabase: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def call_openai_api(self, messages: list, model: Optional[str] = None) -> Dict[str, Any]:
        """
        Chama API do OpenAI.
        
        Args:
            messages: Lista de mensagens para o chat
            model: Modelo a ser usado (opcional)
            
        Returns:
            Resposta do OpenAI
        """
        try:
            await self._create_session()
            
            openai_config = self.api_config["openai"]
            url = "https://api.openai.com/v1/chat/completions"
            
            headers = {
                "Authorization": f"Bearer {openai_config['api_key']}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": model or openai_config["model"],
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 1000
            }
            
            self.logger.info("Chamando API do OpenAI")
            
            async with self.session.post(url, headers=headers, json=payload) as response:
                if response.status == 200:
                    result = await response.json()
                    self.logger.info("Resposta do OpenAI obtida com sucesso")
                    return {
                        "success": True,
                        "response": result["choices"][0]["message"]["content"],
                        "usage": result.get("usage", {})
                    }
                else:
                    error_text = await response.text()
                    self.logger.error(f"Erro na API do OpenAI: {response.status} - {error_text}")
                    return {
                        "success": False,
                        "error": f"HTTP {response.status}: {error_text}"
                    }
                    
        except Exception as e:
            self.logger.error(f"Erro ao chamar OpenAI: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Verifica a saúde das APIs.
        
        Returns:
            Status de saúde das APIs
        """
        try:
            health_status = {
                "component": "api_client",
                "status": "healthy",
                "apis": {},
                "timestamp": datetime.now().isoformat()
            }
            
            # Verifica WhatsApp API
            try:
                await self._create_session()
                whatsapp_config = self.api_config["whatsapp"]
                url = f"{whatsapp_config['url']}/health"
                
                async with self.session.get(url, timeout=aiohttp.ClientTimeout(total=5)) as response:
                    health_status["apis"]["whatsapp"] = "healthy" if response.status == 200 else "unhealthy"
            except:
                health_status["apis"]["whatsapp"] = "unhealthy"
            
            # Verifica Supabase
            try:
                supabase_config = self.api_config["supabase"]
                url = f"{supabase_config['url']}/rest/v1/"
                
                async with self.session.get(url, timeout=aiohttp.ClientTimeout(total=5)) as response:
                    health_status["apis"]["supabase"] = "healthy" if response.status == 200 else "unhealthy"
            except:
                health_status["apis"]["supabase"] = "unhealthy"
            
            # Verifica OpenAI
            try:
                openai_config = self.api_config["openai"]
                url = "https://api.openai.com/v1/models"
                
                headers = {"Authorization": f"Bearer {openai_config['api_key']}"}
                async with self.session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=5)) as response:
                    health_status["apis"]["openai"] = "healthy" if response.status == 200 else "unhealthy"
            except:
                health_status["apis"]["openai"] = "unhealthy"
            
            # Determina status geral
            all_healthy = all(
                status == "healthy" 
                for status in health_status["apis"].values()
            )
            
            if not all_healthy:
                health_status["status"] = "degraded"
            
            return health_status
            
        except Exception as e:
            return {
                "component": "api_client",
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
