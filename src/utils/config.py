"""
Configuração do FalaChefe Python.
Gerencia variáveis de ambiente e configurações do sistema.
"""

import os
from pathlib import Path
from typing import Optional, Dict, Any
from pydantic import Field
from pydantic_settings import BaseSettings


class Config(BaseSettings):
    """Configuração principal do FalaChefe Python."""
    
    # OpenAI Configuration
    openai_api_key: str = Field(..., env="OPENAI_API_KEY")
    openai_model: str = Field("gpt-4-turbo-preview", env="OPENAI_MODEL")
    
    # Supabase Configuration
    supabase_url: str = Field(..., env="SUPABASE_URL")
    supabase_anon_key: str = Field(..., env="SUPABASE_ANON_KEY")
    supabase_service_role_key: Optional[str] = Field(None, env="SUPABASE_SERVICE_ROLE_KEY")
    
    # WhatsApp API Configuration
    whatsapp_api_url: str = Field(..., env="WHATSAPP_API_URL")
    whatsapp_api_token: str = Field(..., env="WHATSAPP_API_TOKEN")
    whatsapp_webhook_secret: Optional[str] = Field(None, env="WHATSAPP_WEBHOOK_SECRET")
    
    # Database Configuration
    database_url: str = Field(..., env="DATABASE_URL")
    database_pool_size: int = Field(10, env="DATABASE_POOL_SIZE")
    database_max_overflow: int = Field(20, env="DATABASE_MAX_OVERFLOW")
    
    # Agent Configuration
    agent_leo_financial_enabled: bool = Field(True, env="AGENT_LEO_FINANCIAL_ENABLED")
    agent_max_marketing_enabled: bool = Field(True, env="AGENT_MAX_MARKETING_ENABLED")
    agent_lia_hr_enabled: bool = Field(True, env="AGENT_LIA_HR_ENABLED")
    
    # Financial APIs
    alpha_vantage_api_key: Optional[str] = Field(None, env="ALPHA_VANTAGE_API_KEY")
    yahoo_finance_enabled: bool = Field(True, env="YAHOO_FINANCE_ENABLED")
    
    # Logging Configuration
    log_level: str = Field("INFO", env="LOG_LEVEL")
    log_file: str = Field("logs/falachefe_python.log", env="LOG_FILE")
    log_max_size: int = Field(10485760, env="LOG_MAX_SIZE")  # 10MB
    log_backup_count: int = Field(5, env="LOG_BACKUP_COUNT")
    
    # Processing Configuration
    max_concurrent_jobs: int = Field(5, env="MAX_CONCURRENT_JOBS")
    batch_size: int = Field(100, env="BATCH_SIZE")
    processing_timeout: int = Field(300, env="PROCESSING_TIMEOUT")  # 5 minutes
    
    # Security
    jwt_secret: Optional[str] = Field(None, env="JWT_SECRET")
    encryption_key: Optional[str] = Field(None, env="ENCRYPTION_KEY")
    
    # Development
    debug: bool = Field(False, env="DEBUG")
    testing: bool = Field(False, env="TESTING")
    mock_external_apis: bool = Field(False, env="MOCK_EXTERNAL_APIS")
    
    class Config:
        env_file = ".env.python"
        env_file_encoding = "utf-8"
        case_sensitive = False
    
    def __init__(self, config_path: Optional[str] = None, **kwargs):
        """Inicializa a configuração."""
        if config_path:
            # Carrega arquivo de configuração personalizado
            env_file = Path(config_path)
            if env_file.exists():
                super().__init__(_env_file=env_file, **kwargs)
            else:
                raise FileNotFoundError(f"Arquivo de configuração não encontrado: {config_path}")
        else:
            super().__init__(**kwargs)
        
        # Cria diretório de logs se não existir
        log_dir = Path(self.log_file).parent
        log_dir.mkdir(parents=True, exist_ok=True)
    
    def get_agent_config(self, agent_name: str) -> Dict[str, Any]:
        """Retorna configuração específica de um agente."""
        agent_configs = {
            "leo": {
                "enabled": self.agent_leo_financial_enabled,
                "specialization": "financial",
                "max_processing_time": 300,
                "memory_retention_days": 30
            },
            "max": {
                "enabled": self.agent_max_marketing_enabled,
                "specialization": "marketing",
                "max_processing_time": 180,
                "memory_retention_days": 14
            },
            "lia": {
                "enabled": self.agent_lia_hr_enabled,
                "specialization": "hr",
                "max_processing_time": 240,
                "memory_retention_days": 90
            }
        }
        
        return agent_configs.get(agent_name, {})
    
    def get_database_config(self) -> Dict[str, Any]:
        """Retorna configuração do banco de dados."""
        return {
            "url": self.database_url,
            "pool_size": self.database_pool_size,
            "max_overflow": self.database_max_overflow,
            "echo": self.debug
        }
    
    def get_api_config(self) -> Dict[str, Any]:
        """Retorna configuração das APIs."""
        return {
            "whatsapp": {
                "url": self.whatsapp_api_url,
                "token": self.whatsapp_api_token,
                "webhook_secret": self.whatsapp_webhook_secret
            },
            "supabase": {
                "url": self.supabase_url,
                "anon_key": self.supabase_anon_key,
                "service_role_key": self.supabase_service_role_key
            },
            "openai": {
                "api_key": self.openai_api_key,
                "model": self.openai_model
            }
        }
    
    def is_development(self) -> bool:
        """Verifica se está em modo de desenvolvimento."""
        return self.debug or self.testing
    
    def is_production(self) -> bool:
        """Verifica se está em modo de produção."""
        return not self.is_development()
