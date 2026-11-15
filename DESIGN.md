---
version: alpha
name: Zuri-design-system
description: "Zuri é um design system Angular de atmosfera amigável-consumer (inspirada em Airbnb, Notion e Miro) construído sobre uma paleta verde-menta fresca (Jobright spring-mint + Wise lime/sage). O canvas claro é um off-white esverdeado (branco puro só em superfícies elevadas) com neutros de tintura sage. O tema escuro foi redesenhado com a filosofia de imersão quase-preta do Spotify (conteúdo em primeiro plano, UI quase invisível) — fundo grafite com leve tintura verde, escada de elevação em degraus sutis, texto quase neutro e sombra única mais pesada — sem copiar nenhum valor do Spotify, só a filosofia. O verde-menta permanece vibrante e multiuso nos dois temas, alternados por um botão sol/lua. A tipografia roda Nunito Sans — sans arredondada e calorosa, substituta open-source do espírito Airbnb Cereal / Euclid Circular — em pesos moderados. O formato segue a escola Airbnb: botões 8px, cards 14px, busca e pills em raio total, e um ÚNICO tier de sombra usado apenas em superfícies flutuantes. A densidade é generosa-editorial (Apple, ElevenLabs): seções a 96–128px, muito espaço em branco, poucos elementos por tela."

colors:
  # ── Marca (iguais nos dois temas; brilho ajustado no escuro) ──
  primary: "#35d49b"
  primary-hover: "#2bc38c"
  primary-active: "#23ad7b"
  primary-soft: "#d7f7ea"
  on-primary: "#0c2b1e"
  # ── Tema claro ──
  canvas: "#f6faf8"
  on-primary-soft: "#0c4a33"
  surface-soft: "#f3faf7"
  surface-strong: "#e7f4ee"
  ink: "#15271f"
  body: "#3d4f47"
  muted: "#5f6f67"
  hairline: "#dde8e2"
  hairline-soft: "#ebf2ee"
  # ── Tema escuro (quase-preto, filosofia Spotify, identidade Zuri) ──
  dark-canvas: "#151a17"
  dark-surface-1: "#1b211d"
  dark-surface-2: "#232a25"
  dark-on-primary-soft: "#3ee6a8"
  dark-ink: "#f3f5f4"
  dark-body: "#c3cac7"
  dark-muted: "#8c968f"
  dark-hairline: "#23382f"
  dark-primary: "#3ee6a8"
  # ── Semânticas ──
  success: "#1a9e63"
  warning: "#d97706"
  error: "#e5484d"
  info: "#3b82f6"
  # texto sobre as semânticas (4,5:1 sobre soft e canvas no claro)
  success-text: "#14794c"
  warning-text: "#a25904"
  error-text: "#c91d22"
  info-text: "#0b5ee7"
  scrim: "#000000"

typography:
  display-xl:
    fontFamily: "'Nunito Sans', -apple-system, system-ui, sans-serif"
    fontSize: 64px
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: -1.6px
  display-lg:
    fontFamily: "'Nunito Sans', sans-serif"
    fontSize: 48px
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: -1px
  display-md:
    fontFamily: "'Nunito Sans', sans-serif"
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.18
    letterSpacing: -0.5px
  headline:
    fontFamily: "'Nunito Sans', sans-serif"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: -0.3px
  title:
    fontFamily: "'Nunito Sans', sans-serif"
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: 0
  body-lg:
    fontFamily: "'Nunito Sans', sans-serif"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0
  body:
    fontFamily: "'Nunito Sans', sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0
  body-sm:
    fontFamily: "'Nunito Sans', sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: 0
  caption:
    fontFamily: "'Nunito Sans', sans-serif"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: 0
  badge:
    fontFamily: "'Nunito Sans', sans-serif"
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0.2px
  button:
    fontFamily: "'Nunito Sans', sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: 0

