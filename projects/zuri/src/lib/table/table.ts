import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { ZUR_I18N } from '../i18n/i18n';

export type ZurTableDensity = 'comfortable' | 'compact';
export type ZurSortDirection = 'asc' | 'desc';

export interface ZurSort {
  key: string;
  direction: ZurSortDirection;
}

/** Texto de filtro de uma coluna (`value` vazio = sem filtro). */
export interface ZurColumnFilterChange {
  key: string;
  value: string;
}

/**
 * Estilo do Zuri para uma `<table>` nativa: cabeçalho em caption, linhas com
 * hairline, hover e densidade. A ordenação fica com você: marque as colunas com
 * `zurSortable` e reaja ao `sortChange`.
 *
 * ```html
 * <table zur-table (sortChange)="ordenar($event)">
 *   <thead>
 *     <tr><th zurSortable="nome">Nome</th><th>Produto</th></tr>
 *   </thead>
 *   <tbody>…</tbody>
 * </table>
 * ```
 */
@Component({
  selector: 'table[zur-table]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // As linhas e células vêm do template de quem usa, então os estilos precisam ser
  // globais; todos ficam presos ao seletor table[zur-table].
  encapsulation: ViewEncapsulation.None,
  host: { class: 'zur-table', '[attr.data-density]': 'density()' },
  template: `<ng-content />`,
  styles: `
    table.zur-table {
      width: 100%;
      border-collapse: collapse;
      font: var(--zur-font-body-sm);
      color: var(--zur-body);
    }
    table.zur-table th,
    table.zur-table td {
      padding: var(--zur-space-sm) var(--zur-space-md);
      text-align: start;
      border-bottom: 1px solid var(--zur-hairline-soft);
    }
    table.zur-table[data-density='compact'] th,
    table.zur-table[data-density='compact'] td,
    [data-density='compact'] table.zur-table:not([data-density='comfortable']) th,
    [data-density='compact'] table.zur-table:not([data-density='comfortable']) td {
      padding: var(--zur-space-xs) var(--zur-space-sm);
    }
    table.zur-table thead th {
      font: var(--zur-font-caption);
      color: var(--zur-muted);
      text-transform: uppercase;
      letter-spacing: 0.4px;
      border-bottom-color: var(--zur-hairline);
      white-space: nowrap;
    }
    table.zur-table tbody tr {
      transition: background-color 120ms ease;
    }
    table.zur-table tbody tr:hover {
      background: var(--zur-surface-soft);
    }
    table.zur-table tbody td {
      color: var(--zur-ink);
    }
    table.zur-table .zur-sort {
      display: inline-flex;
      align-items: center;
      gap: var(--zur-space-xxs);
      padding: 0;
      border: 0;
      background: none;
      font: inherit;
      color: inherit;
      text-transform: inherit;
      letter-spacing: inherit;
      cursor: pointer;
    }
    table.zur-table .zur-sort:hover {
      color: var(--zur-ink);
    }
    table.zur-table .zur-sort:focus-visible {
      outline: none;
      border-radius: var(--zur-radius-xs);
      box-shadow: var(--zur-focus-ring);
    }
    table.zur-table th[aria-sort='ascending'] .zur-sort,
    table.zur-table th[aria-sort='descending'] .zur-sort {
      color: var(--zur-ink);
    }

    /* texto só para leitores de tela (ex.: nome de uma coluna sem título visível) */
    table.zur-table .zur-sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }

    /* seleção de linhas */
    table.zur-table tbody tr[aria-selected='true'] {
      background: var(--zur-primary-soft);
    }
    table.zur-table th[zurSelectAll],
    table.zur-table td[zurSelect],
    table.zur-table td:has(> button[zurExpandToggle]) {
      width: 1%;
      white-space: nowrap;
    }
    table.zur-table .zur-check {
      appearance: none;
      position: relative;
      display: inline-block;
      vertical-align: middle;
      width: 20px;
      height: 20px;
      margin: 0;
      border: 2px solid var(--zur-hairline);
      border-radius: var(--zur-radius-xs);
      background: var(--zur-canvas);
      cursor: pointer;
      transition: background-color 120ms ease, border-color 120ms ease;
    }
    table.zur-table .zur-check:checked,
    table.zur-table .zur-check:indeterminate {
      background: var(--zur-primary);
      border-color: var(--zur-primary);
    }
    table.zur-table .zur-check:checked::after {
      content: '';
      position: absolute;
      inset-block-start: 1px;
      inset-inline-start: 5px;
      width: 5px;
      height: 10px;
      border: solid var(--zur-on-primary);
      border-width: 0 2.5px 2.5px 0;
      transform: rotate(45deg);
    }
    table.zur-table .zur-check:indeterminate::after {
      content: '';
      position: absolute;
      inset-block-start: 7px;
      inset-inline: 3px;
      height: 2.5px;
      background: var(--zur-on-primary);
      border-radius: 2px;
    }
    table.zur-table .zur-check:focus-visible {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }

    /* linha expansível */
    table.zur-table .zur-expand {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      padding: 0;
      border: 0;
      border-radius: var(--zur-radius-full);
      background: none;
      color: var(--zur-muted);
      cursor: pointer;
    }
    table.zur-table .zur-expand:hover {
      background: var(--zur-surface-strong);
      color: var(--zur-ink);
    }
    table.zur-table .zur-expand:focus-visible {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
    table.zur-table .zur-expand svg {
      transition: transform 120ms ease;
    }
    table.zur-table .zur-expand[aria-expanded='true'] svg {
      transform: rotate(90deg);
    }
    table.zur-table tbody tr.zur-row-detail {
      background: var(--zur-surface-soft);
    }
    table.zur-table tbody tr.zur-row-detail:hover {
      background: var(--zur-surface-soft);
    }
    @media (prefers-reduced-motion: reduce) {
      table.zur-table .zur-expand svg {
        transition: none;
      }
    }
  `,
})
export class ZurTable {
  /** Sem valor, segue a densidade da área (`zurDensity`) ou da página; senão é confortável. */
  readonly density = input<ZurTableDensity | null>(null);
  /** Emite a coluna e a direção sempre que o usuário ordena. */
  readonly sortChange = output<ZurSort>();

