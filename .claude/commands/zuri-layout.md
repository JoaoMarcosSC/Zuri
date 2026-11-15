Escolha o layout de página do Zuri e gere o esqueleto da página.

Antes de começar, leia `LAYOUTS.md` (guia de decisão) e `projects/zuri/src/lib/layout`
(API dos componentes: inputs e slots reais). Não invente inputs nem slots.

Se `$ARGUMENTS` já descrever o tipo de aplicação e de conteúdo, use como respostas e pule
as perguntas que ficarem claras.

## Entrevista

Faça uma pergunta por vez, com 3 a 4 opções e sua recomendação:

1. **Tipo de aplicação**: site público/marketing, área logada (painel), documentação, fluxo
   de cadastro/checkout, tela de login ou página de erro.
2. **Tipo de conteúdo**: seções narrativas, dados e cartões, coleção de itens com detalhe,
   campos de formulário, texto corrido com navegação.
3. **Público e frequência**: visitante ocasional ou usuário diário.

## Recomendação

Cruze as respostas com a tabela de `LAYOUTS.md` e apresente:

- o **layout recomendado** e a **justificativa** em 2 ou 3 linhas (por que este e não os vizinhos);
- o **componente Zuri** a usar (`zur-…-layout`) e os subcomponentes necessários
  (`zur-sidebar`, `zur-topbar`, `zur-page-header`, `zur-breadcrumb`, `zur-footer`);
- o comportamento padrão de sidebar, topbar e largura, e o que dá para trocar (`width`,
  `hideOnScroll`).

Peça confirmação antes de gerar. Se o usuário escolher outro layout, siga a escolha dele.

## Esqueleto

Gere o componente Angular standalone da página (`.ts` + `.html` + `.css` vazio ou mínimo):

- `ChangeDetectionStrategy.OnPush`, importando só o que o template usa, de `'@juau/zuri'`;
- o template com o layout escolhido, os slots corretos e comentários `<!-- … -->` onde entra
  o conteúdo real;
- só tokens `--zur-*` no CSS (nada de cores fixas), para funcionar em tema claro e escuro;
- logo com `<zur-logo />` (use `variant="auto"` na sidebar);
- itens de navegação com `routerLink` + `routerLinkActive="active"`.

Pergunte o caminho/nome do arquivo se não estiver claro pelo projeto. Ao final, diga quais
arquivos criou e como registrar a rota. Se a página nova ficar na docs do Zuri, lembre de
adicioná-la à página Layouts quando for um padrão novo.
