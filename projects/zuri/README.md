# Zuri

Design system Angular de atmosfera **amigável-consumer** com paleta **verde-menta**,
tipografia arredondada (Nunito Sans), formas suaves e **tema claro/escuro** alternável
por um botão sol/lua. A especificação completa vive em [`DESIGN.md`](../../DESIGN.md)
na raiz do repositório.

Inspirações (via `awesome-design-md`): Airbnb (formato e sombra única), Jobright/Wise
(paleta menta), Apple/ElevenLabs (densidade generosa), MongoDB/Mercury (dark com
tintura verde).

## Instalação

```bash
ng add @juau/zuri
```

O `ng add` instala o pacote e configura os tokens, a fonte Nunito Sans e o estilo base do `body`. Para fazer à mão, use `npm install @juau/zuri` e siga o setup abaixo.

## Setup

1. Importe os tokens no `styles.css` global da aplicação:

```css
@import '@juau/zuri/styles/tokens.css';

/* fonte do sistema */
@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;500;600;700;800&display=swap');

body {
  margin: 0;
  background: var(--zur-canvas);
  color: var(--zur-body);
  font: var(--zur-font-body);
  transition: background-color 200ms ease, color 200ms ease;
}
```

2. Coloque o toggle de tema (sol/lua) na navbar e o container de toasts no shell:

```html
<zur-navbar>
  <strong zurNavbarLogo>Casa Verde</strong>
  <ng-container zurNavbarLinks>
    <a href="#">Início</a>
    <a href="#">Plantas</a>
  </ng-container>
  <ng-container zurNavbarActions>
    <zur-theme-toggle />
  </ng-container>
</zur-navbar>

<zur-toast-container />
```

O `ZurThemeService` aplica `data-theme="dark"` no `<html>`, persiste a escolha em
`localStorage` (`zur-theme`) e respeita `prefers-color-scheme` na primeira visita.

## Componentes

| Grupo | Componentes |
|---|---|
| Tema e marca | `ZurThemeService`, `zur-theme-toggle`, `[zurThemeScope]` (tema isolado), `zur-logo` |
| Fundamentos | `button[zur-button]`, `zur-badge`, `zur-card`, `zur-avatar`, `zur-avatar-group`, `zur-icon` (+ conjunto de 47 ícones), `button[zur-icon-button]`, `button[zur-fab]`, `a[zur-link]`, `zur-divider` |
| Formulários | `zur-input`, `zur-textarea`, `zur-select`, `zur-checkbox`, `zur-radio`, `zur-switch`, `zur-combobox`, `zur-date-picker`, `zur-chips`, `zur-slider`, `zur-segmented`, `zur-number-input`, `zur-otp-input`, `zur-rating`, `zur-time-picker`, `zur-search`, `zur-inline-edit`, `zur-chip` + `zur-chip-group`, `zur-combobox` com `multiple` (todos ControlValueAccessor e compatíveis com `[formField]`), `zur-file-upload` |
| Navegação | `zur-navbar`, `zur-tabs`/`zur-tab`, `zur-menu`/`zur-menu-item`, `zur-breadcrumb`, `zur-sidenav`/`zur-sidenav-item`/`zur-sidenav-label`, `zur-bottom-nav` + `a[zur-bottom-nav-item]` |
| Dados | `table[zur-table]` (+ `zurSelectAll`, `zurSelect`, `zurRow`, `zurExpandToggle`, `zur-column-filter`, `zur-column-menu`), `zur-pagination`, `zur-chart`, `zur-stat`, `zur-sparkline`, `zur-timeline`, `zur-tree`, `zur-list` + `zur-list-item`, `zur-table-toolbar`, `th[zurResizable]`, `tbody[zurTableSkeleton]`, `zur-code-snippet` |
| Conteúdo | `zur-step`, `zur-stepper`, `zur-carousel`, `zur-avatar-group`, `zur-banner`, `zur-accordion`, `zur-empty-state` |
| Sobreposição | `zur-drawer` (inclusive `side="bottom"`, o bottom sheet), `zur-popover` + `[zurPopoverTrigger]`, `ZurDialog` (`confirm`/`alert`), `zur-context-menu` + `[zurContextMenu]` |
| Plataforma | `zurDensity` / `ZurDensityService` / `zur-density-toggle` (densidade compacta), RTL em todos os componentes, `tokens.json` e presets do Tailwind (v3 e v4) |
| Padrões | `zur-chat` (+ `-message`, `-divider`, `-typing`, `-composer`), `zur-command-palette`, `zur-notification-center`, `zur-kanban` + `ng-template[zurKanbanCard]` |
| Layouts de página | `zur-landing-layout`, `zur-dashboard-layout`, `zur-list-detail-layout`, `zur-form-layout`, `zur-docs-layout`, `zur-auth-layout`, `zur-error-layout` + `zur-sidebar`, `zur-topbar`, `zur-page-header`, `zur-footer` — veja [`LAYOUTS.md`](../../LAYOUTS.md) |
| Feedback | `zur-modal`, `ZurToastService` + `zur-toast-container`, `[zurTooltip]`, `zur-alert`, `zur-spinner`, `zur-skeleton`, `zur-progress` |