  readonly sort = signal<ZurSort | null>(null);

  /** Ids das linhas selecionadas (two-way). Veja `tr[zurRow]`, `th[zurSelectAll]` e `td[zurSelect]`. */
  readonly selected = model<string[]>([]);
  /** Emite quando o texto de filtro de uma coluna muda (`zur-column-filter`). */
  readonly filterChange = output<ZurColumnFilterChange>();
  /** Filtros ativos por coluna. */
  readonly filters = signal<Record<string, string>>({});

  /** Linhas registradas (`tr[zurRow]`), na ordem em que aparecem. */
  readonly rowIds = signal<string[]>([]);
  readonly allSelected = computed(() => {
    const ids = this.rowIds();
    return ids.length > 0 && ids.every((id) => this.selected().includes(id));
  });
  readonly someSelected = computed(() => !this.allSelected() && this.rowIds().some((id) => this.selected().includes(id)));

  registerRow(id: string): void {
    this.rowIds.update((ids) => (ids.includes(id) ? ids : [...ids, id]));
  }

  unregisterRow(id: string): void {
    this.rowIds.update((ids) => ids.filter((i) => i !== id));
  }

  isSelected(id: string): boolean {
    return this.selected().includes(id);
  }

  toggleRow(id: string): void {
    this.selected.update((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]));
  }

  /** Marca todas as linhas (ou, se já estão todas marcadas, desmarca). */
  toggleAll(): void {
    const rows = this.rowIds();
    this.selected.update((ids) =>
      this.allSelected() ? ids.filter((id) => !rows.includes(id)) : [...new Set([...ids, ...rows])],
    );
  }

  setFilter(key: string, value: string): void {
    this.filters.update((f) => ({ ...f, [key]: value }));
    this.filterChange.emit({ key, value });
  }

  toggleSort(key: string): void {
    const current = this.sort();
    const direction: ZurSortDirection =
      current?.key === key && current.direction === 'asc' ? 'desc' : 'asc';
    const next = { key, direction };
    this.sort.set(next);
    this.sortChange.emit(next);
  }
}

