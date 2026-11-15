# Changelog

As mudanças do pacote [`@juau/zuri`](https://www.npmjs.com/package/@juau/zuri) ficam registradas aqui.
O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e as versões seguem o
[Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [0.1.0] - 2026-11-15

### Adicionado
- Componentes novos: `zur-textarea`, `zur-progress`, `table[zur-table]` com `th[zurSortable]`,
  `zur-pagination`, `zur-accordion`, `zur-empty-state`, `zur-drawer` e `zur-popover`
  (com `[zurPopoverTrigger]`).
- Textos internos configuráveis: `ZUR_I18N`, `provideZuriI18n('pt' | 'en' | parcial)`. Português
  continua sendo o padrão.
- `ng add @juau/zuri`: importa os tokens no styles global, aplica o estilo base do body e
  adiciona a fonte Nunito Sans no `index.html`.
- Tokens `--zur-success-text`, `--zur-warning-text`, `--zur-error-text` e `--zur-info-text`, para
  texto sobre as cores semânticas.
- Testes unitários de todos os componentes, teste de acessibilidade (axe) em todas as stories e
  CI no GitHub Actions.

### Alterado
- `--zur-muted` do tema claro passou de `#6b7d74` para `#5f6f67`, para passar de 4,5:1 de contraste.
- Badge, alert e a mensagem de erro do input usam os tokens `-text`: contraste AA no tema claro.
- O número do `zur-error-layout` usa `--zur-on-primary-soft` (antes o verde-menta tinha contraste 1,8:1).

### Corrigido
- `zur-switch` agora tem nome acessível (o texto ao lado vira o rótulo do botão).
- Os `<nav>` do topbar e do rodapé ganharam rótulos próprios.
- Badge e avatar não forçam mais o verde claro quando estão dentro de um `zurThemeScope` claro
  numa página escura.

## [0.0.1] - 2026-11-15

### Adicionado
- Primeira versão publicada: componentes de fundamentos, formulários, navegação, conteúdo e
  feedback, 7 layouts de página, tema claro/escuro com `zurThemeScope` e o logo `zur-logo`.

[0.1.0]: https://github.com/JoaoMarcosSC/Zuri/releases/tag/v0.1.0
[0.0.1]: https://www.npmjs.com/package/@juau/zuri/v/0.0.1