### Exemplos

```html
<button zur-button variant="primary" size="md">Comprar</button>
<button zur-button variant="secondary">Cancelar</button>

<zur-badge color="success">Entregue</zur-badge>

<zur-input label="E-mail" placeholder="voce@exemplo.com" [(ngModel)]="email" />

<zur-switch [(ngModel)]="notificacoes">Receber notificações</zur-switch>

<zur-tabs>
  <zur-tab label="Descrição">…</zur-tab>
  <zur-tab label="Avaliações">…</zur-tab>
</zur-tabs>

<zur-modal [(open)]="aberto" title="Confirmar pedido">
  Deseja confirmar o pedido?
  <div zurModalActions>
    <button zur-button variant="ghost" (click)="aberto = false">Voltar</button>
    <button zur-button variant="primary">Confirmar</button>
  </div>
</zur-modal>
```

```html
<zur-combobox label="Planta" [options]="plantas" [(ngModel)]="planta" />
<zur-date-picker label="Período" mode="range" [(ngModel)]="periodo" />

<zur-chat style="height: 480px">
  @for (m of mensagens(); track m.id) {
    <zur-chat-message [from]="m.from" [author]="m.autor">{{ m.texto }}</zur-chat-message>
  }
  <zur-chat-composer (send)="enviar($event)" />
</zur-chat>

<zur-command-palette [commands]="comandos" (selected)="executar($event)" />  <!-- Ctrl+K -->
```

```ts
// toasts
private toast = inject(ZurToastService);
this.toast.show('Pedido confirmado!', 'success');
```

## Idioma

Os textos internos (rótulos de acessibilidade, "Voltar", "Fechar") vêm em português. Para inglês:

```ts
bootstrapApplication(App, { providers: [provideZuriI18n('en')] });
```

## Densidade e direção

```html
<html data-density="compact" dir="rtl">          <!-- página toda -->
<section zurDensity>…formulário denso…</section>   <!-- só uma área -->
```

`ZurDensityService` e `zur-density-toggle` alternam a densidade da página e lembram a escolha.
Todos os componentes usam propriedades lógicas e suas setas seguem o sentido de leitura, então RTL
funciona só com `dir="rtl"`.

## Formulários por sinais

Os controles funcionam com `ngModel`, com formulários reativos **e** com os Signal Forms do Angular:

```html
<zur-input label="Nome" [formField]="f.nome" />
<zur-date-picker label="Entrega" [formField]="f.entrega" />
```

## Tailwind e Figma

```js
// Tailwind v3: tailwind.config.js
module.exports = { presets: [require('@juau/zuri/tailwind.preset.cjs')] };
```

```css
/* Tailwind v4 */
@import 'tailwindcss';
@import '@juau/zuri/tailwind-theme.css';
```

`@juau/zuri/tokens.json` traz todos os tokens no formato W3C Design Tokens, com os dois temas.

## Desenvolvimento

```bash
ng build zuri        # build da library (ng-packagr) → dist/zuri
npm run storybook     # catálogo interativo de componentes
```
