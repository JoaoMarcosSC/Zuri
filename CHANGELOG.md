# Changelog

As mudanças do pacote [`@juau/zuri`](https://www.npmjs.com/package/@juau/zuri) ficam registradas aqui.
O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e as versões seguem o
[Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [0.3.0] - 2026-11-15

### Adicionado
- Dados: `zur-chart` (barras agrupadas ou empilhadas, linhas, áreas e rosca, em SVG e sem dependências;
  tooltip no hover e no foco, tabela alternativa para leitores de tela), `zur-stat` (KPI com variação) e
  `zur-sparkline`, `zur-timeline`, `zur-tree` (ARIA `tree`, teclado completo).
- Tabela avançada: seleção de linhas com "selecionar todas" (`zurSelectAll`, `zurSelect`, `zurRow`), linha
  expansível (`zurExpandToggle`), filtro por coluna (`zur-column-filter`) e menu de colunas (`zur-column-menu`).
- Interface: `zur-stepper`, `zur-number-input`, `zur-otp-input`, `zur-rating`, `zur-time-picker`,
  `zur-carousel` (autoplay desligado com "reduzir movimento"), `zur-avatar-group` e `zur-banner`.
- Sobreposição: `ZurDialog` (`confirm()` e `alert()` com `Promise`) e `zur-context-menu` (botão direito,
  Shift+F10 e toque longo). Variante `danger` no `zur-button`.
- Densidade compacta: `zurDensity`, `ZurDensityService` e `zur-density-toggle`. A tabela herda a densidade.
- Suporte a RTL em todos os componentes (propriedades lógicas, setas do teclado que seguem o sentido de
  leitura, ícones espelhados). `zur-drawer` aceita `side="start" | "end"`.
- Os controles funcionam com `[formField]` (Signal Forms), além de `ngModel` e formulários reativos.
- Exportação de tokens para outras ferramentas: `@juau/zuri/tokens.json` (W3C Design Tokens, claro e escuro),
  `@juau/zuri/tailwind.preset.cjs` (Tailwind v3) e `@juau/zuri/tailwind-theme.css` (Tailwind v4).
- Tokens `--zur-chart-1..6`, `--zur-chart-grid`, `--zur-chart-axis`, `--zur-on-error` e `--zur-dir`.
- Funções utilitárias exportadas: `zurNiceTicks`, `zurBarPath`, `zurParseNumber`, `zurTimeToMinutes`.
- Chaves novas no `ZurI18n`, em português e inglês.

### Alterado
- A interface `ZurI18n` ganhou chaves obrigatórias novas, entre elas `locale` (já na 0.2.0) e as dos componentes
  novos. Quem usa `provideZuriI18n('pt' | 'en' | parcial)` não precisa mudar nada; quem escreveu um objeto
  `ZurI18n` completo à mão precisa adicionar as chaves novas.
- `zur-drawer`: o lado padrão passou de `right` para `end` (igual em LTR; em RTL a gaveta vai para a esquerda).
  `left` e `right` continuam existindo e são físicos.
- `zur-table`: `density` agora é opcional e, sem valor, segue a área (`zurDensity`) ou a página.
- `min` e `max` do `zur-date-picker` e do `zur-time-picker` aceitam `undefined` (necessário para o
  `[formField]` ligar as regras do formulário).

- `zur-toast`: sucesso e erro passaram de verde/vermelho chapado com texto branco para o fundo suave com o
  texto semântico (como `zur-alert` e `zur-banner`), mais um ícone. O contraste foi de 3,4:1 e 2:1 (tema escuro)
  para pelo menos 4,6:1. O toast neutro não muda.

### Corrigido
- `zur-modal` agora prende o foco (o Tab circula dentro do diálogo), leva o foco para dentro ao abrir e o
  devolve ao fechar, como o `zur-drawer` já fazia.

## [0.2.0] - 2026-11-15

### Adicionado
- Formulários avançados: `zur-combobox` (select com busca, sem acento e por iniciais),
  `zur-date-picker` (data única ou faixa, teclado na grade, nomes no locale do i18n),
  `zur-file-upload` (arrastar e soltar, validação de tipo/tamanho, progresso controlado pela
  aplicação), `zur-chips`, `zur-slider` (valor único ou faixa) e `zur-segmented`.
- Padrões compostos: `zur-chat` (com `zur-chat-message`, `zur-chat-divider`, `zur-chat-typing` e
  `zur-chat-composer`; rola sozinho inclusive com texto em streaming), `zur-command-palette`
  (Ctrl/⌘+K), `zur-notification-center` e `zur-kanban` (drag and drop nativo e por teclado,
  com anúncios para leitores de tela).
- Funções utilitárias exportadas: `zurFormatBytes`, `zurAcceptsFile` e `zurKanbanMove`.
- Chaves novas no `ZurI18n` (inclusive `locale`), em português e inglês.

### Alterado
- A interface `ZurI18n` ganhou chaves obrigatórias novas, entre elas `locale`. Quem usa
  `provideZuriI18n('pt' | 'en' | parcial)` não precisa mudar nada; quem escreveu um objeto
  `ZurI18n` completo à mão precisa adicionar as chaves novas.

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

[0.3.0]: https://github.com/JoaoMarcosSC/Zuri/releases/tag/v0.3.0
[0.2.0]: https://github.com/JoaoMarcosSC/Zuri/releases/tag/v0.2.0
[0.1.0]: https://github.com/JoaoMarcosSC/Zuri/releases/tag/v0.1.0
[0.0.1]: https://www.npmjs.com/package/@juau/zuri/v/0.0.1
