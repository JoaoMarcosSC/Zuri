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
| Fundamentos | `button[zur-button]`, `zur-badge`, `zur-card`, `zur-avatar` |
| Formulários | `zur-input`, `zur-textarea`, `zur-select`, `zur-checkbox`, `zur-radio`, `zur-switch` (todos ControlValueAccessor) |
| Navegação | `zur-navbar`, `zur-tabs`/`zur-tab`, `zur-menu`/`zur-menu-item`, `zur-breadcrumb`, `zur-sidenav`/`zur-sidenav-item`/`zur-sidenav-label` |
| Dados | `table[zur-table]` + `th[zurSortable]`, `zur-pagination` |
| Conteúdo | `zur-step`, `zur-accordion`, `zur-empty-state` |
| Sobreposição | `zur-drawer`, `zur-popover` + `[zurPopoverTrigger]` |
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

## Desenvolvimento

```bash
ng build zuri        # build da library (ng-packagr) → dist/zuri
npm run storybook     # catálogo interativo de componentes
```
