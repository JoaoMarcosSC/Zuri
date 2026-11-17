# Changelog

As mudanças do pacote [`@juau/zuri`](https://www.npmjs.com/package/@juau/zuri) ficam registradas aqui.
O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e as versões seguem o
[Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não publicado]

### Corrigido
- `zur-sidebar` no celular: escolher um link na gaveta agora a fecha. Antes ela continuava aberta por cima do conteúdo.

## [0.5.0] - 2026-11-16

### Adicionado
- `ng add @juau/zuri` agora pergunta o **tema** (claro e escuro, só claro ou só escuro) e se você quer o
  **modo com IA**. As respostas também podem vir por opção: `--theme=both|light|dark` e `--ai`.
- `provideZuriTheme({ mode: 'system' | 'light' | 'dark' })`: liga o tema na partida da aplicação. Em `system`
  acompanha a troca de tema do sistema até a pessoa escolher no botão; em `light`/`dark` o tema é fixo e o
  `zur-theme-toggle` não aparece. No modo `system`, o `ng add` coloca um script mínimo no `index.html` que aplica o
  tema antes da primeira pintura (sem piscar, inclusive com SSR).
- **Modo com IA** (`ng add @juau/zuri --ai` ou `ng g @juau/zuri:ai`): instala skills para Claude Code
  (`.claude/skills`) e Codex (`.agents/skills`) — `zuri-iniciar`, `zuri-layout`, `zuri-tela`, `zuri-backend` e
  `zuri-migrar` —, os agents `zuri-inventario` e `zuri-revisor` (`.claude/agents` e `.codex/agents`), as regras do
  Zuri num bloco do `AGENTS.md` e o import `@AGENTS.md` no `CLAUDE.md`. Arquivos personalizados não são sobrescritos.
- Material de referência dentro do pacote, em `@juau/zuri/ai/`: catálogo da API gerado do código, regras, guia de
  layouts, receitas de telas (formulário, CRUD com tabela, dashboard, login, lista e detalhe) e guia de migração de
  HTML puro, Angular Material, Bootstrap e PrimeNG.

## [0.4.0] - 2026-11-15

### Adicionado
- Ícones: `zur-icon` e um conjunto próprio de 47 ícones (traço de 2 px, grade de 24 px), cada um exportado como
  constante (`zurIconSearch`, `zurIconTrash`…) para o bundler descartar os não usados. Os direcionais se espelham
  em RTL. `ZUR_ICON_CATALOG` lista todos.
- `button[zur-icon-button]` (o `label` é obrigatório e vira o `aria-label`) e `button[zur-fab]` (compacto ou
  `extended`).
- Formulários: `multiple` no `zur-combobox` (chips dentro do campo, valor `string[]`), `zur-chip` e
  `zur-chip-group` (filtro, escolha, ação e removível; `single` é `radiogroup`, `multiple` alterna), `zur-search`,
  `zur-inline-edit` e `a[zur-link]`. Todos funcionam com `ngModel`, formulários reativos e `[formField]`.
- `zur-divider` (horizontal, vertical e com rótulo).
- Listas: `zur-list` e `zur-list-item`, com ícone/avatar, texto secundário, ação e seleção única ou múltipla
  (`listbox` com roving tabindex).
- Tabela: `stickyHeader` e `stickyFirstColumn`, `th[zurResizable]` (arrastar ou ←/→, saída `columnResize`),
  `zur-table-toolbar` (vira barra de lote com a contagem anunciada) e `tbody[zurTableSkeleton]` (estado de
  carregamento com `aria-busy`).
- `zur-code-snippet`: bloco de código com botão de copiar.
- Mobile: `zur-bottom-nav` com `zur-bottom-nav-item` (rótulo, `badge` em número ou ponto, área segura do aparelho) e
  bottom sheet (`zur-drawer` com `side="bottom"`, alça e arrastar para baixo para fechar).
- Toast: botão de ação (`{ action: { label, handler } }`), modo `persistent`, `dismissAll()` e `pauseAll()`/`resumeAll()`.
- Chaves novas no `ZurI18n`, em português e inglês.

### Alterado
- A interface `ZurI18n` ganhou chaves obrigatórias novas. Quem usa `provideZuriI18n('pt' | 'en' | parcial)` não precisa
  mudar nada; quem escreveu um objeto `ZurI18n` completo à mão precisa adicionar as chaves novas.
- `ZurToastService.show()` devolve o `id` do toast (antes era `void`) e o terceiro parâmetro aceita um número (como
  antes) ou um objeto de opções. O tempo de cada toast **pausa com o ponteiro ou o foco sobre a pilha** e continua de
  onde parou (WCAG 2.2.1). Com ação, o padrão passa a 8 s.
- `zur-navbar` no celular: padding e espaços menores, a marca não quebra e os links rolam em vez de espremer.
- `zur-combobox`: o valor passa a ser `string | string[] | null` conforme `multiple` (sem mudança para quem não usa).

### Corrigido
- `zurThemeScope` agora segue o tema da página mesmo sem um `zur-theme-toggle` dentro. Antes, uma tela sem botão de
  tema (login, 404) ficava sempre no tema claro, porque o serviço de tema nunca era criado.
- `zur-stat`: o sinal da variação ("+12,4%") não vai mais para o fim do número em páginas da direita para a esquerda.

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

[0.5.0]: https://github.com/JoaoMarcosSC/Zuri/releases/tag/v0.5.0
[0.4.0]: https://github.com/JoaoMarcosSC/Zuri/releases/tag/v0.4.0
[0.3.0]: https://github.com/JoaoMarcosSC/Zuri/releases/tag/v0.3.0
[0.2.0]: https://github.com/JoaoMarcosSC/Zuri/releases/tag/v0.2.0
[0.1.0]: https://github.com/JoaoMarcosSC/Zuri/releases/tag/v0.1.0
[0.0.1]: https://www.npmjs.com/package/@juau/zuri/v/0.0.1
