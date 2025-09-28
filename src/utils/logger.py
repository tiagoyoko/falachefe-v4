"""
Sistema de logging do FalaChefe Python.
Configura logging estruturado para todos os componentes.
"""

import logging
import logging.handlers
from pathlib import Path
from typing import Optional
from datetime import datetime


class FalaChefeFormatter(logging.Formatter):
    """Formatter customizado para logs do FalaChefe."""
    
    def __init__(self):
        super().__init__()
        self.format_string = (
            "%(asctime)s | %(levelname)-8s | %(name)-20s | "
            "%(funcName)-15s:%(lineno)-4d | %(message)s"
        )
        self.date_format = "%Y-%m-%d %H:%M:%S"
    
    def format(self, record):
        """Formata o log record."""
        # Adiciona timestamp em UTC
        record.asctime = datetime.utcnow().strftime(self.date_format)
        
        # Adiciona contexto do agente se disponível
        if hasattr(record, 'agent'):
            record.name = f"{record.name}[{record.agent}]"
        
        return super().format(record)


def setup_logger(
    log_level: str = "INFO",
    log_file: Optional[str] = None,
    max_size: int = 10485760,  # 10MB
    backup_count: int = 5
) -> logging.Logger:
    """
    Configura o logger principal do FalaChefe.
    
    Args:
        log_level: Nível de log (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Caminho para arquivo de log
        max_size: Tamanho máximo do arquivo de log em bytes
        backup_count: Número de arquivos de backup
        
    Returns:
        Logger configurado
    """
    # Cria logger principal
    logger = logging.getLogger("falachefe")
    logger.setLevel(getattr(logging, log_level.upper()))
    
    # Remove handlers existentes para evitar duplicação
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)
    
    # Configura formatter
    formatter = FalaChefeFormatter()
    
    # Handler para console
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # Handler para arquivo se especificado
    if log_file:
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        
        file_handler = logging.handlers.RotatingFileHandler(
            log_file,
            maxBytes=max_size,
            backupCount=backup_count,
            encoding='utf-8'
        )
        file_handler.setLevel(getattr(logging, log_level.upper()))
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    
    # Configura loggers específicos
    _setup_agent_loggers(logger)
    _setup_component_loggers(logger)
    
    return logger


def _setup_agent_loggers(parent_logger: logging.Logger):
    """Configura loggers específicos para agentes."""
    agents = ["leo", "max", "lia"]
    
    for agent in agents:
        agent_logger = logging.getLogger(f"falachefe.agent.{agent}")
        agent_logger.setLevel(parent_logger.level)
        
        # Herda handlers do logger pai
        for handler in parent_logger.handlers:
            agent_logger.addHandler(handler)
        
        # Evita propagação para evitar logs duplicados
        agent_logger.propagate = False


def _setup_component_loggers(parent_logger: logging.Logger):
    """Configura loggers específicos para componentes."""
    components = ["orchestrator", "data_processor", "api_client", "classifier"]
    
    for component in components:
        component_logger = logging.getLogger(f"falachefe.{component}")
        component_logger.setLevel(parent_logger.level)
        
        # Herda handlers do logger pai
        for handler in parent_logger.handlers:
            component_logger.addHandler(handler)
        
        # Evita propagação para evitar logs duplicados
        component_logger.propagate = False


def get_agent_logger(agent_name: str) -> logging.Logger:
    """
    Retorna logger específico para um agente.
    
    Args:
        agent_name: Nome do agente (leo, max, lia)
        
    Returns:
        Logger do agente
    """
    return logging.getLogger(f"falachefe.agent.{agent_name}")


def get_component_logger(component_name: str) -> logging.Logger:
    """
    Retorna logger específico para um componente.
    
    Args:
        component_name: Nome do componente
        
    Returns:
        Logger do componente
    """
    return logging.getLogger(f"falachefe.{component_name}")


class AgentLoggerAdapter(logging.LoggerAdapter):
    """Adapter para adicionar contexto do agente aos logs."""
    
    def __init__(self, logger: logging.Logger, agent_name: str):
        super().__init__(logger, {"agent": agent_name})
    
    def process(self, msg, kwargs):
        """Processa a mensagem de log adicionando contexto do agente."""
        return msg, kwargs


def create_agent_logger(agent_name: str) -> AgentLoggerAdapter:
    """
    Cria logger adaptado para um agente específico.
    
    Args:
        agent_name: Nome do agente
        
    Returns:
        Logger adaptado com contexto do agente
    """
    base_logger = get_agent_logger(agent_name)
    return AgentLoggerAdapter(base_logger, agent_name)
