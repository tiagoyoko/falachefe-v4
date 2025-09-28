# Guia Prático - Como Usar os Agentes

## 🤔 **Você tem dois agentes? NÃO!**

### **Situação Real:**
- ✅ **TypeScript (Existente)**: Leo, Max, Lia funcionando
- ✅ **Python (Novo)**: Leo, Max, Lia implementados
- ✅ **Orquestrador Híbrido**: Escolhe **UM** sistema por vez

## 🎯 **Como Funciona na Prática**

### **1. Sistema Atual (Padrão)**
```bash
# Por padrão, usa TypeScript (sistema existente)
python main.py --mode health
# Output: "Sistema TypeScript ativado"
```

### **2. Verificar Qual Sistema Está Ativo**
```bash
# Ver status dos sistemas
python main.py --mode system-status
```

**Output:**
```json
{
  "active_system": "typescript",
  "preferred_system": "auto",
  "typescript_available": true,
  "python_available": true,
  "typescript_health": "healthy"
}
```

### **3. Trocar para Python (Se Quiser)**
```bash
# Trocar para sistema Python
python main.py --mode switch-system --system python
```

**Output:**
```json
{
  "success": true,
  "active_system": "python",
  "message": "Sistema alterado para: python"
}
```

### **4. Voltar para TypeScript**
```bash
# Voltar para TypeScript
python main.py --mode switch-system --system typescript
```

### **5. Modo Automático (Recomendado)**
```bash
# Deixar o sistema escolher automaticamente
python main.py --mode switch-system --system auto
```

## 🔄 **Fluxo de Decisão Automática**

### **Modo AUTO (Padrão):**
1. **Tenta TypeScript primeiro** (sistema existente)
2. **Se TypeScript falhar** → Usa Python como fallback
3. **Se ambos falharem** → Erro

### **Exemplo Prático:**
```python
# Código Python
from main import FalaChefePython

falachefe = FalaChefePython()  # Usa modo AUTO

# Processa conversa - usa TypeScript por padrão
result = await falachefe.process_conversation({
    "message": "Preciso de ajuda financeira",
    "user_id": "user_123",
    "session_id": "session_456"
})

print(f"Sistema usado: {result['processed_by']}")
# Output: "Sistema usado: typescript"
```

## 📊 **Comparação dos Sistemas**

| Aspecto | TypeScript | Python |
|---------|------------|--------|
| **Status** | ✅ Funcionando | ✅ Implementado |
| **Performance** | Rápido | Rápido + Análise |
| **Funcionalidades** | Básicas | Avançadas |
| **Análise de Dados** | Limitada | Completa |
| **Automação** | Não | Sim |
| **Recomendação** | **Usar agora** | **Usar depois** |

## 🚀 **Estratégias de Uso**

### **Estratégia 1: Manter TypeScript (Recomendado)**
```bash
# Usar apenas TypeScript por enquanto
python main.py --mode switch-system --system typescript

# Python fica como complemento para análise
python main.py --mode financial --data "monthly_data"
```

**Vantagens:**
- ✅ Sistema estável e testado
- ✅ Não quebra nada existente
- ✅ Python complementa com análise

### **Estratégia 2: Migrar Gradualmente**
```bash
# Semana 1: Testar Python em paralelo
python main.py --mode switch-system --system python
python main.py --mode conversation --data '{"message": "teste"}'

# Semana 2: Comparar resultados
# Semana 3: Migrar completamente
```

### **Estratégia 3: Híbrido Inteligente**
```bash
# Deixar sistema escolher automaticamente
python main.py --mode switch-system --system auto

# TypeScript para conversas normais
# Python para análise de dados
```

## 🛠️ **Comandos Práticos**

### **Verificar Status**
```bash
# Health check geral
python main.py --mode health

# Status dos sistemas
python main.py --mode system-status
```

### **Processar Conversas**
```bash
# Conversa normal (usa sistema ativo)
python main.py --mode conversation --data '{"message": "Preciso de ajuda", "user_id": "user123"}'

# Com agente específico
python main.py --mode conversation --data '{"message": "Ajuda financeira", "user_id": "user123", "agent_name": "leo"}'
```

### **Análise de Dados (Sempre Python)**
```bash
# Análise financeira
python main.py --mode financial --data "monthly_data"

# Análise de marketing
python main.py --mode marketing --data '{"name": "Campanha Q1"}'

# Processamento de RH
python main.py --mode hr --data '{"type": "payroll"}'
```

## 🔧 **Configuração Recomendada**

### **Para Produção (Agora):**
```bash
# Usar TypeScript para conversas
python main.py --mode switch-system --system typescript

# Python para análise e automação
# (Não precisa trocar, funciona automaticamente)
```

### **Para Desenvolvimento:**
```bash
# Testar Python
python main.py --mode switch-system --system python

# Testar conversas
python main.py --mode conversation --data '{"message": "teste"}'
```

## 📈 **Monitoramento**

### **Verificar Qual Sistema Está Sendo Usado:**
```python
# No código Python
result = await falachefe.process_conversation(conversation_data)
print(f"Sistema usado: {result['processed_by']}")
# Output: "typescript" ou "python"
```

### **Logs:**
```bash
# Ver logs do sistema
tail -f logs/falachefe_python.log

# Procurar por "Sistema alterado para:"
grep "Sistema alterado" logs/falachefe_python.log
```

## ⚠️ **Importante**

### **Você NÃO tem agentes duplicados!**
- ✅ **Apenas UM sistema ativo por vez**
- ✅ **TypeScript é o padrão** (sistema existente)
- ✅ **Python é complementar** (análise e automação)
- ✅ **Troca automática** se necessário

### **Recomendação:**
1. **Mantenha TypeScript** para conversas (estável)
2. **Use Python** para análise de dados (novo)
3. **Monitore** qual sistema está sendo usado
4. **Migre gradualmente** se quiser

## 🎯 **Resumo Prático**

```bash
# 1. Verificar status atual
python main.py --mode system-status

# 2. Se quiser usar TypeScript (padrão)
python main.py --mode switch-system --system typescript

# 3. Se quiser usar Python
python main.py --mode switch-system --system python

# 4. Se quiser automático (recomendado)
python main.py --mode switch-system --system auto

# 5. Processar conversa (usa sistema ativo)
python main.py --mode conversation --data '{"message": "ajuda"}'
```

**Resultado:** Você tem **UM sistema de agentes** que escolhe automaticamente entre TypeScript e Python, sem duplicação!
