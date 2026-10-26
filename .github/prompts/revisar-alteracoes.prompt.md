---
description: Revisa alterações de código em busca de bugs, regressões e problemas de manutenção.
name: revisar-alteracoes
argument-hint: arquivo, recurso ou conjunto de alterações para revisar
agent: agent
---

# Revisar alterações

Revise as alterações relacionadas a `${input:escopo:arquivo ou recurso}`.

Antes de concluir:

- Consulte o diff e leia o contexto necessário nos arquivos afetados.
- Verifique as convenções e a arquitetura documentadas em `.github/copilot-instructions.md`.
- Procure bugs, regressões, tratamento incorreto de erros e testes ausentes relevantes à alteração.
- Não altere arquivos nem proponha mudanças fora do escopo revisado.

Apresente somente problemas acionáveis que puder confirmar. Para cada problema, informe a localização (arquivo e linha), o impacto e uma sugestão objetiva de correção. Ordene os achados do mais grave ao menos grave. Se não encontrar problemas, declare isso claramente e mencione eventuais limitações da revisão.
