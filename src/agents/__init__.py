"""
Agentes especializados do FalaChefe v4.
Cada agente é responsável por uma área específica de negócio.
"""

from .base_agent import BaseAgent
from .leo_financial import LeoFinancialAgent
from .max_marketing import MaxMarketingAgent
from .lia_hr import LiaHRAgent

__all__ = [
    "BaseAgent",
    "LeoFinancialAgent", 
    "MaxMarketingAgent",
    "LiaHRAgent"
]