/** Torna um `<th>` ordenável dentro de `table[zur-table]`. O valor é a chave da coluna. */
@Component({
  selector: 'th[zurSortable]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.aria-sort]': 'ariaSort()' },
  template: `
    <button type="button" class="zur-sort" (click)="table.toggleSort(zurSortable())">
      <ng-content />
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        @switch (ariaSort()) {
          @case ('ascending') { <path d="m6 15 6-6 6 6" /> }
          @case ('descending') { <path d="m6 9 6 6 6-6" /> }
          @default { <path d="m8 10 4-4 4 4M8 14l4 4 4-4" /> }
        }
      </svg>
    </button>
    <ng-content select="zur-column-filter" />
  `,
})
export class ZurSortable {
  protected readonly table = inject(ZurTable);
  readonly zurSortable = input.required<string>();

  protected readonly ariaSort = computed(() => {
    const s = this.table.sort();
    if (!s || s.key !== this.zurSortable()) return 'none';
    return s.direction === 'asc' ? 'ascending' : 'descending';
  });
}


/**
 * Linha de dados identificada por `zurRow` (o id usado na seleção). Habilita a seleção por
 * checkbox, o "marcar todas" e a expansão. Use `#r="zurRow"` para ler `r.expanded()`.
 *
 * ```html
 * <tr [zurRow]="pedido.id" #r="zurRow">
 *   <td zurSelect></td>
 *   <td><button zurExpandToggle></button></td>
 *   <td>{{ pedido.cliente }}</td>
 * </tr>
 * @if (r.expanded()) { <tr class="zur-row-detail"><td colspan="3">Detalhes…</td></tr> }
 * ```
 */
@Directive({
  selector: 'tr[zurRow]',
  exportAs: 'zurRow',
  host: { '[attr.aria-selected]': 'selected() || null', '[attr.data-row]': 'zurRow()' },
})
export class ZurTableRow {
  private readonly table = inject(ZurTable);

  readonly zurRow = input.required<string>();
  readonly expanded = model(false);
  readonly selected = computed(() => this.table.isSelected(this.zurRow()));

  constructor() {
    effect((onCleanup) => {
      const id = this.zurRow();
      this.table.registerRow(id);
      onCleanup(() => this.table.unregisterRow(id));
    });
  }

  toggle(): void {
    this.expanded.update((v) => !v);
  }
}

/** Checkbox de seleção da linha, dentro de `tr[zurRow]`. */
@Component({
  selector: 'td[zurSelect]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <input
      type="checkbox"
      class="zur-check"
      [attr.aria-label]="i18n.selectRow"
      [checked]="row.selected()"
      (change)="table.toggleRow(row.zurRow())"
    />
  `,
})
export class ZurRowSelect {
  protected readonly i18n = inject(ZUR_I18N);
  protected readonly table = inject(ZurTable);
  protected readonly row = inject(ZurTableRow);
}

/** Checkbox "selecionar todas" do cabeçalho, com estado indeterminado. */
@Component({
  selector: 'th[zurSelectAll]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <input
      type="checkbox"
      class="zur-check"
      [attr.aria-label]="i18n.selectAllRows"
      [checked]="table.allSelected()"
      [indeterminate]="table.someSelected()"
      (change)="table.toggleAll()"
    />
  `,
})
export class ZurSelectAll {
  protected readonly i18n = inject(ZUR_I18N);
  protected readonly table = inject(ZurTable);
}

/** Botão que abre e fecha os detalhes da linha (`tr[zurRow]`). */
@Component({
  selector: 'button[zurExpandToggle]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    type: 'button',
    class: 'zur-expand',
    '[attr.aria-expanded]': 'row.expanded()',
    '[attr.aria-label]': 'row.expanded() ? i18n.collapseRow : i18n.expandRow',
    '(click)': 'row.toggle()',
  },
  template: `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
  `,
})
export class ZurExpandToggle {
  protected readonly i18n = inject(ZUR_I18N);
  protected readonly row = inject(ZurTableRow);
}
