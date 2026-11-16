---
name: zuri-layout
description: Escolhe o layout de página do Zuri (landing, dashboard, lista e detalhe, formulário, documentação, autenticação ou erro) e gera o esqueleto da página Angular. Use quando a pessoa for criar uma página nova ou não souber qual estrutura de página usar.
---

# Escolher o layout e gerar o esqueleto

Leia `node_modules/@juau/zuri/ai/layouts.md` (guia de decisão) e, no `catalogo.md`, a seção
"Layouts de página" (entradas e slots reais). Não invente entradas nem slots.

Se a pessoa já descreveu o tipo de aplicação e de conteúdo, use isso e pule as perguntas respondidas.

## Entrevista (uma pergunta por vez, 3 a 4 opções e a sua recomendação)
1. **Tipo de tela:** site público/marketing, área logada (painel), documentação, cadastro ou checkout,
   login, página de erro.
2. **Conteúdo:** seções narrativas, dados e cartões, coleção de itens com detalhe, campos de formulário,
   texto corrido com navegação.
3. **Público e frequência:** visitante ocasional ou uso diário.

## Recomendação
Cruze as respostas com a tabela do `layouts.md` e apresente:
- o layout recomendado e a justificativa em 2 ou 3 linhas (por que este e não os vizinhos);
- o componente (`zur-…-layout`) e as peças (`zur-sidebar`, `zur-topbar`, `zur-page-header`,
  `zur-breadcrumb`, `zur-footer`, `zur-bottom-nav`);
- o comportamento padrão (sidebar, topbar, largura) e o que dá para trocar (`width`, `hideOnScroll`).

Peça confirmação. Se a pessoa escolher outro layout, siga a escolha dela.

## Esqueleto
Gere o componente standalone da página:
- `ChangeDetectionStrategy.OnPush`, importando de `'@juau/zuri'` só o que o template usa;
- o layout com os slots corretos e comentários `<!-- … -->` onde entra o conteúdo real;
- CSS só com tokens `--zur-*` (funciona nos dois temas);
- logo com `<zur-logo />` (`variant="auto"` na sidebar); ícones com `zur-icon`;
- navegação com `routerLink` e `routerLinkActive`;
- `zur-theme-toggle` só se o modo de tema do `AGENTS.md` for "ambos".

Use a receita mais próxima em `receitas/` como ponto de partida. Pergunte o caminho do arquivo se não
estiver claro. No fim, diga quais arquivos criou e como registrar a rota.