rounded:
  xs: 4px
  sm: 8px
  md: 14px
  lg: 20px
  xl: 32px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  3xl: 64px
  section: 96px
  section-lg: 128px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: 14px 24px
    height: 48px
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    height: 48px
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
  button-pill:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
    padding: 10px 20px
  card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.md}"
    padding: 24px
  badge-soft:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.on-primary}"
    typography: "{typography.badge}"
    rounded: "{rounded.full}"
    padding: 4px 10px
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.hairline}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    height: 56px
    padding: 14px 16px
  navbar:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    borderBottom: "1px solid {colors.hairline-soft}"
    height: 80px
  modal:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.lg}"
    padding: 32px
    scrim: "{colors.scrim} @ 50%"
  toast:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.canvas}"
    rounded: "{rounded.md}"
    padding: 14px 20px
---

## Visão geral

**Zuri** é um design system para produtos consumer construído em Angular. A personalidade
é **amigável e acolhedora** (escola Airbnb/Notion/Miro), a cor é **verde-menta fresca**
(escola Jobright/Wise) e o ritmo é **generoso-editorial** (escola Apple/ElevenLabs):
seções respiram a 96–128px, heroes abertos, poucos elementos por tela.

O sistema é **dual-theme por contrato**: todo token é uma CSS variable que muda sob
`[data-theme="dark"]`. A troca é feita pelo componente `zur-theme-toggle` — o botão
**sol/lua** — que persiste a escolha em `localStorage` e respeita `prefers-color-scheme`
como padrão inicial.

**Características-chave:**
- **Uma única voltagem de marca** — o verde-menta `{colors.primary}` carrega CTAs,
  estados ativos, foco e o orbe de destaque. Páginas são ~90% neutras (Airbnb).
- **Texto escuro sobre menta** — como Wise faz com lime: a menta é clara, então
  `{colors.on-primary}` é um verde-tinta profundo, nunca branco.
- **Neutros com tintura sage** — nenhum cinza é puro; todos puxam levemente para verde
  (`#f3faf7`, `#dde8e2`), criando coesão com a marca (Wise).
- **Tema escuro quase-preto, inspirado na imersão do Spotify** — canvas `{colors.dark-canvas}`
  fica próximo do preto com uma tintura verde discreta (não é cinza genérico, mas também não
  é mais o verde-negro saturado de antes). A escada de elevação (`{colors.dark-surface-1}` →
  `{colors.dark-surface-2}`) sobe em degraus próximos e sutis — como no Spotify — e o texto
  (`{colors.dark-ink}` / `{colors.dark-body}`) fica quase neutro, deixando a menta brilhar
  só nos acentos.
- **Um único tier de sombra** (Airbnb) — `0 0 0 1px rgba(0,0,0,.02), 0 2px 6px
  rgba(0,0,0,.04), 0 4px 8px rgba(0,0,0,.10)` aplicado apenas em superfícies flutuantes
  (dropdown, modal, toast, hover de card). Todo o resto é flat + hairline.
- **Formas suaves em três degraus** — botões/inputs a 8px, cards a 14px, pills/avatars
  em raio total. Não existe canto reto em elemento interativo.
- **Tipografia arredondada** — Nunito Sans em toda a hierarquia; display 700–800,
  corpo 400. Caloroso sem perder a legibilidade de UI.

## Cores

