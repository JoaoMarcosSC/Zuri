# Migrar para o Zuri

Troque **uma tela por vez**, preservando comportamento: bindings, rotas, validações e testes. Depois de
cada tela, compile e rode os testes. Consulte o `catalogo.md` para as entradas exatas de cada componente.

## Equivalências

| O que existe | Zuri |
|---|---|
| `<button>` / `mat-button` / `mat-raised-button` / `btn btn-primary` / `p-button` | `<button zur-button variant="primary">` (`secondary`, `ghost`, `pill`, `danger`; `size="sm\|md\|lg"`) |
| `mat-icon-button` / botão só com ícone | `<button zur-icon-button label="…"><zur-icon [icon]="…" /></button>` |
| `mat-fab` / botão flutuante | `<button zur-fab label="…">` ou `extended` |
| `<a>` estilizado | `<a zur-link>` (`external` para outra aba) |
| `<input>` / `mat-form-field` + `matInput` / `form-control` / `pInputText` | `<zur-input label="…">` |
| `<textarea>` | `<zur-textarea>` |
| `<select>` / `mat-select` / `form-select` / `p-dropdown` | `<zur-select [options]>` (lista curta) ou `<zur-combobox [options]>` (com busca) |
| `mat-select multiple` / `p-multiSelect` | `<zur-combobox multiple [options]>` |
| `mat-autocomplete` / `p-autoComplete` | `<zur-combobox>` |
| `mat-checkbox` / `form-check` | `<zur-checkbox>` |
| `mat-radio-group` | `<zur-radio>` (mesmo `name`) ou `<zur-segmented>` / `<zur-chip-group mode="single">` |
| `mat-slide-toggle` / `form-switch` | `<zur-switch>` |
| `mat-slider` | `<zur-slider>` |
| `mat-datepicker` / `p-calendar` | `<zur-date-picker>` (faixa com `range`) |
| `mat-chip-listbox` / filtros em pílula | `<zur-chip-group>` + `<zur-chip>` |
| `mat-chip-grid` (digitar tags) | `<zur-chips>` |
| campo de busca | `<zur-search>` |
| `mat-button-toggle-group` / `btn-group` | `<zur-segmented>` |
| `mat-table` / `table table-striped` / `p-table` | `<table zur-table>` + `th[zurSortable]`, `tr[zurRow]`, `td[zurSelect]` … |
| `mat-paginator` / `pagination` | `<zur-pagination>` |
| `mat-list` / `list-group` | `<zur-list>` + `<zur-list-item>` |
| `mat-tab-group` / `nav-tabs` | `<zur-tabs>` + `<zur-tab>` |
| `mat-menu` / `dropdown-menu` | `<zur-menu>` + `<zur-menu-item>` |
| `mat-sidenav` / `offcanvas` | `<zur-drawer>` (lateral) ou `side="bottom"` (bottom sheet) |
| `mat-dialog` / `modal` / `p-dialog` | `<zur-modal>`; confirmação simples: `ZurDialog.confirm()` |
| `mat-snack-bar` / `toast` | `ZurToastService.show()` + `<zur-toast-container />` no shell |
| `mat-tooltip` / `data-bs-toggle="tooltip"` | `[zurTooltip]` |
| `mat-expansion-panel` / `accordion` | `<zur-accordion>` + `<zur-accordion-item>` |
| `mat-progress-bar` / `progress` | `<zur-progress>` |
| `mat-spinner` / `spinner-border` | `<zur-spinner>`; carregamento de conteúdo: `<zur-skeleton>` |
| `mat-stepper` | `<zur-stepper>` + `<zur-stepper-step>` |
| `mat-card` / `card` | `<zur-card>` |
| `mat-toolbar` / `navbar` | `<zur-topbar>` (área logada) ou `<zur-navbar>` (site) |
| badge / tag / label | `<zur-badge color="…">` |
| alerta / `alert alert-*` | `<zur-alert kind="…">`; faixa no topo: `<zur-banner>` |
| `mat-tree` | `<zur-tree>` |
| gráficos (Chart.js, ngx-charts) | `<zur-chart>`, `<zur-stat>`, `<zur-sparkline>` |

## Estilos
- Cores, sombras e raios fixos viram tokens `--zur-*` (veja `regras.md`).
- Classes utilitárias do Bootstrap/Tailwind de cor podem ficar no começo; com Tailwind, use o preset do
  Zuri (`@juau/zuri/tailwind.preset.cjs` ou `@juau/zuri/tailwind-theme.css`) para `bg-primary`, `text-ink`…
- Tema do Angular Material: remova o tema por último, quando nenhuma tela usar mais `mat-*`.

## Ordem segura
1. Instale o Zuri ao lado do que existe (os estilos convivem).
2. Migre o shell (layout, navegação) para um `zur-*-layout`.
3. Migre tela por tela, começando pela mais simples. Compile e teste a cada tela.
4. Remova a biblioteca antiga quando nada mais a importar.
