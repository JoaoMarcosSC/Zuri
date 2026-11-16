# Material de IA do Zuri

Este diretório vai dentro do pacote `@juau/zuri` e é lido pelas skills e agents que o
`ng add @juau/zuri --ai` instala no projeto (Claude Code e Codex). Ele acompanha a versão
instalada: atualizar o pacote atualiza o material.

| Arquivo | Para quê |
|---|---|
| `catalogo.md` | Todos os componentes, diretivas, serviços e funções, com seletores, entradas, saídas e exemplos. **Gerado do código**: é a fonte da verdade da API. |
| `regras.md` | Regras de identidade visual e de código. Leia antes de escrever qualquer tela. |
| `layouts.md` | Guia de escolha do layout de página (`zur-*-layout`). |
| `receitas/` | Telas completas e prontas para adaptar: formulário, CRUD com tabela, dashboard, autenticação, lista e detalhe. |
| `migracao.md` | Equivalências para trocar HTML puro, Angular Material, Bootstrap e PrimeNG pelo Zuri. |
| `skills/`, `agents/` | Fontes das skills e agents instalados no projeto (não precisa ler daqui). |

Ordem de leitura sugerida para gerar interface: `regras.md` → `layouts.md` (se for página nova) →
a receita mais próxima → `catalogo.md` só nos componentes que for usar (procure pelo seletor).