### Marca
- **Menta** (`{colors.primary}` — #35d49b): a única cor de ação. CTAs primários, switch
  ativo, tab ativa, anel de foco, links de destaque.
- **Menta Hover** (`{colors.primary-hover}`) e **Menta Active** (`{colors.primary-active}`):
  degraus mais profundos para interação.
- **Menta Soft** (`{colors.primary-soft}` — #d7f7ea): bandas de seção, badges suaves,
  fundo de alerta de sucesso — o "pale-mint band" do Jobright.
- **On Primary** (`{colors.on-primary}` — #0c2b1e): texto sobre menta. Verde-tinta
  profundo, garante contraste AAA sobre a menta clara.

### Superfícies — tema claro
- **Canvas** (#f6faf8): piso padrão de página (off-white esverdeado; cards e superfícies elevadas ficam em branco).
- **Surface Soft** (#f3faf7): bandas alternadas, hover de linhas, fundos de input disabled.
- **Surface Strong** (#e7f4ee): chips neutros, fundos de ícone circular.
- **Hairline** (#dde8e2) / **Hairline Soft** (#ebf2ee): bordas 1px e divisores.

### Superfícies — tema escuro (quase-preto, degraus sutis)
- **Dark Canvas** (#151a17): piso quase-preto com uma tintura verde discreta — a imersão
  "conteúdo em primeiro plano" do Spotify, sem copiar seus valores.
- **Dark Surface 1** (#1b211d) e **Dark Surface 2** (#232a25): escada de elevação em
  degraus próximos (~7 pontos por canal) — quase imperceptíveis isoladamente, só visíveis
  lado a lado, como no Spotify. No escuro, profundidade vem primeiro da superfície mais
  clara; a sombra única entra só em flutuantes.
- **Dark Hairline** (#23382f): bordas 1px no escuro — mantida sem alteração nesta revisão.
- **Dark Primary** (#3ee6a8): a menta ganha ~8% de brilho no escuro para vibrar; continua
  vibrante e multiuso (CTAs e fundos suaves), diferente do uso estritamente funcional do
  verde no Spotify.

### Texto
- **Ink** (#15271f) / **Dark Ink** (#f3f5f4): títulos e texto principal. No escuro, o ink
  é quase neutro (muito pouca tintura verde) — o texto "desaparece" para a menta brilhar
  só nos acentos, inspirado na abordagem acromática do Spotify.
- **Body** (#3d4f47) / **Dark Body** (#c3cac7): texto corrido secundário, também neutralizado
  no escuro.
- **Muted** (#5f6f67) / **Dark Muted** (#8c968f): legendas, placeholders, disabled. Escurecido de #6b7d74 para passar de 4,5:1 sobre canvas e superfícies.

### Semânticas
- **Success** (#1a9e63) · **Warning** (#d97706) · **Error** (#e5484d) · **Info** (#3b82f6).
  Cada uma tem variante `-soft` gerada por mistura com o canvas para fundos de alerta.
- **Texto semântico** (`--zur-*-text`): para texto em cima das cores semânticas (badge, alert,
  mensagem de erro do input). No claro são versões mais escuras (Success #14794c · Warning
  #a25904 · Error #c91d22 · Info #0b5ee7), que passam de 4,5:1 sobre o fundo `-soft` e sobre o
  canvas; no escuro valem o mesmo que a cor-base. As cores-base ficam para ícones e bordas.

## Tipografia

**Nunito Sans** (Google Fonts) em toda a hierarquia — display, corpo, botões, legendas.
É a substituta open-source do espírito Airbnb Cereal / Euclid Circular: terminais
arredondados, largura generosa, calor humano. Fallback: `-apple-system, system-ui, sans-serif`.

| Token | Tamanho | Peso | Uso |
|---|---|---|---|
| `display-xl` | 64px / 800 | tracking -1.6px | Hero de página |
| `display-lg` | 48px / 800 | tracking -1px | Abertura de seção |
| `display-md` | 36px / 700 | | Sub-seção |
| `headline` | 28px / 700 | | Título de card grande, modal |
| `title` | 20px / 600 | | Título de card, item de lista |
| `body-lg` | 18px / 400 | lh 1.6 | Lead editorial |
| `body` | 16px / 400 | lh 1.55 | Corpo padrão |
| `body-sm` | 14px / 400 | | Meta, células de tabela |
| `caption` | 13px / 500 | | Labels de campo, breadcrumb |
| `badge` | 12px / 700 | | Badges e tags |
| `button` | 16px / 600 | | Todos os rótulos de botão |

**Princípios:** display nunca passa de 800; corpo nunca abaixo de 400; tracking negativo
só em display ≥36px; line-height generoso (1.55–1.6) reforça o ritmo editorial.

## Layout e espaçamento

- **Base 4px**; escala: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · **96 (seção)** · **128 (seção-lg)**.
- **Densidade generosa**: padding interno de card 24px; modal 32px; botões 48px de altura;
  inputs 56px (Airbnb).
- **Container máximo** ~1200px; grids de card 3-up → 2-up → 1-up.
- **Filosofia**: "aberto em cima, claro embaixo" — heroes com 128px de respiro, conteúdo
  com 96px entre seções. O espaço em branco É a decoração (Apple).

## Elevação

| Nível | Tratamento | Uso |
|---|---|---|
| 0 — Flat | sem sombra, sem borda | corpo, heroes, bandas |
| 1 — Hairline | borda 1px `{colors.hairline}` | cards em repouso, inputs |
| 2 — Float (único tier) | `0 0 0 1px rgba(0,0,0,.02), 0 2px 6px rgba(0,0,0,.04), 0 4px 8px rgba(0,0,0,.10)` | hover de card, dropdown, toast, modal |
| Scrim | `{colors.scrim}` a 50% | fundo de modal |

No tema escuro, elevação = superfície mais clara (`dark-surface-1` → `dark-surface-2`),
em degraus sutis e próximos. A sombra única em flutuantes (dropdown, modal, toast) fica
mais pesada que no claro (maior opacidade e alcance) — sombras leves somem sobre fundo
quase-preto, lição direta do Spotify, aplicada só ao tema escuro.

## Formas

| Token | Valor | Uso |
|---|---|---|
| `xs` 4px | chips mínimos, barras de progresso |
| `sm` 8px | **botões, inputs, selects** |
| `md` 14px | **cards, modais pequenos, toasts** |
| `lg` 20px | modais, imagens destacadas |
| `xl` 32px | bandas decorativas |
| `full` | pills, avatars, switch, badges, o botão sol/lua |

## Tema e alternância (sol/lua)

- Tokens vivem em `:root` (claro) e são redefinidos sob `[data-theme="dark"]`.
- `ZurThemeService` aplica `data-theme` no `<html>`, persiste em `localStorage`
  (`zur-theme`) e inicializa de `prefers-color-scheme`.
- `zur-theme-toggle` é um botão circular (`{rounded.full}`, 44px) que mostra o sol no tema
  escuro e a lua no claro (ícones SVG), com transição suave de 200ms nas cores globais.

## Componentes

### Fundamentos
- **`zur-button`** — variantes `primary` (menta + tinta), `secondary` (outline ink),
  `ghost` (texto) e `pill`; tamanhos `sm` 36px / `md` 48px / `lg` 56px.
- **`zur-badge`** — pill `{rounded.full}` nas cores soft (menta, success, warning, error, neutro).
- **`zur-card`** — superfície `{rounded.md}` com hairline; eleva ao tier único no hover
  quando `[interactive]`.
- **`zur-avatar`** — círculo 32/40/56px com iniciais ou imagem.

### Formulários (todos ControlValueAccessor)
- **`zur-input`** — 56px, label flutuante acima em `{typography.caption}`, foco = borda
  2px ink (sem glow, Airbnb), erro = borda `{colors.error}` + texto de ajuda.
- **`zur-select`** — mesmo chrome do input com dropdown no tier de sombra único.
- **`zur-checkbox`** / **`zur-radio`** — 20px, marcados em menta com check em tinta.
- **`zur-switch`** — trilho pill 44×24px; ligado = menta.
- **`zur-textarea`** — mesmo chrome do input, `resize: vertical`; contador opcional com `maxlength`.
- **`zur-combobox`** — input 56px com listbox filtrável no tier de sombra único; busca sem
  acento e por iniciais; opção ativa em surface-soft, escolhida em negrito com check menta.
- **`zur-date-picker`** — campo-botão 56px + calendário em painel `{rounded.md}`; dias 40px em
  círculo, **selecionado em pill ink** (Airbnb), hoje com ponto menta, faixa (`mode="range"`) em
  lozenge surface-strong com pontas arredondadas; fora de `min`/`max` riscado e muted.
- **`zur-file-upload`** — área tracejada 2px em surface-soft (ao arrastar: borda menta + fundo
  primary-soft); arquivos como cartões hairline `{rounded.md}` com `zur-progress` sm; o envio é
  da aplicação.
- **`zur-chips`** — campo com chips em pill primary-soft; Enter/vírgula adiciona, Backspace remove.
- **`zur-slider`** — trilha 6px surface-strong, preenchimento menta, controle 24px canvas com
  borda primary-active; valor único ou faixa (`range`).
- **`zur-segmented`** — trilho pill surface-strong; opção ativa em surface-raised com hairline
  (nunca menta sólido: é seleção, não ação).
- **`zur-number-input`** — spinbutton 56px com botões −/+ de 48px nas pontas e valor central em
  números tabulares; aceita "12,5" e "1.234,5"; limita a `min`/`max`.
- **`zur-otp-input`** — caixas 48×56px (sempre da esquerda para a direita, mesmo em RTL; números não
  se invertem), `autocomplete="one-time-code"`.
- **`zur-rating`** — estrelas em **ink** (como o Airbnb; a menta fica para ação), vazias em contorno
  muted; `readonly` aceita frações e é lido como "4,5 de 5".
- **`zur-time-picker`** — campo-botão + painel `{rounded.md}` com listas de hora e minuto (e AM/PM em
  12h); selecionado em pill ink, como os dias do date picker; fora de `min`/`max` riscado e muted.

### Navegação
- **`zur-navbar`** — 80px, canvas + hairline inferior; slots para logo, links e ações;
  hospeda o `zur-theme-toggle`.
- **`zur-tabs`** — tab ativa com sublinhado 2px ink (Airbnb product-tabs).
- **`zur-menu`** — dropdown no tier único de sombra, itens 40px.
- **`zur-breadcrumb`** — caption muted com separador "/".
- **`zur-sidenav`** / **`zur-sidenav-item`** / **`zur-sidenav-label`** — navegação lateral; item
  ativo em verde sólido (`primary` + `on-primary`), ícone opcional (`[zurSidenavIcon]`) que
  permanece quando a sidebar recolhe.

### Dados
- **`table[zur-table]`** — estilo para tabela nativa: cabeçalho em caption, hairline nas linhas,
  hover em surface-soft, densidade `comfortable`/`compact`; colunas ordenáveis com
  `th[zurSortable]` (`aria-sort` + `sortChange`).
- **`zur-pagination`** — anterior/próxima, números com reticências, página atual em menta sólido.
- **Tabela avançada** (sobre `table[zur-table]`; o componente avisa e a aplicação filtra, como na
  ordenação): `th[zurSelectAll]` + `td[zurSelect]` (checkbox 20px menta, linha selecionada em
  primary-soft, "todas" com estado indeterminado), `tr[zurRow]` + `button[zurExpandToggle]` (linha de
  detalhe em surface-soft), `zur-column-filter` (popover com campo; ponto menta quando ativo) e
  `zur-column-menu` (mostrar/ocultar colunas; nunca zera todas).
- **`zur-timeline`** — `<ol>` nativa; marcador de 24px (ponto ou ícone) ligado por linha hairline de
  2px; status em cores semânticas `soft` + o ativo em menta sólido; grupos por dia em caption uppercase.
- **`zur-tree`** — ARIA `tree` "achatado" (`aria-level`/`setsize`/`posinset`); nó selecionado em
  primary-soft; chevron gira ao abrir. ↑↓ →← Home End `*` e type-ahead.
- **`zur-chart`** — SVG próprio, sem dependências (veja "Gráficos" abaixo).
- **`zur-stat`** / **`zur-sparkline`** — indicador (KPI) em cartão `{rounded.md}`: rótulo muted, valor
  `{typography.display-md}` a 32px, variação com seta **e** sinal (cor = direção × se subir é bom;
  `invert` quando cair é bom) e mini-gráfico de 2px sobre uma lavagem a 10%.

### Conteúdo
- **`zur-logo`** — logo do Zuri (horizontal, símbolo ou auto); segue o tema por CSS variables.
- **`zur-accordion`** — seções expansíveis com hairline, uma aberta por vez (ou `multi`);
  setas/Home/End movem o foco.
- **`zur-empty-state`** — ícone em círculo menta-soft, título, descrição e ações, centralizados.
- **`zur-step`** — passo numerado: círculo menta sólido 28px com número em tinta + título
  `{typography.headline}`; conteúdo projetado abaixo.
- **`zur-stepper`** — etapas de um fluxo: círculo de 32px (atual em menta sólido, concluída em
  primary-soft, com erro em error-soft) ligado por linha de 2px; `linear` só deixa voltar. O nome do
  botão é o próprio texto visível + posição e estado em texto só para leitores de tela (WCAG 2.5.3).
- **`zur-carousel`** — slides com transição de 400ms, setas circulares 44px na sombra única,
  indicadores (o atual alonga para 24px). `autoplay` pausa ao focar/passar o mouse, tem botão de pausa
  e **fica desligado com `prefers-reduced-motion`**.
- **`zur-avatar-group`** — avatares sobrepostos (−8px) com anel de 2px da cor da superfície e contador
  "+N" lido por extenso.
- **`zur-banner`** — faixa de largura total nas cores `soft` semânticas; `status` (ou `alert` no erro).
  Diferente do `zur-alert`, que é inline no conteúdo.

### Feedback
- **`zur-modal`** — `{rounded.lg}`, padding 32px, scrim 50%, fecha por ESC/scrim.
- **`zur-toast`** — service + container; `{rounded.md}`, auto-dismiss 4s. O neutro é a
  superfície ink invertida; sucesso e erro usam a banda soft com o texto semântico
  (`success-soft`/`success-text`, `error-soft`/`error-text`), um fio de 30% e um ícone — assim o
  toast fica legível e discreto nos dois temas e a cor não é o único sinal. Verde/vermelho
  chapados com texto branco não passavam de 3,4:1 (claro) e 2:1 (escuro).
- **`zur-tooltip`** — directive; bolha ink 8px, caption invertida.
- **`zur-alert`** — bandas soft das cores semânticas com ícone e `{rounded.md}`.
- **`zur-spinner`** — anel menta 20/32/48px · **`zur-skeleton`** — pulso em surface-strong.
- **`zur-progress`** — barra 8px (ou 4px) em pill, preenchimento menta; indeterminada sem `value`.

### Sobreposição
- **`zur-drawer`** — painel lateral 400px em surface-raised com sombra única, scrim 50%; ESC,
  clique no fundo e foco preso, devolvido ao gatilho ao fechar.
- **`zur-popover`** — painel flutuante `{rounded.md}` ancorado ao `[zurPopoverTrigger]`; fecha com
  ESC ou clique fora.
- **`ZurDialog`** — `confirm()`/`alert()` devolvem `Promise`; `alertdialog` `{rounded.lg}` sobre scrim,
  foco preso e devolvido. Destrutivo: botão `danger` (`--zur-error-text` + `--zur-on-error`) e foco
  inicial em "Cancelar", o caminho seguro. `zur-modal` e `zur-drawer` também prendem o foco.
- **`zur-context-menu`** + `[zurContextMenu]` — botão direito, Shift+F10/tecla Menu ou toque longo;
  painel `position: fixed` na sombra única, que nunca sai da janela.

### Padrões compostos
Componentes de alto nível montados com os primitivos acima; nenhum token novo.
- **`zur-chat`** (+ `zur-chat-message`, `zur-chat-divider`, `zur-chat-typing`,
  `zur-chat-composer`) — área `role="log"` que gruda no fim (inclusive texto em streaming) a
  menos que o usuário suba; **bolha "me" em primary-soft, "them" em surface-soft**, ambas
  `{rounded.md}` com o canto do lado do autor em `{rounded.xs}`; mensagens seguidas do mesmo
  autor se agrupam (`continued`); compositor com campo pill que cresce e botão de envio
  circular menta.
- **`zur-command-palette`** — Ctrl/⌘+K; modal a 12vh do topo, `{rounded.lg}`, busca 60px,
  grupos em caption uppercase, item ativo em surface-soft com ícone em primary-soft, atalhos
  em `kbd`.
- **`zur-notification-center`** — sino circular 44px com contador menta; painel via
  `zur-popover` agrupado em Hoje/Anteriores, não lidas com ponto colorido e título em negrito.
- **`zur-kanban`** — colunas surface-soft `{rounded.md}`, cartões surface-raised hairline; ao
  arrastar, coluna-alvo em primary-soft e linha de inserção menta 3px; cartão pego pelo teclado
  ganha a sombra única + anel de foco. Drag and drop nativo + teclado (Espaço, setas, Esc),
  com anúncios `aria-live`.

## Gráficos

Cores categóricas em ordem **fixa e nunca cíclica**: `--zur-chart-1..6` (menta, azul, laranja,
violeta, magenta, amarelo). A sétima série vira "Outros" ou facetas. Os passos de cada tema foram
**validados com o validador de paleta da skill de dataviz** (alvo de separação para daltonismo ≥ 8 e
piso de visão normal ≥ 15; resultado: ΔE 13,2 / 19,6 no claro e 13,2 / 19,3 no escuro). Magenta e amarelo
ficam abaixo de 3:1 no claro, por isso o gráfico sempre mostra **legenda e tabela alternativa**.

- **Marcas:** barras ≤ 24px com 4px arredondados só no fim e base reta, 2px de ar entre fills; linhas de
  2px; marcadores de 8px com anel de 2px da superfície; áreas a 10%; grade e eixos em hairline sólida.
- **Texto nunca usa a cor da série** (valores, rótulos e legenda ficam em tokens de texto).
- **Interação:** tooltip no hover **e** no foco (←→ andam pelas categorias), com o valor em destaque;
  alvo de toque por categoria muito maior que a marca. Os mesmos dados existem em tabela `sr-only`.
- Movimento só de entrada (crescer/aparecer) e desligado com `prefers-reduced-motion`.
- O eixo X não espelha em RTL (dados não se invertem); as setas do teclado são físicas.

## Densidade

`[data-density='compact']` (na página, via `ZurDensityService`/`zur-density-toggle`, ou numa área, via
`zurDensity`) redefine `--zur-control-height-sm/md/lg` para 28/36/40px e a fonte do botão para 14px.
Campos de texto mantêm 16px (o iOS dá zoom abaixo disso). `table[zur-table]` herda a densidade da área.

## Direção de leitura (RTL)

Tudo usa **propriedades lógicas** (`margin-inline-start`, `inset-inline-end`, `border-start-start-radius`,
`text-align: start`). `--zur-dir` (1 ou −1) espelha o que precisa de transformação (setas, deslocamentos).
As setas ←→ seguem o sentido de leitura (`zurInlineStep`): em RTL, ← avança. Exceções deliberadas:
caixas do OTP e eixo dos gráficos (números/dados não se invertem), centralizações simétricas e as
coordenadas de ponteiro do tooltip/menu de contexto. `zur-drawer` aceita `start`/`end` (lógicos) além de
`left`/`right` (físicos).

## Formulários por sinais

Todos os controles funcionam com `[formField]` (Signal Forms do Angular 22), com `ngModel` e com
formulários reativos, sem adaptador: falam `ControlValueAccessor` e o Angular faz a ponte. As regras
`min`/`max` do formulário chegam aos controles que têm esses inputs (date picker, time picker, slider, número).

## Identidade — nome e logo

- **Nome:** **Zuri** (suaíli: "bonito"). Nome inventado, curto (2 sílabas), amigável e moderno.
  Pacote npm `@juau/zuri`; prefixo dos componentes `zur-` (`zur-button`, `zurThemeScope`,
  `--zur-primary`).
- **Logo:** **Z com broto** — um Z de traço grosso e pontas arredondadas, com uma folha no fim
  da barra superior, ao lado da wordmark `zuri` em traço contínuo; a pinta do "i" é um broto
  menta. Estilo orgânico/arredondado, coerente com a Nunito Sans e os cantos de 8–14px.
- **Cores:** só os tokens — símbolo em `{colors.primary-active}`, folha e pinta do "i" em
  `{colors.primary}`, texto em `{colors.ink}` (claro) / `{colors.dark-ink}` (escuro). Segue o
  tema sozinho via CSS variables.
- **Componente:** `zur-logo` — `variant="horizontal | symbol | auto"` (`auto` vira só o símbolo na
  sidebar recolhida) e `[size]` (altura em px).
- **Arquivos** (pasta `branding/`): `zuri-horizontal.svg` e `zuri-symbol.svg` (temáveis),
  versões `-light` e `-dark` com cores fixas, e `favicon.svg` (acompanha
  `prefers-color-scheme`).
- **Tamanho mínimo:** símbolo 16px; horizontal 24px de altura.
- **Não faça:** esticar, recolorir fora da paleta, trocar a ordem das cores, colocar o logo
  sobre fundo sem contraste.

## Layouts de página

Shells prontos que resolvem estrutura, largura, responsividade e tema. O guia de decisão
(tipo de app, conteúdo e público → layout) está em `LAYOUTS.md`; o comando `/zuri-layout`
recomenda e gera o esqueleto.

| Layout | Componente | Sidebar | Largura |
|---|---|---|---|
| Landing / descritiva | `zur-landing-layout` | — | `wide` ~1100px |
| Dashboard / admin | `zur-dashboard-layout` | recolhível | `fluid` |
| Lista e detalhe | `zur-list-detail-layout` | — (lista 360px) | `fluid` |
| Formulário e wizard | `zur-form-layout` | — | `reading` ~760px |
| Documentação | `zur-docs-layout` | recolhível | `reading` ~760px |
| Autenticação | `zur-auth-layout` | — | `narrow` ~440px |
| Erro e 404 | `zur-error-layout` | — | `narrow` ~440px |

**Peças:** `zur-sidebar`, `zur-sidenav`, `zur-topbar`, `zur-page-header`, `zur-breadcrumb`
e `zur-footer`. Breadcrumb, page-header e rodapé são slots **opcionais**.

**Comportamento:**
- **Largura por tipo de layout** (`fluid`, `wide`, `reading`, `narrow`); todo layout com
  container aceita o input `width` para trocar.
- **Sidebar** fixa no desktop e **recolhível pelo usuário** (72px, só ícones); no tablet
  começa recolhida; no mobile vira **gaveta** com scrim 50%, fechada por ESC ou toque fora.
- **Topbar** 64px, sticky; **some ao rolar para baixo e volta ao subir** (`hideOnScroll`,
  padrão ligado; respeita `prefers-reduced-motion`).
- **Breakpoints:** mobile < 768 · tablet 768–1023 · desktop ≥ 1024.
- **Superfícies:** shells de conteúdo usam `canvas`; autenticação usa `surface-soft` com o card
  em `surface-raised` + sombra flutuante (único tier).
- Só tokens `--zur-*`: funciona em claro e escuro sem ajuste.

## Do's and Don'ts

### Do
- Use a menta com parcimônia — um ou dois momentos de cor por tela (Airbnb).
- Mantenha texto escuro (`on-primary`) sobre menta — nunca branco.
- Respeite os três degraus de raio: 8 (controles), 14 (cards), full (pills).
- Use a sombra única SOMENTE em superfícies flutuantes.
- Dê 96px+ entre seções; deixe o branco trabalhar.
- No escuro, suba superfícies em vez de adicionar sombras.

### Don't
- Não introduza uma segunda cor de marca; semânticas são só para feedback.
- Não use cinzas puros — todo neutro carrega tintura sage.
- Não use pesos abaixo de 400 nem acima de 800.
- Não crie novos tiers de sombra.
- Não use preto puro (#000) como texto ou canvas — a tinta é verde-profunda.
- Não esqueça o estado `prefers-color-scheme` na primeira visita.

## Acessibilidade

- Menta + on-primary: contraste ≥ 7:1 (AAA). Ink sobre canvas: ≥ 13:1.
- Alvos de toque ≥ 44px (botões 48px, toggle 44px, dias de calendário 40px+padding).
- Anel de foco visível: 2px `{colors.primary}` com offset 2px em todo elemento interativo
  no tema claro. No tema escuro, o anel é mais discreto — uma única linha de 2px na menta,
  sem o halo duplo do claro — inspirado na sobriedade do foco no Spotify.
- O toggle sol/lua expõe `aria-label` dinâmico ("Ativar tema escuro"/"Ativar tema claro")
  e `aria-pressed`.
- Textos internos dos componentes (`aria-label` do fechar, "Voltar", rótulos de regiões) vêm
  do token `ZUR_I18N`: português por padrão, inglês com `provideZuriI18n('en')`.
- Todo botão cujo texto visível faz parte do nome acessível (WCAG 2.5.3 "rótulo no nome"): o stepper compõe
  o nome a partir do próprio conteúdo em vez de um `aria-label` que o contradiga.
- Componentes compostos seguem os padrões ARIA: combobox (`aria-activedescendant`), grade do
  calendário com roving tabindex, `radiogroup` no segmented, `role="slider"` por controle, chat em
  `role="log"`, paleta como diálogo modal com foco devolvido, e kanban movível 100% pelo teclado
  com anúncios em `aria-live` (nunca só arrastar com mouse).
- Cada story do Storybook roda como teste com o axe (`npm run test:stories`); violação de
  acessibilidade quebra o CI.
